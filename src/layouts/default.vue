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
// На карточке проекта панель встаёт вертикально — так помещается вся страница
const portrait = computed(() => onScreen.value && Boolean(route.params.id));
</script>

<template>
    <div class="flex flex-col h-full overflow-x-clip bg-bg dark:bg-bg-dark text-ink dark:text-ink-dark transition-colors duration-300">
        <!-- Колонка шире только на широких экранах; читаемость текста держит собственный
             предел в VParagraph, поэтому строки не растягиваются вслед за ней -->
        <div class="w-full max-w-[960px] lg:max-w-[1080px] xl:max-w-[1200px] mx-auto px-6 flex flex-col flex-grow">
            <v-header />
            <!-- Кнопка возврата живёт снаружи ноутбука: внутри экрана она уехала бы вместе
                 со скроллом страницы, а выйти к витрине нужно из любого места -->
            <router-link
                v-if="portrait"
                to="/works/"
                class="
                self-start inline-flex items-center gap-2 mb-2
                py-2 px-4 rounded-[10px]
                text-sm font-bold
                bg-card dark:bg-card-dark
                border border-black/10 dark:border-white/[.14]
                transition hover:-translate-y-0.5 hover:border-mintline/60 dark:hover:border-mintline-dark/60
                focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                "
            >
                <span aria-hidden="true">←</span>
                {{ t('general.backToWorks') }}
            </router-link>
            <!-- Живёт в лейауте, а не во вью — так сцена переживает переходы между страницами -->
            <div
                class="flex justify-center"
                :class="{ 'hero-breakout': onScreen && !portrait }"
            >
                <v-hero-model
                    :size="portrait ? 'min(880px, 78vh)' : (onScreen ? 820 : 300)"
                    :screen-text="t('hero.role')"
                    :focused="onScreen"
                    :portrait="portrait"
                >
                    <template #screen>
                        <router-view v-if="onScreen" />
                    </template>
                </v-hero-model>
            </div>
            <main class="flex-grow pb-8">
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
/* В фокусе сцена выходит за колонку на всю ширину окна: в 960 px панель
   упиралась бы по ширине раньше, чем по высоте, и оставалась мелкой */
.hero-breakout {
    width: 100vw;
    margin-left: calc(50% - 50vw);
}
</style>
