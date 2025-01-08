<script setup>
import VHeader from '@/components/VHeader.vue';
</script>

<template>
    <div class="flex-column">
        <v-header />
        <main class="px-16">
            <transition>
                <router-view />
            </transition>
        </main>
        <footer class="text-center text-stone-500 py-2">
            © 2024 Vasilev Sergey. All Rights Reserved.
        </footer>
    </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
    transition: opacity 1s ease, transform 1s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.v-enter-to,
.v-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.v-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

</style>
