<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { computed, onMounted, ref } from 'vue';
import { getProjectWorkById, ProjectType } from '@/constants/projects';
import useTranslation from '@/composable/useTranslation';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const { workName } = useRouteFunction();
const { getTranslatedDescription } = useTranslation();

const title = computed(() => workName);

const currentProject = ref<ProjectType | undefined>();

const details = computed(() => currentProject.value?.details);

const stackList = computed(() => details.value?.stack?.split(',').map(s => s.trim()) ?? []);

onMounted(() => {
    currentProject.value = getProjectWorkById(title.value.value as string);
});
</script>

<template>
    <div class="text-[13px] text-soft dark:text-soft-dark mb-3.5">
        <router-link
            to="/works/"
            class="underline hover:no-underline"
        >
            {{ t("general.works") }}
        </router-link>
        &nbsp;/&nbsp;
        <span class="text-ink dark:text-ink-dark font-bold">{{ currentProject?.name || title }}</span>
        <span
            v-if="currentProject?.year"
            class="ml-2 py-0.5 px-2 rounded-md bg-tagbg dark:bg-imgbg-dark text-soft dark:text-soft-dark"
        >
            {{ currentProject.year }}
        </span>
    </div>

    <p class="text-[26px] font-bold mb-3.5">{{ currentProject?.name }}</p>
    <p class="text-[15px] leading-[1.7] max-w-[640px] text-soft dark:text-soft-dark mb-[18px]">
        {{ getTranslatedDescription(currentProject?.description) }}
    </p>

    <div v-if="details" class="flex flex-wrap gap-[22px] items-baseline mb-[26px]">
        <div v-if="details.role" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                {{ t('general.role') }}
            </span>
            <span class="text-sm">{{ details.role }}</span>
        </div>
        <div v-if="details.period" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                {{ t('general.period') }}
            </span>
            <span class="text-sm">{{ details.period }}</span>
        </div>
        <div v-if="stackList.length" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
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
        <div v-if="details.website" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                {{ t('general.code') }}
            </span>
            <a
                v-for="(link, index) in details.website"
                :key="index"
                :href="link"
                target="_blank"
                class="text-sm underline hover:no-underline"
            >
                {{ link }}
            </a>
        </div>
    </div>

    <div class="flex flex-col gap-5">
        <div
            v-for="(image, key) in currentProject?.images"
            :key="key"
            class="w-full aspect-video rounded-[14px] overflow-hidden border border-black/10 dark:border-white/[.14]"
        >
            <img
                class="w-full h-full object-cover"
                :src="image"
            />
        </div>
    </div>
</template>
