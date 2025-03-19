<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getProjectWorkById, ProjectType } from '@/constants/projects';

const { workName } = useRouteFunction();
const { t } = useI18n();

const title = computed(() => workName);

const currentProject = ref<ProjectType | undefined>();

const details = computed(() => currentProject.value?.details);

const liClass = 'inline-block uppercase mr-2 leading-3 p-1 text-zinc-600 bg-green-200 dark:text-emerald-400 dark:bg-emerald-500 dark:bg-opacity-50' as const;

onMounted(() => {
    currentProject.value = getProjectWorkById(title.value.value as string);
});
</script>

<template>
    <nav>
        <ul class="flex gap-2 items-center">
            <li>
                <router-link
                    to="/works/"
                    class="text-cyan-400 hover:underline hover:underline-offset-4"
                >
                    {{ t("general.works") }}
                </router-link>
            </li>
            <li class="font-normal">></li>
            <li>
                <p class="font-bold inline-block">
                    {{ currentProject?.name || title }}
                </p>
                <p
                    v-if="currentProject?.year"
                    class="inline-block bg-orange-100 text-stone-500 rounded-sm dark:bg-slate-400 dark:text-zinc-950 ml-2 p-1"
                >
                    {{ currentProject.year }}
                </p>
            </li>
        </ul>
    </nav>
    <div>
        <p class="font-bold text-2xl py-2">{{ currentProject?.name}}</p>
        <p class="py-2.5">{{ currentProject?.description }}</p>

        <ul v-if="details">
            <li v-if="details.stack">
                <span :class="liClass">Стек</span>{{ details.stack }}
            </li>
            <li v-if="details.website">
                <span :class="liClass">Сайт</span>{{ details.website }}
            </li>
        </ul>

        <div class="flex gap-10 flex-wrap pt-2">
            <img v-for="(image, key) in currentProject?.images"
                 class="w-full h-90 object-contain"
                 :key="key"
                 :src="image"
            />
        </div>
    </div>
</template>
