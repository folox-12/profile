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
        <div class="works flex flex-wrap justify-center gap-3">
            <router-link v-for="({name, to, preview, shortDescription}, key) in PROJECT_WORKS"
                         class="basis-1/2 max-md:w-full max-md:flex-grow flex text-center align-center flex-col"
                         :key=key
                         :to="to">
                <img alt="preview"
                     class="rounded-lg md:h-48 h-80 object-cover"
                     :src="preview">
                <span class="text-xl py-2">{{ name}}</span>
                <span class="text-sm pb-1">{{ shortDescription }}</span>
            </router-link>
        </div>
    </div>
</template>
