<script setup>
import layout from '@/layouts/index.vue';
</script>

<template>
    <div id="app" class="h-full">
        <layout />
    </div>
</template>

<style>

#app {
    height: 100%;
}
html, body {
    height: 100%;
}

html {
    background-color: #fbf3e6;
}
html.dark {
    background-color: #22262b;
}

body {
    min-height: 100%;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
