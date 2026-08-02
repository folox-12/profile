<template>
    <Transition name="loader-fade">
        <div
            v-if="show"
            class="fixed inset-0 z-[100] flex items-center justify-center bg-bg/85 dark:bg-bg-dark/85 backdrop-blur-sm"
        >
            <div class="loader-laptop relative w-16">
                <div class="relative w-full aspect-[16/10] bg-[#1b1b1b] rounded-t-lg rounded-b-[3px] p-[4px_4px_5px] shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
                    <div class="loader-screen w-full h-full rounded-[2px] bg-gradient-to-br from-mint to-mintline dark:from-mint-dark dark:to-mintline-dark"></div>
                </div>
                <div class="w-[112%] -ml-[6%] h-[5px] bg-gradient-to-b from-[#2b2b2b] to-[#161616] rounded-b-md shadow-[0_2px_4px_rgba(0,0,0,0.3)]"></div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
    show: boolean
}>();
</script>

<style scoped>
.loader-laptop {
    animation: loader-bob 1.4s ease-in-out infinite;
}
.loader-screen {
    animation: loader-glow 1.4s ease-in-out infinite;
}
.loader-fade-enter-active,
.loader-fade-leave-active {
    transition: opacity 0.2s ease;
}
.loader-fade-enter-from,
.loader-fade-leave-to {
    opacity: 0;
}

@keyframes loader-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
}
@keyframes loader-glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .loader-laptop,
    .loader-screen {
        animation: none;
    }
}
</style>
