<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { computed, onMounted, ref } from 'vue';
import { getProjectWorkById, ProjectType, PROJECT_WORKS } from '@/constants/projects';
import useTranslation from '@/composable/useTranslation';
import { useI18n } from 'vue-i18n';
import VSvgComponent from '@/components/VSvgComponent.vue';
import { mdiOpenInNew } from '@mdi/js';
const { t } = useI18n();

const { workName } = useRouteFunction();
const { getTranslatedDescription } = useTranslation();

const title = computed(() => workName);

const currentProject = ref<ProjectType | undefined>();

const details = computed(() => currentProject.value?.details);

const currentIndex = computed(() => PROJECT_WORKS.findIndex(p => p.id === currentProject.value?.id));

const prevProject = computed<ProjectType | undefined>(() => {
    if (currentIndex.value === -1 || PROJECT_WORKS.length < 2) return undefined;
    const index = (currentIndex.value - 1 + PROJECT_WORKS.length) % PROJECT_WORKS.length;
    return PROJECT_WORKS[index];
});

const nextProject = computed<ProjectType | undefined>(() => {
    if (currentIndex.value === -1 || PROJECT_WORKS.length < 2) return undefined;
    const index = (currentIndex.value + 1) % PROJECT_WORKS.length;
    return PROJECT_WORKS[index];
});

const stackList = computed(() => details.value?.stack?.split(',').map(s => s.trim()) ?? []);

onMounted(() => {
    currentProject.value = getProjectWorkById(title.value.value as string);
});
</script>

<template>
    <div class="text-[13px] text-soft dark:text-soft-dark mb-5">
        <router-link
            to="/works/"
            class="hover:underline hover:text-ink dark:hover:text-ink-dark transition-colors"
        >
            {{ t("general.works") }}
        </router-link>
        <span class="mx-1.5 opacity-60">/</span>
        <span class="text-ink dark:text-ink-dark font-bold">{{ currentProject?.name || title }}</span>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-1.5">
        <p class="text-[28px] sm:text-[32px] font-bold font-serif tracking-tight">{{ currentProject?.name }}</p>
        <span
            v-if="currentProject?.year"
            class="py-1 px-2.5 rounded-md bg-tagbg dark:bg-imgbg-dark text-soft dark:text-soft-dark text-xs font-bold"
        >
            {{ currentProject.year }}
        </span>
    </div>
    <p v-if="details?.role || details?.period" class="text-sm text-soft dark:text-soft-dark mb-4">
        <span v-if="details.role">{{ details.role }}</span>
        <span v-if="details.role && details.period"> · </span>
        <span v-if="details.period">{{ details.period }}</span>
    </p>

    <p class="text-[16px] leading-[1.75] max-w-[640px] text-soft dark:text-soft-dark mb-7">
        {{ getTranslatedDescription(currentProject?.description) }}
    </p>

    <div
        v-if="stackList.length || details?.website"
        class="
        flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10
        mb-9 p-5 rounded-2xl
        bg-card dark:bg-card-dark
        border border-black/10 dark:border-white/[.14]
        "
    >
        <div v-if="stackList.length" class="flex-1">
            <span class="block text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark mb-2">
                {{ t('general.stack') }}
            </span>
            <div class="flex flex-wrap gap-1.5">
                <span
                    v-for="tech in stackList"
                    :key="tech"
                    class="text-xs font-semibold py-1 px-2.5 rounded-md bg-mint dark:bg-mint-dark text-onmint dark:text-white"
                >
                    {{ tech }}
                </span>
            </div>
        </div>
        <div v-if="details?.website" class="flex flex-wrap gap-2">
            <a
                v-for="(link, index) in details.website"
                :key="index"
                :href="link"
                target="_blank"
                rel="noopener noreferrer"
                class="
                flex items-center gap-1.5
                py-2 px-4 rounded-[10px]
                text-sm font-bold
                bg-mint dark:bg-mint-dark
                text-onmint
                border border-mintline dark:border-mintline-dark
                shadow-[0_2px_0_#7cc79c] dark:shadow-[0_2px_0_#3d9478]
                hover:brightness-95
                transition
                focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                "
            >
                {{ t('general.code') }}
                <VSvgComponent
                    :icon="mdiOpenInNew"
                    width="14px"
                    height="14px"
                    class="fill-onmint"
                />
            </a>
        </div>
    </div>

    <div
        v-if="currentProject?.images?.length"
        class="grid gap-4 sm:grid-cols-2"
    >
        <div
            v-for="(image, key) in currentProject?.images"
            :key="key"
            class="
            w-full aspect-video rounded-[14px] overflow-hidden
            border border-black/10 dark:border-white/[.14]
            shadow-[0_1px_2px_rgba(0,0,0,0.04)]
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)]
            "
            :class="key === 0 ? 'sm:col-span-2' : ''"
        >
            <img
                class="w-full h-full object-cover"
                :src="image"
                :alt="`${currentProject?.name} — ${key + 1}`"
            />
        </div>
    </div>

    <div
        v-if="prevProject || nextProject"
        class="grid sm:grid-cols-2 gap-4 mt-10 pt-8 border-t border-black/10 dark:border-white/[.14]"
    >
        <router-link
            v-if="prevProject"
            :to="prevProject.to"
            class="
            group flex items-center gap-3
            p-4 rounded-2xl
            bg-card dark:bg-card-dark
            border border-black/10 dark:border-white/[.14]
            transition-all
            hover:-translate-y-0.5 hover:border-mintline/60 dark:hover:border-mintline-dark/60 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]
            focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
            "
        >
            <span
                aria-hidden="true"
                class="text-lg text-soft dark:text-soft-dark transition-transform group-hover:-translate-x-0.5"
            >←</span>
            <span class="flex flex-col">
                <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                    {{ t('general.prevProject') }}
                </span>
                <span class="font-bold">{{ prevProject.name }}</span>
            </span>
        </router-link>
        <span v-else class="hidden sm:block"></span>
        <router-link
            v-if="nextProject"
            :to="nextProject.to"
            class="
            group flex items-center justify-end gap-3 text-right
            p-4 rounded-2xl
            bg-card dark:bg-card-dark
            border border-black/10 dark:border-white/[.14]
            transition-all
            hover:-translate-y-0.5 hover:border-mintline/60 dark:hover:border-mintline-dark/60 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)]
            focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
            "
        >
            <span class="flex flex-col items-end">
                <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                    {{ t('general.nextProject') }}
                </span>
                <span class="font-bold">{{ nextProject.name }}</span>
            </span>
            <span
                aria-hidden="true"
                class="text-lg text-soft dark:text-soft-dark transition-transform group-hover:translate-x-0.5"
            >→</span>
        </router-link>
    </div>
</template>
