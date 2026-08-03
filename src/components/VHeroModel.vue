<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { useDarkModeClass } from '@/composable/useDarkModeClass';

const props = withDefaults(defineProps<{
    /** Размер модели в px (квадрат) в обычном, «припаркованном» состоянии */
    size?: number;
    /** Насколько сильно модель доворачивается за курсором, в радианах */
    tilt?: number;
    /** Текст, который печатается на экране во время загрузки */
    screenText?: string;
    /** Проигрывать полноэкранное интро при первой загрузке */
    intro?: boolean;
}>(), {
    size: 220,
    tilt: 0.45,
    screenText: 'Frontend Developer',
    intro: true
});

const host = ref<HTMLDivElement | null>(null);
const stage = ref<HTMLDivElement | null>(null);
const { isDark } = useDarkModeClass();

type Phase = 'boot' | 'landing' | 'done';

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

// Тайминги интро в мс от старта сцены
const LID_OPEN_FROM = 150;
const LID_OPEN_TO = 900;
const SCREEN_ON_AT = 950;
const TYPING_FROM = 1150;
const TYPING_SPEED = 45;
const HOLD_AFTER_TYPING = 550;
const FLIGHT_DURATION = 900;

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

// Текущий и целевой поворот — целевой ставит мышь, текущий догоняет его плавно
const rotation = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let prefersReducedMotion = false;
let introStartedAt = 0;
let bodyOverflow = '';
// Что сейчас нарисовано на экране — чтобы не перерисовывать текстуру каждый кадр
let drawnChars = -1;
let drawnCaret = false;
let screenIsOn = false;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

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
    ctx.fillText('> whoami', 56, SCREEN_TEXTURE_H / 2 - 52);

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
    // Нормализуем позицию курсора относительно центра экрана в диапазон [-1, 1]
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;

    target.y = x * props.tilt;
    target.x = y * props.tilt;
};

const onPointerLeave = () => {
    target.x = 0;
    target.y = 0;
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
    if (phase.value !== 'boot' || !stage.value || !host.value) {
        return;
    }

    phase.value = 'landing';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const stageRect = stage.value.getBoundingClientRect();
    const hostRect = host.value.getBoundingClientRect();
    const scale = hostRect.width / stageRect.width;
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

    if (phase.value === 'boot') {
        updateIntro(now);
    }

    // Экспоненциальное сглаживание: модель «догоняет» курсор без рывков
    rotation.x += (target.x - rotation.x) * 0.06;
    rotation.y += (target.y - rotation.y) * 0.06;

    laptop.rotation.x = BASE_ROTATION_X + rotation.x;
    laptop.rotation.y = BASE_ROTATION_Y + rotation.y;

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
    }
};

onMounted(() => {
    if (!stage.value) {
        return;
    }

    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.35, 5);
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
        phase.value = 'boot';
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
    document.addEventListener('pointerleave', onPointerLeave);

    start();
});

onBeforeUnmount(() => {
    stop();
    window.clearTimeout(flightTimer);

    if (phase.value !== 'done') {
        document.body.style.overflow = bodyOverflow;
    }

    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
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
watch(() => props.screenText, redrawScreen);
</script>

<template>
    <div
        ref="host"
        class="hero-model"
        :style="{ width: `${props.size}px`, height: `${props.size}px` }"
        aria-hidden="true"
    >
        <div
            ref="stage"
            class="hero-model__stage"
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
    flex-shrink: 0;
}

.hero-model__stage {
    width: 100%;
    height: 100%;
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
