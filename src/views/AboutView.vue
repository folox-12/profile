<script setup>
import { computed } from 'vue';
import { useRouteFunction } from '@/composable/useRouteFunction';
import { useI18n } from 'vue-i18n';
import VParagraph from '@/components/VParagraph.vue';
import VDateList from '@/components/VDateList.vue';
import { EMAIL, SKILLS, LINK_TO_GIT, LINK_TO_TELEGRAM, LINK_TO_LINKEDIN, RESUME_PATH } from '@/constants/general';
import { mdiGithub, mdiTelegram, mdiLinkedin, mdiEmailOutline } from '@mdi/js';
import VSvgComponent from '@/components/VSvgComponent.vue';
import avatar from '@/assets/avatar.jpg';
const { t } = useI18n();
useRouteFunction();

const socialLinks = computed(() => [
    { href: LINK_TO_GIT, icon: mdiGithub, label: t('hero.socialGithub'), external: true },
    { href: LINK_TO_TELEGRAM, icon: mdiTelegram, label: t('hero.socialTelegram'), external: true },
    { href: LINK_TO_LINKEDIN, icon: mdiLinkedin, label: t('hero.socialLinkedin'), external: true },
    { href: `mailto:${EMAIL}`, icon: mdiEmailOutline, label: t('hero.socialEmail'), external: false }
]);

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
        <div class="hero flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            <img
                :src="avatar"
                :alt="t('hero.name')"
                class="w-24 h-24 rounded-full object-cover border border-black/10 dark:border-white/[.14] shrink-0"
            >
            <div class="flex flex-col items-center sm:items-start">
                <p class="text-[32px] font-bold leading-tight">{{ t('hero.name') }}</p>
                <p class="text-base text-soft dark:text-soft-dark mt-1">{{ t('hero.role') }}</p>
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3.5">
                    <a
                        v-for="link in socialLinks"
                        :key="link.label"
                        :href="link.href"
                        :target="link.external ? '_blank' : undefined"
                        :aria-label="link.label"
                        class="
                        flex items-center justify-center w-9 h-9 rounded-full
                        border border-black/10 dark:border-white/[.14]
                        bg-card dark:bg-card-dark
                        transition-transform hover:-translate-y-0.5
                        focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                        "
                    >
                        <VSvgComponent
                            :icon="link.icon"
                            width="18px"
                            height="18px"
                            class="fill-ink dark:fill-ink-dark"
                        />
                    </a>
                    <a
                        :href="RESUME_PATH"
                        download
                        class="
                        inline-block w-fit
                        py-2 px-4 rounded-[10px]
                        text-sm font-bold
                        bg-mint dark:bg-mint-dark
                        text-onmint dark:text-white
                        border border-mintline dark:border-mintline-dark
                        shadow-[0_2px_0_#7cc79c] dark:shadow-[0_2px_0_#3d9478]
                        hover:brightness-95
                        transition
                        focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                        "
                    >
                        {{ t('hero.downloadResume') }}
                    </a>
                </div>
            </div>
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
