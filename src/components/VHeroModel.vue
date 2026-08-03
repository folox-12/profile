<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { useDarkModeClass } from '@/composable/useDarkModeClass';

const props = withDefaults(defineProps<{
    /** Размер канвы в px (квадрат) */
    size?: number;
    /** Насколько сильно модель доворачивается за курсором, в радианах */
    tilt?: number;
}>(), {
    size: 160,
    tilt: 0.45
});

const container = ref<HTMLDivElement | null>(null);
const { isDark } = useDarkModeClass();

const PALETTE = {
    light: {
        body: 0xeee6d6,
        deck: 0xd8cfbc,
        screen: 0xb7ecd1,
        edge: 0x7cc79c,
        key: 0xffffff,
        fill: 0xfbf3e6
    },
    dark: {
        body: 0x32363c,
        deck: 0x262a2f,
        screen: 0x4fb897,
        edge: 0x3d9478,
        key: 0xdff5ec,
        fill: 0x22262b
    }
};

// Базовый разворот в три четверти — без него ноутбук читается как плоский прямоугольник
const BASE_ROTATION_X = -0.22;
const BASE_ROTATION_Y = -0.38;

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let laptop: THREE.Group | null = null;
let bodyMaterial: THREE.MeshStandardMaterial | null = null;
let deckMaterial: THREE.MeshStandardMaterial | null = null;
let screenMaterial: THREE.MeshStandardMaterial | null = null;
let edgeMaterial: THREE.LineBasicMaterial | null = null;
let keyLight: THREE.DirectionalLight | null = null;
let fillLight: THREE.HemisphereLight | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;

// Текущий и целевой поворот — целевой ставит мышь, текущий догоняет его плавно
const rotation = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let prefersReducedMotion = false;

const buildLaptop = () => {
    const group = new THREE.Group();

    const body = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.15 });
    const deck = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.05 });
    const display = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 });
    const edge = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 });

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
    const hinge = new THREE.Group();
    hinge.position.set(0, baseHeight / 2, -depth / 2);
    hinge.rotation.x = -0.28;
    group.add(hinge);

    const lidHeight = 1.45;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(width, lidHeight, 0.07), body);
    lid.position.set(0, lidHeight / 2, -0.035);
    addEdges(lid);
    hinge.add(lid);

    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(width * 0.9, lidHeight * 0.86),
        display
    );
    screen.position.set(0, lidHeight / 2, 0.002);
    hinge.add(screen);

    group.position.y = -0.35;
    group.scale.setScalar(1.15);

    return group;
};

const applyPalette = () => {
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;

    bodyMaterial?.color.setHex(palette.body);
    deckMaterial?.color.setHex(palette.deck);
    screenMaterial?.color.setHex(palette.screen);
    screenMaterial?.emissive.setHex(palette.screen);
    edgeMaterial?.color.setHex(palette.edge);
    keyLight?.color.setHex(palette.key);
    fillLight?.groundColor.setHex(palette.fill);

    if (screenMaterial) {
        screenMaterial.emissiveIntensity = isDark.value ? 0.45 : 0.2;
    }
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
    if (!renderer || !camera || !container.value) {
        return;
    }

    const { clientWidth, clientHeight } = container.value;

    if (!clientWidth || !clientHeight) {
        return;
    }

    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(clientWidth, clientHeight, false);
};

const animate = () => {
    frameId = requestAnimationFrame(animate);

    if (!renderer || !scene || !camera || !laptop) {
        return;
    }

    // Экспоненциальное сглаживание: модель «догоняет» курсор без рывков
    rotation.x += (target.x - rotation.x) * 0.06;
    rotation.y += (target.y - rotation.y) * 0.06;

    laptop.rotation.x = BASE_ROTATION_X + rotation.x;
    laptop.rotation.y = BASE_ROTATION_Y + rotation.y;

    if (!prefersReducedMotion) {
        const time = performance.now() / 1000;

        laptop.position.y = -0.35 + Math.sin(time * 0.8) * 0.06;
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
    if (!container.value) {
        return;
    }

    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.35, 5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    container.value.appendChild(renderer.domElement);
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

    applyPalette();
    resize();

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container.value);

    // Не крутим сцену, когда её не видно на экране
    intersectionObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            start();
        } else {
            stop();
        }
    });
    intersectionObserver.observe(container.value);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    start();
});

onBeforeUnmount(() => {
    stop();

    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    scene?.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
            object.geometry.dispose();
        }
    });

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
});

watch(isDark, applyPalette);
</script>

<template>
    <div
        ref="container"
        class="hero-model shrink-0"
        :style="{ width: `${props.size}px`, height: `${props.size}px` }"
        aria-hidden="true"
    ></div>
</template>
