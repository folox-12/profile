<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
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
    /** Приблизить ноутбук и показать на экране содержимое слота screen */
    focused?: boolean;
    /** Повернуть сложенный ноутбук вертикально — под длинную страницу */
    portrait?: boolean;
}>(), {
    size: 300,
    screenUser: 'vasilev_sergey',
    screenText: 'Frontend Developer',
    intro: true,
    focused: false,
    portrait: false
});

const host = ref<HTMLDivElement | null>(null);
const stage = ref<HTMLDivElement | null>(null);
const screenSlot = ref<HTMLDivElement | null>(null);
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
        body: 0x4d5155,
        deck: 0x3a3d40,
        edge: 0x3d9478,
        key: 0xdff5ec,
        fill: 0x22262b,
        screenText: '#7ee0b8'
    }
};

// Базовый разворот в три четверти — без него ноутбук читается как плоский прямоугольник
const BASE_ROTATION_X = -0.22;
const BASE_ROTATION_Y = -0.38;

const LAPTOP_WIDTH = 2.2;
const LAPTOP_DEPTH = 1.5;
const BASE_HEIGHT = 0.11;
const LID_HEIGHT = 1.45;

const LID_CLOSED = -1.52;
const LID_OPEN = -0.28;

// В фокусе корпус уезжает за крышку вокруг той же петли — как складывается Lenovo Yoga.
// Угол больше 180 градусов: корпус уходит вниз и назад, а не проносится перед экраном.
// Чуть больше прямого угла на выходе и сдвиг назад, чтобы он спрятался за крышкой
const BASE_FOLD_X = 4.62;
const BASE_FOLD_Z = -0.14;

// Разворот лицом к зрителю: крышка встаёт вертикально, корпус не заваливается,
// поэтому плоскость экрана оказывается ровно перед камерой
const LID_FOCUS = 0;
const FACE_ROTATION_X = 0;
const FACE_ROTATION_Y = 0;
const FOCUS_EASING = 2.6;

// Модель вращается вокруг собственного центра, а не вокруг петли:
// без этого при повороте в портрет панель уезжала бы вбок
const MODEL_PIVOT_Y = 0.75;
const MODEL_CENTER_Y = 0.625;
const MODEL_SCALE = 1.3;
const PORTRAIT_ROLL = -Math.PI / 2;

// Камера в трёх состояниях: обычное, альбомный фокус и портретный
const CAMERA_IDLE = { y: 0.35, z: 5.4, look: 0 };
// Ближе уже некуда: панель по высоте упирается в кадр
const CAMERA_FOCUS = { y: MODEL_CENTER_Y, z: 2.4, look: MODEL_CENTER_Y };
// В портрете вертикально встаёт длинная сторона, поэтому камера отъезжает
const CAMERA_PORTRAIT = { y: MODEL_CENTER_Y, z: 3.2, look: MODEL_CENTER_Y };

// Экран как DOM. Ширина макета берётся с запасом над реальным размером дисплея
// на экране: CSS3D тогда ужимает слой, а не растягивает, и текст остаётся чётким
const SCREEN_DOM_W = 1200;

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
let cssRenderer: CSS3DRenderer | null = null;
let screenObject: CSS3DObject | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let laptop: THREE.Group | null = null;
let hinge: THREE.Group | null = null;
let baseFold: THREE.Group | null = null;
let screenDom = { width: 0, height: 0 };
let rollAngle = 0;
let bodyMaterial: THREE.MeshStandardMaterial | null = null;
let deckMaterial: THREE.MeshStandardMaterial | null = null;
let edgeMaterial: THREE.LineBasicMaterial | null = null;
let logoMaterial: THREE.LineBasicMaterial | null = null;
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
const cameraState = { ...CAMERA_IDLE };
let boostAngle = 0;
let boostStartedAt = 0;
let lastFrameAt = 0;

// Ручная раскрутка: накопленный поворот, скорость по инерции и состояние захвата
const dragged = { x: 0, y: 0 };
const dragVelocity = { x: 0, y: 0 };
const dragPrev = { x: 0, y: 0 };
const isDragging = ref(false);
let dragPointerId = -1;

// Страница на экране показывается не сразу: сначала наезд камеры и полоса загрузки на дисплее
const screenReady = ref(false);
let drawnProgress = -1;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

/** Приводит угол к диапазону (-PI, PI] — чтобы доворачивать по кратчайшей дуге */
const wrapAngle = (value: number) => Math.atan2(Math.sin(value), Math.cos(value));

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

