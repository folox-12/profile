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
