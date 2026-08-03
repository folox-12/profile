<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { useDarkModeClass } from '@/composable/useDarkModeClass';

const props = withDefaults(defineProps<{
    /** Высота области под сцену в px; по ширине она растягивается на весь контейнер */
    size?: number;
    /** Ник в приглашении терминала на экране */
    screenUser?: string;
    /** Текст, который печатается на экране во время загрузки */
    screenText?: string;
    /** Проигрывать полноэкранное интро при первой загрузке */
    intro?: boolean;
    /** Приложения на экране: пока список не пуст, ноутбук разворачивается к зрителю и показывает их */
    apps?: { name: string, preview?: string }[];
}>(), {
    size: 300,
    screenUser: 'vasilev_sergey',
    screenText: 'Frontend Developer',
    intro: true,
    apps: () => []
});

const host = ref<HTMLDivElement | null>(null);
const stage = ref<HTMLDivElement | null>(null);
const { isDark } = useDarkModeClass();

type Phase = 'loading' | 'landing' | 'done';

const phase = ref<Phase>('done');

const PALETTE = {
    light: {
        body: 0xeee6d6,
        deck: 0xd8cfbc,
        edge: 0x7cc79c,
        key: 0xffffff,
        fill: 0xfbf3e6,
        screenText: '#b7ecd1'
    },
    dark: {
        body: 0x32363c,
        deck: 0x262a2f,
        edge: 0x3d9478,
        key: 0xdff5ec,
        fill: 0x22262b,
        screenText: '#7ee0b8'
    }
};

// Базовый разворот в три четверти — без него ноутбук читается как плоский прямоугольник
const BASE_ROTATION_X = -0.22;
const BASE_ROTATION_Y = -0.38;

const LID_CLOSED = -1.52;
const LID_OPEN = -0.28;

// Разворот «лицом к зрителю», когда на экране показываются приложения
const FACE_ROTATION_X = -0.12;
const FACE_ROTATION_Y = 0;
// Скорость доворота и мигания экрана при смене содержимого
const FACE_EASING = 3;
const SCREEN_BLINK = 160;

// Тайминги интро в мс от старта сцены
const LID_OPEN_FROM = 150;
const LID_OPEN_TO = 900;
const SCREEN_ON_AT = 950;
const TYPING_FROM = 1150;
const TYPING_SPEED = 45;
const HOLD_AFTER_TYPING = 550;
const FLIGHT_DURATION = 900;

// Холостое вращение, рад/с
const SPIN_SPEED = 0.4;
// Стартовая раскрутка: пять оборотов, затухающих до холостой скорости
const SPIN_BOOST_TURNS = 5;
const SPIN_BOOST_DURATION = 3000;
// Раскрутка мышью: рад на пиксель, затухание инерции и предел наклона по вертикали
const DRAG_SENSITIVITY = 0.009;
const DRAG_FRICTION = 2.6;
const DRAG_LIMIT_X = 0.85;

const SCREEN_TEXTURE_W = 640;
const SCREEN_TEXTURE_H = 400;

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let laptop: THREE.Group | null = null;
let hinge: THREE.Group | null = null;
let bodyMaterial: THREE.MeshStandardMaterial | null = null;
let deckMaterial: THREE.MeshStandardMaterial | null = null;
let screenMaterial: THREE.MeshStandardMaterial | null = null;
let edgeMaterial: THREE.LineBasicMaterial | null = null;
let keyLight: THREE.DirectionalLight | null = null;
let fillLight: THREE.HemisphereLight | null = null;
let screenCanvas: HTMLCanvasElement | null = null;
let screenContext: CanvasRenderingContext2D | null = null;
let screenTexture: THREE.CanvasTexture | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let flightTimer = 0;

let prefersReducedMotion = false;
let introStartedAt = 0;
let bodyOverflow = '';
// Что сейчас нарисовано на экране — чтобы не перерисовывать текстуру каждый кадр
let drawnChars = -1;
let drawnCaret = false;
let screenIsOn = false;
let spinAngle = 0;
let faceOffset = 0;
let baseRotationX = BASE_ROTATION_X;
let blinkTimer = 0;
let boostAngle = 0;
let boostStartedAt = 0;
let lastFrameAt = 0;