/** В портрете элемент экрана меняет стороны местами и разворачивается против крена модели */
const applyScreenOrientation = () => {
    if (!screenSlot.value || !screenDom.width) {
        return;
    }

    const portrait = props.portrait;

    screenSlot.value.style.width = `${portrait ? screenDom.height : screenDom.width}px`;
    screenSlot.value.style.height = `${portrait ? screenDom.width : screenDom.height}px`;
};

const redrawScreen = () => {
    drawnProgress = -1;
    drawScreen(drawnChars, drawnCaret);
};

/** Экран загрузки страницы: приглашение и полоса, пока камера подъезжает */
const drawLoading = (progress: number) => {
    if (!screenContext || !screenTexture) {
        return;
    }

    const ctx = screenContext;
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;

    ctx.fillStyle = '#0e1317';
    ctx.fillRect(0, 0, SCREEN_TEXTURE_W, SCREEN_TEXTURE_H);

    ctx.save();

    // В портрете модель кренится вместе с текстурой, поэтому рисуем в повёрнутой
    // системе координат — текст и полоса остаются вертикальными для зрителя
    if (props.portrait) {
        ctx.translate(SCREEN_TEXTURE_W / 2, SCREEN_TEXTURE_H / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-SCREEN_TEXTURE_H / 2, -SCREEN_TEXTURE_W / 2);
    }

    const areaWidth = props.portrait ? SCREEN_TEXTURE_H : SCREEN_TEXTURE_W;
    const areaHeight = props.portrait ? SCREEN_TEXTURE_W : SCREEN_TEXTURE_H;
    const barWidth = areaWidth - 112;
    const barY = areaHeight / 2 + 12;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '30px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, .45)';
    ctx.fillText(`${props.screenUser}:~$ open ~/works`, 56, areaHeight / 2 - 46);

    ctx.fillStyle = 'rgba(255, 255, 255, .12)';
    ctx.fillRect(56, barY, barWidth, 14);

    ctx.fillStyle = palette.screenText;
    ctx.fillRect(56, barY, barWidth * progress, 14);

    ctx.font = '22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, .35)';
    ctx.fillText(`${Math.round(progress * 100)}%`, 56, barY + 48);

    ctx.restore();

    screenTexture.needsUpdate = true;
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
    edgeMaterial = edge;

    const width = LAPTOP_WIDTH;
    const depth = LAPTOP_DEPTH;
    const baseHeight = BASE_HEIGHT;

    const addEdges = (mesh: THREE.Mesh) => {
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edge));
    };

    // Корпус тоже висит на петле, поэтому умеет складываться назад
    baseFold = new THREE.Group();
    baseFold.position.set(0, baseHeight / 2, -depth / 2);
    group.add(baseFold);

    const base = new THREE.Mesh(new THREE.BoxGeometry(width, baseHeight, depth), body);
    base.position.set(0, -baseHeight / 2, depth / 2);
    addEdges(base);
    baseFold.add(base);

    const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.82, depth * 0.5), deck);
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, 0.001, depth / 2 - 0.15);
    baseFold.add(keyboard);

    const trackpad = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.28, depth * 0.22), deck);
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, 0.001, depth / 2 + 0.45);
    baseFold.add(trackpad);

    // Крышка живёт в своём пивоте на задней кромке корпуса — так она открывается «от петли»
    hinge = new THREE.Group();
    hinge.position.set(0, baseHeight / 2, -depth / 2);
    hinge.rotation.x = LID_OPEN;
    group.add(hinge);

    const lidHeight = LID_HEIGHT;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(width, lidHeight, 0.07), body);
    lid.position.set(0, lidHeight / 2, -0.035);
    addEdges(lid);
    hinge.add(lid);

    // Рамка узкая: дисплей забирает почти всю крышку, сверху остаётся место под глазок
    const screenWidth = width * 0.94;
    const screenHeight = lidHeight * 0.9;

    // Логотип на крышке снаружи: проволочный глобус, как значок «интернета»
    const logo = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.85 });

    logoMaterial = logo;

    const globe = new THREE.Group();
    const globeRadius = 0.24;
    const ellipse = (rx: number, ry: number) => {
        const points = new THREE.EllipseCurve(0, 0, rx, ry, 0, Math.PI * 2)
            .getPoints(56)
            .map(({ x, y }) => new THREE.Vector3(x, y, 0));

        return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), logo);
    };
    const chord = (level: number) => {
        const y = globeRadius * level;
        const half = globeRadius * Math.sqrt(1 - level * level);

        return new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-half, y, 0),
                new THREE.Vector3(half, y, 0)
            ]),
            logo
        );
    };

    globe.add(ellipse(globeRadius, globeRadius));
    globe.add(ellipse(globeRadius * 0.42, globeRadius));
    globe.add(chord(0));
    globe.add(chord(0.5));
    globe.add(chord(-0.5));
    globe.position.set(0, lidHeight / 2, -0.073);
    hinge.add(globe);

    // Глазок камеры в рамке над экраном: тёмная линза и точка блика
    const lensMaterial = new THREE.MeshStandardMaterial({ color: 0x11151a, roughness: 0.25, metalness: 0.4 });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.015, 20), lensMaterial);
    lens.position.set(0, (lidHeight + screenHeight / 2 + lidHeight / 2) / 2, 0.004);
    hinge.add(lens);

    const glare = new THREE.Mesh(
        new THREE.CircleGeometry(0.008, 12),
        new THREE.MeshBasicMaterial({ color: 0x9fb4c4, transparent: true, opacity: 0.7 })
    );
    glare.position.set(-0.004, lens.position.y + 0.004, 0.006);
    hinge.add(glare);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), display);
    screen.position.set(0, lidHeight / 2, 0.002);
    hinge.add(screen);

    // Тот же прямоугольник, но из DOM: CSS3D кладёт настоящую вёрстку в плоскость экрана
    if (screenSlot.value) {
        screenDom = { width: SCREEN_DOM_W, height: Math.round(SCREEN_DOM_W * (screenHeight / screenWidth)) };
        applyScreenOrientation();

        screenObject = new CSS3DObject(screenSlot.value);
        screenObject.position.set(0, lidHeight / 2, 0.004);
        screenObject.scale.setScalar(screenWidth / SCREEN_DOM_W);
        screenObject.visible = false;
        hinge.add(screenObject);
    }

    group.position.y = -0.35;
    group.scale.setScalar(1.3);

    return group;
};

