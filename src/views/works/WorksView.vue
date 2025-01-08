<script setup>
import { useRouteFunction } from '@/composable/useRouteFunction';
useRouteFunction();

const project = [
    {
        name: 'Kiosk',
        description: 'about about about about',
        preview: '@/assets/works/kiosk/kiosk.jpeg'
    }
];
</script>
<template>
    <div class="works">
        <nav-link v-for="({name}, key) in project" :key=key >
            {{ name  }}
        </nav-link>
    </div>
</template>