// Ручная раскрутка: накопленный поворот, скорость по инерции и состояние захвата
const dragged = { x: 0, y: 0 };
const dragVelocity = { x: 0, y: 0 };
const dragPrev = { x: 0, y: 0 };
const isDragging = ref(false);
let dragPointerId = -1;

const appImages = new Map<string, HTMLImageElement>();

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

/** Приводит угол к диапазону (-PI, PI] — чтобы доворачивать по кратчайшей дуге */
const wrapAngle = (value: number) => Math.atan2(Math.sin(value), Math.cos(value));

const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();

    if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, r);
        return;
    }

    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

/** Картинка вписывается в плитку по короткой стороне, лишнее обрезается */
const drawCover = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) => {
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - side) / 2;
    const sy = (image.naturalHeight - side) / 2;

    ctx.drawImage(image, sx, sy, side, side, x, y, size, size);
};

const drawDesktop = (ctx: CanvasRenderingContext2D) => {
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;
    const barHeight = 46;

    ctx.fillStyle = '#171d23';
    ctx.fillRect(0, 0, SCREEN_TEXTURE_W, barHeight);

    ctx.fillStyle = 'rgba(255, 255, 255, .22)';

    [30, 58, 86].forEach((cx) => {
        ctx.beginPath();
        ctx.arc(cx, barHeight / 2, 7, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = '24px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, .4)';
    ctx.fillText(`${props.screenUser} — ~/works`, SCREEN_TEXTURE_W / 2, barHeight / 2);

    const tile = 120;
    const gap = 44;
    const apps = props.apps.slice(0, 3);
    const startX = (SCREEN_TEXTURE_W - (apps.length * tile + (apps.length - 1) * gap)) / 2;
    const top = 128;

    apps.forEach((app, index) => {
        const x = startX + index * (tile + gap);
        const image = app.preview ? appImages.get(app.preview) : undefined;

        ctx.save();
        roundedRect(ctx, x, top, tile, tile, 24);
        ctx.clip();

        if (image?.complete && image.naturalWidth) {
            drawCover(ctx, image, x, top, tile);
        } else {
            ctx.fillStyle = palette.screenText;
            ctx.fillRect(x, top, tile, tile);
        }

        ctx.restore();

        ctx.save();
        roundedRect(ctx, x + 0.5, top + 0.5, tile - 1, tile - 1, 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, .2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.font = '22px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, .75)';
        ctx.fillText(app.name, x + tile / 2, top + tile + 32);
    });

    ctx.textAlign = 'left';
};

const drawScreen = (chars: number, caret: boolean) => {
    if (!screenContext || !screenTexture) {
        return;
    }

    const ctx = screenContext;
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;

    ctx.fillStyle = screenIsOn ? '#0e1317' : '#05070a';
    ctx.fillRect(0, 0, SCREEN_TEXTURE_W, SCREEN_TEXTURE_H);

    if (!screenIsOn) {
        screenTexture.needsUpdate = true;
        return;
    }

    if (props.apps.length) {
        drawDesktop(ctx);
        screenTexture.needsUpdate = true;
        return;
    }

    ctx.textBaseline = 'middle';

    ctx.font = '32px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, .32)';
    ctx.fillText(`${props.screenUser}:~$ whoami`, 56, SCREEN_TEXTURE_H / 2 - 52);

    const text = props.screenText.slice(0, Math.max(chars, 0));

    ctx.font = 'bold 44px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = palette.screenText;
    ctx.fillText(text, 56, SCREEN_TEXTURE_H / 2 + 16);

    if (caret) {
        ctx.fillRect(56 + ctx.measureText(text).width + 6, SCREEN_TEXTURE_H / 2 - 8, 20, 46);
    }

    screenTexture.needsUpdate = true;
};

const redrawScreen = () => drawScreen(drawnChars, drawnCaret);

const loadAppImages = () => {
    props.apps.forEach(({ preview }) => {
        if (!preview || appImages.has(preview)) {
            return;
        }

        const image = new Image();

        image.onload = redrawScreen;
        image.src = preview;
        appImages.set(preview, image);
    });
};

/** Экран моргает и загорается уже с новым содержимым */
const blinkScreen = () => {
    if (phase.value === 'loading') {
        return;
    }

    window.clearTimeout(blinkTimer);
    screenIsOn = false;
    redrawScreen();

    blinkTimer = window.setTimeout(() => {
        screenIsOn = true;
        redrawScreen();
    }, SCREEN_BLINK);
};

const buildLaptop = () => {
    const group = new THREE.Group();

    const body = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.15 });
    const deck = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.05 });
    const edge = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 });

    screenCanvas = document.createElement('canvas');
    screenCanvas.width = SCREEN_TEXTURE_W;
    screenCanvas.height = SCREEN_TEXTURE_H;
    screenContext = screenCanvas.getContext('2d');
    screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;

    // Экран светится сам: та же текстура идёт и в цвет, и в излучение
    const display = new THREE.MeshStandardMaterial({
        map: screenTexture,
        emissiveMap: screenTexture,
        emissive: 0xffffff,
        emissiveIntensity: 0.55,
        roughness: 0.9,
        metalness: 0
    });

    bodyMaterial = body;
    deckMaterial = deck;
    screenMaterial = display;
    edgeMaterial = edge;

    const width = 2.2;
    const depth = 1.5;
    const baseHeight = 0.11;

    const addEdges = (mesh: THREE.Mesh) => {
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edge));
    };

    const base = new THREE.Mesh(new THREE.BoxGeometry(width, baseHeight, depth), body);
    addEdges(base);
    group.add(base);

    const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.82, depth * 0.5), deck);
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, baseHeight / 2 + 0.001, -0.15);
    group.add(keyboard);

    const trackpad = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.28, depth * 0.22), deck);
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, baseHeight / 2 + 0.001, 0.45);
    group.add(trackpad);

    // Крышка живёт в своём пивоте на задней кромке корпуса — так она открывается «от петли»
    hinge = new THREE.Group();
    hinge.position.set(0, baseHeight / 2, -depth / 2);
    hinge.rotation.x = LID_OPEN;
    group.add(hinge);

    const lidHeight = 1.45;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(width, lidHeight, 0.07), body);
    lid.position.set(0, lidHeight / 2, -0.035);
    addEdges(lid);
    hinge.add(lid);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.9, lidHeight * 0.86), display);
    screen.position.set(0, lidHeight / 2, 0.002);
    hinge.add(screen);

    group.position.y = -0.35;
    group.scale.setScalar(1.3);

    return group;
};

