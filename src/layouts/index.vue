<script setup lang="ts">
import defaultLayout from './default.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

type LayoutKey = 'default';

const LAYOUTS: Record<LayoutKey, unknown> = {
    default: defaultLayout
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