const applyPalette = () => {
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;

    bodyMaterial?.color.setHex(palette.body);
    deckMaterial?.color.setHex(palette.deck);
    edgeMaterial?.color.setHex(palette.edge);
    logoMaterial?.color.setHex(palette.edge);
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
    // В фокусе ноутбук зафиксирован: страницу на экране нельзя увести вбок
    if (phase.value !== 'done' || props.focused || event.button !== 0) {
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
    cssRenderer?.setSize(clientWidth, clientHeight);
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

    // Пока идёт интро, фокус не применяем — иначе загрузка на /works стартовала бы уже приближенной
    const focused = props.focused && phase.value === 'done';

    // Раскручивается уже в полёте, а не после приземления. В фокусе — замирает лицом к зрителю
    if (phase.value !== 'loading' && !prefersReducedMotion && !isDragging.value && !focused) {
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

    const ease = Math.min(delta * FOCUS_EASING, 1);
    const portrait = focused && props.portrait;
    const cameraTarget = portrait ? CAMERA_PORTRAIT : (focused ? CAMERA_FOCUS : CAMERA_IDLE);

    if (focused) {
        // Накопленный ручной наклон распускаем, чтобы экран смотрел строго вперёд
        dragged.x += (0 - dragged.x) * ease;
        dragVelocity.x = 0;
        dragVelocity.y = 0;
    }

    cameraState.y += (cameraTarget.y - cameraState.y) * ease;
    cameraState.z += (cameraTarget.z - cameraState.z) * ease;
    cameraState.look += (cameraTarget.look - cameraState.look) * ease;

    camera.position.set(0, cameraState.y, cameraState.z);
    camera.lookAt(0, cameraState.look, 0);

    baseRotationX += ((focused ? FACE_ROTATION_X : BASE_ROTATION_X) - baseRotationX) * ease;

    if (hinge && phase.value === 'done') {
        const lidTarget = focused ? LID_FOCUS : LID_OPEN;

        hinge.rotation.x += (lidTarget - hinge.rotation.x) * ease;
    }

    if (baseFold && phase.value === 'done') {
        const foldTarget = focused ? BASE_FOLD_X : 0;
        const foldZ = -LAPTOP_DEPTH / 2 + (focused ? BASE_FOLD_Z : 0);

        baseFold.rotation.x += (foldTarget - baseFold.rotation.x) * ease;
        baseFold.position.z += (foldZ - baseFold.position.z) * ease;
    }

    if (focused && !isDragging.value) {
        // Доворачиваем к «лицу» по кратчайшей дуге, не трогая накопленные обороты
        const current = BASE_ROTATION_Y + spinAngle + boostAngle + dragged.y + faceOffset;

        faceOffset += wrapAngle(FACE_ROTATION_Y - current) * ease;
    }

    const rollTarget = portrait ? PORTRAIT_ROLL : 0;

    rollAngle += (rollTarget - rollAngle) * ease;

    laptop.rotation.x = baseRotationX + dragged.x;
    laptop.rotation.y = BASE_ROTATION_Y + spinAngle + boostAngle + dragged.y + faceOffset;
    laptop.rotation.z = rollAngle;

    // Крен вокруг центра панели: сдвиг компенсирует то, что начало группы сидит на петле
    const bob = prefersReducedMotion ? 0 : Math.sin(now / 1250) * 0.06 * (focused ? 0.12 : 1);

    laptop.position.x = MODEL_SCALE * MODEL_PIVOT_Y * Math.sin(rollAngle);
    laptop.position.y = MODEL_CENTER_Y - MODEL_SCALE * MODEL_PIVOT_Y * Math.cos(rollAngle) + bob;

    if (screenObject) {
        // Страницу показываем, только когда экран уже развёрнут к зрителю и камера доехала
        const aligned = Math.abs(wrapAngle(laptop.rotation.y - FACE_ROTATION_Y)) < 0.2 &&
            Math.abs(rollAngle - rollTarget) < 0.02;
        const zoom = Math.min(Math.max(
            (CAMERA_IDLE.z - cameraState.z) / (CAMERA_IDLE.z - cameraTarget.z), 0), 1);

        // Контент разворачиваем обратно, чтобы он остался вертикальным при крене модели
        screenObject.rotation.z = -rollAngle;
        screenObject.visible = focused;
        screenReady.value = focused && aligned && zoom > 0.97;

        if (focused && !screenReady.value) {
            // Пока идёт наезд, на дисплее крутится полоса загрузки
            const progress = Math.min(zoom / 0.97, 1) * (aligned ? 1 : 0.6);

            if (Math.abs(progress - drawnProgress) > 0.01) {
                drawnProgress = progress;
                drawLoading(progress);
            }
        } else if (!focused && drawnProgress >= 0) {
            redrawScreen();
        }
    }

    renderer.render(scene, camera);
    cssRenderer?.render(scene, camera);
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
    camera.position.set(0, cameraState.y, cameraState.z);
    camera.lookAt(0, cameraState.look, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    stage.value.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    cssRenderer = new CSS3DRenderer();
    // Слой поверх канвы: сам он события не ловит, их получает только страница на экране
    Object.assign(cssRenderer.domElement.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'none'
    });
    stage.value.appendChild(cssRenderer.domElement);

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

            const material = object.material;

            (Array.isArray(material) ? material : [material]).forEach((item) => item.dispose());
        }
    });

    screenTexture?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
    cssRenderer?.domElement.remove();

    renderer = null;
    cssRenderer = null;
    screenObject = null;
    scene = null;
    camera = null;
    laptop = null;
    hinge = null;
    baseFold = null;
});