const applyPalette = () => {
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;

    bodyMaterial?.color.setHex(palette.body);
    deckMaterial?.color.setHex(palette.deck);
    edgeMaterial?.color.setHex(palette.edge);
    keyLight?.color.setHex(palette.key);
    fillLight?.groundColor.setHex(palette.fill);

    redrawScreen();
};

const onPointerMove = (event: PointerEvent) => {
    if (!isDragging.value || event.pointerId !== dragPointerId) {
        return;
    }

    const dx = event.clientX - dragPrev.x;
    const dy = event.clientY - dragPrev.y;

    dragPrev.x = event.clientX;
    dragPrev.y = event.clientY;

    dragged.y += dx * DRAG_SENSITIVITY;
    dragged.x = Math.min(Math.max(dragged.x + dy * DRAG_SENSITIVITY, -DRAG_LIMIT_X), DRAG_LIMIT_X);

    // Скорость последнего движения — она же станет инерцией после отпускания
    dragVelocity.y = dx * DRAG_SENSITIVITY * 60;
    dragVelocity.x = dy * DRAG_SENSITIVITY * 60;
};

const onPointerUp = (event: PointerEvent) => {
    if (!isDragging.value || event.pointerId !== dragPointerId) {
        return;
    }

    isDragging.value = false;
    dragPointerId = -1;
    stage.value?.releasePointerCapture?.(event.pointerId);
};

const onPointerDown = (event: PointerEvent) => {
    if (phase.value !== 'done' || event.button !== 0) {
        return;
    }

    event.preventDefault();
    isDragging.value = true;
    dragPointerId = event.pointerId;
    dragPrev.x = event.clientX;
    dragPrev.y = event.clientY;
    dragVelocity.x = 0;
    dragVelocity.y = 0;
    stage.value?.setPointerCapture?.(event.pointerId);
};

const resize = () => {
    if (!renderer || !camera || !stage.value) {
        return;
    }

    const { clientWidth, clientHeight } = stage.value;

    if (!clientWidth || !clientHeight) {
        return;
    }

    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(clientWidth, clientHeight, false);
};

const introSize = () => {
    return Math.round(Math.min(Math.max(Math.min(window.innerWidth, window.innerHeight) * 0.55, 260), 520));
};

