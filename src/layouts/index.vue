<script setup lang="ts">
import defaultLayout from './default.vue';
import aboutLayout from './about.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

type LayoutKey = 'default' | 'about';

const LAYOUTS: Record<LayoutKey, unknown> = {
    default: defaultLayout,
    about: aboutLayout
};

const route = useRoute();

const metaLayout = computed(() => {
    return route.meta?.layout as LayoutKey || undefined;
});

const layoutComponent = computed(() => {
    return LAYOUTS[metaLayout.value] || LAYOUTS.default;
});

</script>

<template>
    <component :is="layoutComponent"/>
</template>
