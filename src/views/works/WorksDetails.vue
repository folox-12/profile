<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getProjectWorkById, ProjectType } from '@/constants/projects';

const { workName } = useRouteFunction();
const { t } = useI18n();

const title = computed(() => workName);

const currentProject = ref<ProjectType | undefined>();

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
                <span class="font-bold inline-block">
                    {{ currentProject?.name || title }}
                </span>
                <span
                    v-if="currentProject?.year"
                    class="inline-block bg-orange-100 text-stone-500 rounded-sm dark:bg-slate-400 dark:text-zinc-950 ml-2 p-1"
                >
                    {{ currentProject.year }}
                </span>
            </li>
        </ul>
    </nav>
    <div class="main-content">
        {{ currentProject?.description }}
    </div>
</template>
