<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { useDarkModeClass } from '@/composable/useDarkModeClass';

const props = withDefaults(defineProps<{
    /** Размер канвы в px (квадрат) */
    size?: number;
    /** Насколько сильно фигура доворачивается за курсором, в радианах */
    tilt?: number;
}>(), {
    size: 160,
    tilt: 0.6
});

const container = ref<HTMLDivElement | null>(null);
const { isDark } = useDarkModeClass();

const PALETTE = {
    light: { solid: 0xb7ecd1, wire: 0x7cc79c, key: 0xffffff, fill: 0xfbf3e6 },
    dark: { solid: 0x4fb897, wire: 0x3d9478, key: 0xdff5ec, fill: 0x22262b }
};

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let group: THREE.Group | null = null;
let solidMaterial: THREE.MeshStandardMaterial | null = null;
let wireMaterial: THREE.LineBasicMaterial | null = null;
let keyLight: THREE.DirectionalLight | null = null;
let fillLight: THREE.HemisphereLight | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;

// Текущий и целевой поворот — целевой ставит мышь, текущий догоняет его плавно
const rotation = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let isVisible = true;
let prefersReducedMotion = false;

const applyPalette = () => {
    const palette = isDark.value ? PALETTE.dark : PALETTE.light;

    solidMaterial?.color.setHex(palette.solid);
    wireMaterial?.color.setHex(palette.wire);
    keyLight?.color.setHex(palette.key);
    fillLight?.groundColor.setHex(palette.fill);
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

    if (!renderer || !scene || !camera || !group) {
        return;
    }

    // Экспоненциальное сглаживание: фигура «догоняет» курсор без рывков
    rotation.x += (target.x - rotation.x) * 0.06;
    rotation.y += (target.y - rotation.y) * 0.06;

    group.rotation.x = rotation.x;
    group.rotation.y = rotation.y;

    if (!prefersReducedMotion) {
        const time = performance.now() / 1000;

        group.rotation.z = Math.sin(time * 0.4) * 0.08;
        group.position.y = Math.sin(time * 0.8) * 0.08;
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
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    container.value.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    const geometry = new THREE.IcosahedronGeometry(1.4, 1);

    solidMaterial = new THREE.MeshStandardMaterial({
        flatShading: true,
        roughness: 0.45,
        metalness: 0.05
    });

    wireMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 });

    group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, solidMaterial));
    group.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireMaterial));
    scene.add(group);

    keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    fillLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.1);
    scene.add(fillLight);

    applyPalette();
    resize();

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container.value);

    // Не крутим сцену, когда её не видно на экране
    intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
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

    solidMaterial?.dispose();
    wireMaterial?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();

    renderer = null;
    scene = null;
    camera = null;
    group = null;
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
