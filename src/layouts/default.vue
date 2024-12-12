<script setup>
import VHeader from '@/components/VHeader.vue';
</script>
<template>
    <div class="flex-column">
        <v-header />
        <main>
            <router-view />
        </main>
        <footer>My footer</footer>
    </div>
</template>
