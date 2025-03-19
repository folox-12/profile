<script setup>
import layout from '@/layouts/index.vue';
</script>

<template>
    <div id="app"
         class="
         h-full
         range-100
         dark:text-stone-200
         hover:decoration-black
         dark:hover:decoration-stone-200">

        <div class="
            h-full
            max-w-3xl
            mx-auto
        ">
            <layout />
        </div>
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
    --tw-bg-opacity: 1;
    background-color: rgb(255 247 237 / var(--tw-bg-opacity, 1))
}
html.dark {
    --tw-bg-opacity: 1;
    background-color: rgb(39 39 42 / var(--tw-bg-opacity, 1));
}

body {
    min-height: 100%;
    height: 100vh;
}
</style>
