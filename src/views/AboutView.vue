<script setup>
import { computed } from 'vue';
import { useRouteFunction } from '@/composable/useRouteFunction';
import { useI18n } from 'vue-i18n';
import VParagraph from '@/components/VParagraph.vue';
import VDateList from '@/components/VDateList.vue';
import { EMAIL, SKILLS } from '@/constants/general';
const { t } = useI18n();
useRouteFunction();

const blocks = {
    work: {
        title: computed(() => t('about.work')),
        description: computed(() => t('aboutText'))
    },

    bio: {
        title: computed(() => t('about.BIO')),
        data: [
            {
                date: '2019-2023',
                text: computed(() => t('BIO.college'))
            },
            {
                date: computed(() => `2024-${t('general.now')}`),
                text: computed(() => t('BIO.university'))
            }
        ]
    },

    skills: {
        title: computed(() => t('about.skills'))
    },

    contacts: {
        title: computed(() => t('about.contacts'))
    }

};
</script>

<template>
    <div class="about flex flex-col gap-12">
        <div class="hero flex flex-col">
            <p class="text-[32px] font-bold leading-tight">{{ t('hero.name') }}</p>
            <p class="text-base text-soft dark:text-soft-dark mt-1">{{ t('hero.role') }}</p>
        </div>
        <v-paragraph
            :title="blocks.work.title"
            :description="blocks.work.description"
        >
            <template #underDescription>
                <router-link
                    to="/works"
                    class="
                    inline-block w-fit
                    py-3 px-[22px] rounded-[10px]
                    font-bold
                    bg-mint dark:bg-mint-dark
                    text-onmint dark:text-white
                    border border-mintline dark:border-mintline-dark
                    shadow-[0_2px_0_#7cc79c] dark:shadow-[0_2px_0_#3d9478]
                    hover:brightness-95
                    transition
                    "
                >
                    {{  t('general.works') + " >" }}
                </router-link>
            </template>
        </v-paragraph>
        <v-paragraph
            :title="blocks.bio.title"
        >
            <v-date-list :data="blocks.bio.data"></v-date-list>
        </v-paragraph>
        <v-paragraph
            :title="blocks.skills.title"
        >
            <ul class="flex flex-wrap gap-2.5">
                <li
                    v-for="skill in SKILLS"
                    :key="skill"
                    class="
                    text-[13px] font-semibold tracking-[.02em]
                    py-2 px-3.5 rounded-lg
                    bg-mint dark:bg-mint-dark
                    text-onmint dark:text-white
                    border border-mintline dark:border-mintline-dark
                    transition-transform
                    hover:-translate-y-0.5
                    "
                >
                    {{ skill }}
                </li>
            </ul>
        </v-paragraph>
        <v-paragraph
            :title="blocks.contacts.title"
        >
            <a
                :href="`mailto:${EMAIL}`"
                class="inline-block text-[15px] underline underline-offset-[3px]"
            >
                {{ EMAIL }}
            </a>
        </v-paragraph>
    </div>
</template>
