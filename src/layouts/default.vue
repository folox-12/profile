<script setup>
import VHeader from '@/components/VHeader.vue';
import VHeroModel from '@/components/VHeroModel.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';

const route = useRoute();
const { t } = useI18n();
const fullPath = computed(() => route.fullPath);

// На разделе работ страница показывается не под ноутбуком, а прямо на его экране.
// На узких экранах это нечитаемо, поэтому там всё как раньше: ноутбук сверху, список под ним
const isWide = useMediaQuery('(min-width: 768px)');
const onScreen = computed(() => route.path.startsWith('/works') && isWide.value);
</script>

<template>
    <div class="flex flex-col h-full overflow-x-clip bg-bg dark:bg-bg-dark text-ink dark:text-ink-dark transition-colors duration-300">
        <div class="w-full max-w-[960px] mx-auto px-6 flex flex-col flex-grow">
            <v-header />
            <!-- Живёт в лейауте, а не во вью — так сцена переживает переходы между страницами -->
            <div
                class="flex justify-center -mt-8"
                :class="{ 'hero-breakout': onScreen }"
            >
                <v-hero-model
                    :size="onScreen ? 780 : 300"
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

<style scoped>
/* В фокусе сцена выходит за колонку на всю ширину окна — дисплею нужен весь кадр.
   Отрицательный отступ снизу подтягивает футер под сцену: канва прозрачная,
   поэтому ноутбук просто накрывает его, а не срезается о край блока */
.hero-breakout {
    position: relative;
    z-index: 1;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-bottom: -110px;
}
</style>