watch(isDark, applyPalette);
watch(() => [props.screenText, props.screenUser], redrawScreen);
watch(() => props.portrait, () => {
    applyScreenOrientation();
    drawnProgress = -1;
});
</script>

<template>
    <div
        ref="host"
        class="hero-model"
        :style="{ height: `${props.size}px` }"
        :aria-hidden="focused ? undefined : 'true'"
    >
        <div
            ref="stage"
            class="hero-model__stage"
            :class="{
                'hero-model__stage--dragging': isDragging,
                'hero-model__stage--locked': focused
            }"
            @pointerdown="onPointerDown"
        ></div>
        <!-- CSS3D переносит этот блок в плоскость экрана — внутри обычная вёрстка -->
        <div
            ref="screenSlot"
            class="hero-model__screen bg-card dark:bg-card-dark text-ink dark:text-ink-dark"
            :class="{ 'hero-model__screen--ready': screenReady }"
        >
            <slot name="screen"></slot>
        </div>
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
    position: relative;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
}

.hero-model__screen {
    opacity: 0;
    transition: opacity 260ms ease;
    overflow: hidden auto;
    padding: 28px 32px;
    pointer-events: none;
    cursor: auto;
    -webkit-overflow-scrolling: touch;
}

.hero-model__screen--ready {
    opacity: 1;
    pointer-events: auto;
}

.hero-model__stage--dragging {
    cursor: grabbing;
}

.hero-model__stage--locked {
    cursor: default;
    /* Сцена накрывает футер — не перехватываем у него клики, страница внутри экрана их вернёт себе */
    pointer-events: none;
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
