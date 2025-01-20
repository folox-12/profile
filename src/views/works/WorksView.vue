<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { PROJECT_WORKS } from '@/constants/projects';
const { workName } = useRouteFunction();
</script>
<template>
    <div>
        <span class="block mb-2 text-xl font-bold">
            {{ workName }}
        </span>
        <div class="works md:flex justify-center gap-3">
            <router-link v-for="({name, to, preview, description}, key) in PROJECT_WORKS"
                         class="basis-1/2 md:basis-full md:flex-grow [&:not(:first-child)]:mt-4 flex text-center align-center flex-col"
                         :key=key
                         :to="to">
                <img alt="preview"
                     class="rounded-lg md:h-48 h-70 object-cover"
                     :src="preview">
                <span class="text-xl">{{ name}}</span>
                <span class="text-sm">{{ description }}</span>
            </router-link>
        </div>
    </div>
</template>
