<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { PROJECT_WORKS } from '@/constants/projects';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { workName } = useRouteFunction();
const { t } = useI18n();
const ProjectWithDescription = PROJECT_WORKS.map(({ shortDescription, description, ...other }) => {
    return {
        shortDescription: computed(() => t(shortDescription)),
        description: computed(() => t(description)),
        ...other
    };
});
</script>

<template>
    <div>
        <span class="block mb-2 text-xl font-bold">
            {{ workName }}
        </span>
        <div class="works flex max-md:flex-wrap justify-center gap-3">
            <router-link v-for="({ name, to, preview, shortDescription }, key) in ProjectWithDescription"
                         class="basis-1/2 max-md:w-full max-md:flex-grow flex text-center align-center flex-col"
                         :key=key
                         :to="to">
                <img alt="preview"
                     class="rounded-lg md:h-48 h-80 object-cover"
                     :src="preview">
                <p class="text-xl py-2">{{ name}}</p>
                <p class="text-sm pb-1">{{ shortDescription }}</p>
            </router-link>
        </div>
    </div>
</template>
