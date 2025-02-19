<script setup>
import VHeader from '@/components/VHeader.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const fullPath = computed(() => route.fullPath);
</script>

<template>
    <div class="flex flex-col h-full">
        <v-header />
        <main class="px-16 flex-grow">
            <div v-motion-slide-visible-bottom
                 :key="fullPath">
                <router-view />
            </div>
        </main>
        <footer class="text-center text-stone-500 py-2">
            © 2024 Vasilev Sergey. All Rights Reserved.
        </footer>
    </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
    transition: opacity 1s ease-in-out;
}

.v-enter-from,
.v-leave-to {
    animation: close 1s;
}

.v-enter-to,
.v-leave-from {
    animation: open 1s;
}

@keyframes open {
  from {
    opacity: 0;
    display: none;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    display: block;
    transform: translateY(0);
  }
}

@keyframes close {
  from {
    opacity: 1;
    display: block;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    display: none;
    transform: translateY(20px);
  }
}
</style>
