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
// Ниже 880 px это нечитаемо, поэтому там всё как раньше: ноутбук сверху, список под ним.
// Порог совпадает с брейкпоинтом md в конфиге Tailwind
const isWide = useMediaQuery('(min-width: 880px)');
const onScreen = computed(() => route.path.startsWith('/works') && isWide.value);
// На карточке проекта камера уходит вплотную к дисплею: в кадре остаётся только
// экран, и страница видна целиком. Назад к витрине — камера отъезжает
const detail = computed(() => onScreen.value && Boolean(route.params.id));
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
                v-if="detail"
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
            <!-- Высота блока задаёт размер модели в кадре. Привязка к высоте окна
                 убрана намеренно: на низком окне она ужимала дисплей, хотя по
                 ширине колонки место оставалось. Ограничитель по vw бережёт
                 пропорции на узких экранах -->
            <div
                class="flex justify-center shrink-0"
                :class="{ 'hero-breakout': onScreen }"
            >
                <v-hero-model
                    :size="onScreen ? 'min(880px, 78vw)' : 340"
                    :screen-text="t('hero.role')"
                    :focused="onScreen"
                    :detail="detail"
                >
                    <template #screen>
                        <router-view v-if="onScreen" />
                    </template>
                </v-hero-model>
            </div>
            <main :class="onScreen ? 'shrink-0' : 'flex-grow pb-8'">
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
/* В фокусе сцена выходит за колонку на всю ширину окна: колонка обрезала бы
   дисплей, а он и есть содержимое страницы */
.hero-breakout {
    width: 100vw;
    margin-left: calc(50% - 50vw);
}
</style>
