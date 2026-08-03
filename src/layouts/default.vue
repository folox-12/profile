<script setup>
import VHeader from '@/components/VHeader.vue';
import VHeroModel from '@/components/VHeroModel.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();
const fullPath = computed(() => route.fullPath);

// На разделе работ страница показывается не под ноутбуком, а прямо на его экране
const onScreen = computed(() => route.path.startsWith('/works'));
</script>

<template>
    <div class="flex flex-col h-full bg-bg dark:bg-bg-dark text-ink dark:text-ink-dark transition-colors duration-300">
        <div class="w-full max-w-[960px] mx-auto px-6 flex flex-col flex-grow">
            <v-header />
            <!-- Живёт в лейауте, а не во вью — так сцена переживает переходы между страницами -->
            <div class="flex justify-center">
                <v-hero-model
                    :size="onScreen ? 620 : 300"
                    :screen-text="t('hero.role')"
                    :focused="onScreen"
                >
                    <template #screen>
                        <router-view v-if="onScreen" />
                    </template>
                </v-hero-model>
            </div>
            <main class="flex-grow pb-20">
                <div v-if="!onScreen"
                     v-motion-slide-visible-bottom
                     :key="fullPath">
                    <router-view />
                </div>
            </main>
            <footer class="text-center text-soft dark:text-soft-dark py-2 text-sm">
                © 2026 Vasilev Sergey. All Rights Reserved.
            </footer>
        </div>
    </div>
</template>
