<script setup>
import { computed } from 'vue';
import { useRouteFunction } from '@/composable/useRouteFunction';
import { useI18n } from 'vue-i18n';
import VParagraph from '@/components/VParagraph.vue';
import VDateList from '@/components/VDateList.vue';
import { EMAIL, SKILLS, LINK_TO_GIT, LINK_TO_TELEGRAM, LINK_TO_LINKEDIN, CV_PATH } from '@/constants/general';
import { mdiGithub, mdiLinkedin, mdiEmailOutline } from '@mdi/js';
import VSvgComponent from '@/components/VSvgComponent.vue';
import avatar from '@/assets/avatar.png';

const mdiTelegramPath = 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z';
const { t } = useI18n();
useRouteFunction();

const socialLinks = computed(() => [
    { href: LINK_TO_GIT, icon: mdiGithub, label: t('hero.socialGithub'), external: true },
    { href: LINK_TO_TELEGRAM, icon: mdiTelegramPath, label: t('hero.socialTelegram'), external: true },
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
    }

};
</script>

<template>
    <div class="about flex flex-col gap-12">
        <div class="hero flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            <img
                :src="avatar"
                :alt="t('hero.name')"
                width="96"
                height="96"
                class="w-24 h-24 rounded-full object-cover object-[center_15%] border border-black/10 dark:border-white/[.14] shrink-0"
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
                        :href="CV_PATH"
                        download
                        class="
                        inline-block w-fit
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
                        {{ t('hero.downloadCV') }}
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
                    :key="skill.name"
                    class="
                    flex items-center gap-1.5
                    text-[13px] font-semibold tracking-[.02em]
                    py-2 px-3.5 rounded-lg
                    bg-mint dark:bg-mint-dark
                    text-onmint dark:text-white
                    border border-mintline dark:border-mintline-dark
                    transition-transform
                    hover:-translate-y-0.5
                    "
                >
                    <VSvgComponent
                        :icon="skill.icon"
                        width="16px"
                        height="16px"
                        aria-hidden="true"
                        class="fill-onmint dark:fill-white shrink-0 pointer-events-none"
                    />
                    {{ skill.name }}
                </li>
            </ul>
        </v-paragraph>
    </div>
</template>
