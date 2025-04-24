<script setup>
import { computed } from 'vue';
import { useRouteFunction } from '@/composable/useRouteFunction';
import { useI18n } from 'vue-i18n';
import VParagraph from '@/components/VParagraph.vue';
import VDateList from '@/components/VDateList.vue';
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
    }

};
</script>

<template>
    <div class="about flex flex-col gap-4">
        <v-paragraph
            :title="blocks.work.title"
            :description="blocks.work.description"
        >
            <template #underDescription>
                <router-link
                    to="/works"
                    class="
                    inline-block p-2 rounded bg-emerald-200
                     dark:bg-emerald-400 dark:text-white
                     hover:bg-emerald-500
                     transition-all
                     font-bold
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
    </div>
</template>
