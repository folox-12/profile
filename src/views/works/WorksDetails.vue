<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { computed } from 'vue';

const { workName } = useRouteFunction();

const title = computed(() => workName);

</script>

<template>
    <div>
        {{ title }}
    </div>
</template>