const setupIntroStage = () => {
    if (!stage.value) {
        return;
    }

    const side = introSize();

    Object.assign(stage.value.style, {
        position: 'fixed',
        zIndex: '60',
        left: '50%',
        top: '50%',
        width: `${side}px`,
        height: `${side}px`,
        transform: 'translate(-50%, -50%)'
    });

    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
};

const finishIntro = () => {
    if (phase.value === 'done' || !stage.value) {
        return;
    }

    window.clearTimeout(flightTimer);

    Object.assign(stage.value.style, {
        position: '',
        zIndex: '',
        left: '',
        top: '',
        width: '100%',
        height: '100%',
        transform: '',
        transition: ''
    });

    document.body.style.overflow = bodyOverflow;
    phase.value = 'done';
    resize();
};

/** Перелёт из центра экрана на своё место в вёрстке: FLIP на трансформе, без искажения пропорций */
const startFlight = () => {
    if (phase.value !== 'loading' || !stage.value || !host.value) {
        return;
    }

    phase.value = 'landing';
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (!prefersReducedMotion) {
        boostStartedAt = performance.now();
    }

    const stageRect = stage.value.getBoundingClientRect();
    const hostRect = host.value.getBoundingClientRect();
    // Считаем по высоте: область под сцену шире квадрата интро, а размер модели задаёт вертикаль кадра
    const scale = hostRect.height / stageRect.height;
    const dx = hostRect.left + hostRect.width / 2 - (stageRect.left + stageRect.width / 2);
    const dy = hostRect.top + hostRect.height / 2 - (stageRect.top + stageRect.height / 2);

    stage.value.style.transition = `transform ${FLIGHT_DURATION}ms cubic-bezier(.65, 0, .35, 1)`;
    stage.value.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`;

    stage.value.addEventListener('transitionend', finishIntro, { once: true });
    // Подстраховка, если transitionend не долетит (например, вкладка была свёрнута)
    flightTimer = window.setTimeout(finishIntro, FLIGHT_DURATION + 400);
};

const updateIntro = (now: number) => {
    if (!hinge) {
        return;
    }

    const elapsed = now - introStartedAt;

    const lidProgress = Math.min(Math.max((elapsed - LID_OPEN_FROM) / (LID_OPEN_TO - LID_OPEN_FROM), 0), 1);
    hinge.rotation.x = LID_CLOSED + (LID_OPEN - LID_CLOSED) * easeOutCubic(lidProgress);

    if (!screenIsOn && elapsed >= SCREEN_ON_AT) {
        screenIsOn = true;
    }

    const chars = elapsed < TYPING_FROM
        ? 0
        : Math.min(Math.floor((elapsed - TYPING_FROM) / TYPING_SPEED), props.screenText.length);
    const typingDone = chars >= props.screenText.length;
    const caret = Math.floor(elapsed / 530) % 2 === 0;

    if (chars !== drawnChars || caret !== drawnCaret) {
        drawnChars = chars;
        drawnCaret = caret;
        drawScreen(chars, caret);
    }

    if (typingDone && elapsed >= TYPING_FROM + props.screenText.length * TYPING_SPEED + HOLD_AFTER_TYPING) {
        startFlight();
    }
};

const animate = () => {
    frameId = requestAnimationFrame(animate);

    if (!renderer || !scene || !camera || !laptop) {
        return;
    }

    const now = performance.now();
    // Кадр может «проспать» (свёрнутая вкладка) — ограничиваем шаг, иначе модель дёрнется
    const delta = lastFrameAt ? Math.min((now - lastFrameAt) / 1000, 0.1) : 0;

    lastFrameAt = now;

    if (phase.value === 'loading') {
        updateIntro(now);
    }

    const facing = props.apps.length > 0;

    // Раскручивается уже в полёте, а не после приземления. С приложениями на экране — замирает лицом к зрителю
    if (phase.value !== 'loading' && !prefersReducedMotion && !isDragging.value && !facing) {
        spinAngle += delta * SPIN_SPEED;
    }

    if (boostStartedAt && !isDragging.value) {
        // Пять оборотов с затуханием: на выходе скорость доборта нулевая, остаётся холостая
        const progress = Math.min((now - boostStartedAt) / SPIN_BOOST_DURATION, 1);

        boostAngle = Math.PI * 2 * SPIN_BOOST_TURNS * easeOutCubic(progress);

        if (progress === 1) {
            // Целое число оборотов — обнуление не сдвигает модель
            boostStartedAt = 0;
            boostAngle = 0;
        }
    }

    if (!isDragging.value && (dragVelocity.x || dragVelocity.y)) {
        // Инерция после отпускания: докручиваем и гасим трением
        dragged.y += dragVelocity.y * delta;
        dragged.x = Math.min(Math.max(dragged.x + dragVelocity.x * delta, -DRAG_LIMIT_X), DRAG_LIMIT_X);

        const decay = Math.max(1 - DRAG_FRICTION * delta, 0);

        dragVelocity.x *= decay;
        dragVelocity.y *= decay;

        if (Math.abs(dragVelocity.x) < 0.001 && Math.abs(dragVelocity.y) < 0.001) {
            dragVelocity.x = 0;
            dragVelocity.y = 0;
        }
    }

    const ease = Math.min(delta * FACE_EASING, 1);

    baseRotationX += ((facing ? FACE_ROTATION_X : BASE_ROTATION_X) - baseRotationX) * ease;

    if (facing && !isDragging.value) {
        // Доворачиваем по кратчайшей дуге к «лицу», не трогая накопленные обороты
        const current = BASE_ROTATION_Y + spinAngle + boostAngle + dragged.y + faceOffset;

        faceOffset += wrapAngle(FACE_ROTATION_Y - current) * ease;
    }

    laptop.rotation.x = baseRotationX + dragged.x;
    laptop.rotation.y = BASE_ROTATION_Y + spinAngle + boostAngle + dragged.y + faceOffset;

    if (!prefersReducedMotion) {
        laptop.position.y = -0.35 + Math.sin(now / 1250) * 0.06;
    }

    renderer.render(scene, camera);
};

const start = () => {
    if (!frameId) {
        frameId = requestAnimationFrame(animate);
    }
};

const stop = () => {
    if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        lastFrameAt = 0;
    }
};

onMounted(() => {
    if (!stage.value) {
        return;
    }

    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.35, 5.4);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    stage.value.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    laptop = buildLaptop();
    scene.add(laptop);

    keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    fillLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.2);
    scene.add(fillLight);

    if (props.intro && !prefersReducedMotion) {
        phase.value = 'loading';
        introStartedAt = performance.now();
        setupIntroStage();
    } else {
        screenIsOn = true;
        drawnChars = props.screenText.length;
    }

    loadAppImages();
    applyPalette();
    resize();

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage.value);

    // Не крутим сцену, когда её не видно на экране
    intersectionObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting || phase.value !== 'done') {
            start();
        } else {
            stop();
        }
    });
    intersectionObserver.observe(host.value as HTMLDivElement);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    start();
});

onBeforeUnmount(() => {
    stop();
    window.clearTimeout(flightTimer);
    window.clearTimeout(blinkTimer);

    if (phase.value !== 'done') {
        document.body.style.overflow = bodyOverflow;
    }

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    scene?.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
            object.geometry.dispose();
        }
    });

    screenTexture?.dispose();
    bodyMaterial?.dispose();
    deckMaterial?.dispose();
    screenMaterial?.dispose();
    edgeMaterial?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();

    renderer = null;
    scene = null;
    camera = null;
    laptop = null;
    hinge = null;
});

watch(isDark, applyPalette);
watch(() => [props.screenText, props.screenUser], redrawScreen);
watch(() => props.apps, () => {
    loadAppImages();
    blinkScreen();
}, { deep: true });
</script>

<template>
    <div
        ref="host"
        class="hero-model"
        :style="{ height: `${props.size}px` }"
        aria-hidden="true"
    >
        <div
            ref="stage"
            class="hero-model__stage"
            :class="{ 'hero-model__stage--dragging': isDragging }"
            @pointerdown="onPointerDown"
        ></div>
        <div
            v-if="phase !== 'done'"
            class="hero-model__backdrop bg-bg dark:bg-bg-dark"
            :class="{ 'hero-model__backdrop--out': phase === 'landing' }"
        ></div>
    </div>
</template>

<style scoped>
.hero-model {
    width: 100%;
}

.hero-model__stage {
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
}

.hero-model__stage--dragging {
    cursor: grabbing;
}

.hero-model__backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    opacity: 1;
    transition: opacity 700ms ease;
}

.hero-model__backdrop--out {
    opacity: 0;
}
</style>
