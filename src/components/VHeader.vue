<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { routes } from '@/router/index';
import useChangeTheme from '@/composable/useChangeTheme';
import { LINK_TO_GIT } from '@/constants/general';
import { English, Russian } from '@/locales';
import VSvgComponent from './VSvgComponent.vue';
import russianFlag from '@/assets/icons/russian_flag.vue';
import engFlag from '@/assets/icons/eng_flag.vue';
import { mdiWhiteBalanceSunny, mdiMoonWaningCrescent, mdiMenu, mdiClose, mdiOpenInNew } from '@mdi/js';

const { t, locale } = useI18n();
const { toggleTheme, isThemeDark: isDark } = useChangeTheme();

const currentLocale = computed<string>({
    get: () => locale.value,
    set: (value: string) => { locale.value = value; }
});

const flags = computed<{
    viewBox: string,
    component: Component,
    show: boolean,
}[]>(() => [
    {
        viewBox: '0 0 55.2 38.4',
        component: engFlag,
        show: currentLocale.value === English

    },
    {
        viewBox: '0 0 9 6',
        component: russianFlag,
        show: currentLocale.value === Russian
    }
]);

const isMenuOpen = ref(false);

const changeLocale = () => {
    if (currentLocale.value === English) {
        currentLocale.value = Russian;
        localStorage.setItem('locale', Russian);
    } else {
        currentLocale.value = English;
        localStorage.setItem('locale', English);
    }
};

const links = computed(() => routes
    .filter(({ meta }) => !meta?.isSubDirectory && meta?.as !== 'link'));

const closeMenu = () => {
    isMenuOpen.value = false;
};

const onMenuKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closeMenu();
    }
};

// Пока меню открыто, страница под ним не должна прокручиваться
watch(isMenuOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
        window.addEventListener('keydown', onMenuKey);
    } else {
        window.removeEventListener('keydown', onMenuKey);
    }
});

onBeforeUnmount(() => {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onMenuKey);
});
</script>

<template>
    <header class="flex gap-4 justify-between items-center flex-wrap pt-7 pb-7">
        <div class="main-menu flex gap-2 items-center max-md:hidden">
            <router-link
                class="router-link router-link--home py-2.5 px-4 rounded-lg font-medium transition-colors"
                to="/"
            >
                {{t('general.about')}}
            </router-link>
            <router-link
                v-for="(item, index) in links"
                class="router-link py-2.5 px-4 rounded-lg font-medium transition-colors"
                :key="index"
                :to="item.path"
            >
                {{ t(item.name as string) }}
            </router-link>
            <a class="
               flex items-center gap-1
               py-2.5 px-4 rounded-lg font-medium
               text-soft dark:text-soft-dark
               hover:underline
               "
               target="_blank"
               rel="noopener noreferrer"
               :href="LINK_TO_GIT"
            >
                {{ t('general.source') }}
                <VSvgComponent
                    :icon="mdiOpenInNew"
                    width="14px"
                    height="14px"
                    class="fill-soft dark:fill-soft-dark"
                />
            </a>
        </div>
        <div class="grow flex justify-end items-center gap-3.5">
            <div class="flex border border-black/10 dark:border-white/[.14] rounded-full overflow-hidden text-[13px] font-bold select-none">
                <span
                    class="py-1.5 px-3 cursor-pointer transition-colors"
                    :class="currentLocale === Russian
                        ? 'bg-mint dark:bg-mint-dark text-onmint dark:text-white'
                        : 'text-soft dark:text-soft-dark'"
                    @click="changeLocale"
                >RU</span>
                <span
                    class="py-1.5 px-3 cursor-pointer transition-colors"
                    :class="currentLocale === English
                        ? 'bg-mint dark:bg-mint-dark text-onmint dark:text-white'
                        : 'text-soft dark:text-soft-dark'"
                    @click="changeLocale"
                >EN</span>
            </div>
            <VSvgComponent
                :fill="isDark ? 'yellow' : 'MediumSlateBlue'"
                :icon="isDark ? mdiWhiteBalanceSunny : mdiMoonWaningCrescent"
                :aria-label="t('general.toggleTheme')"
                role="button"
                tabindex="0"
                class="focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none rounded-full"
                @click="toggleTheme"
                @keydown.enter="toggleTheme"
            />
            <VSvgComponent class="md:hidden ml-2 dark:fill-white focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none rounded-full"
                           viewBox="0 0 24 24"
                           :icon="mdiMenu"
                           :aria-label="t('general.openMenu')"
                           role="button"
                           tabindex="0"
                           @click="isMenuOpen = true"
                           @keydown.enter="isMenuOpen = true"
            />

            <transition name="menu">
                <!-- Панель выезжает справа, фон под ней закрывает меню по клику -->
                <div
                    v-if="isMenuOpen"
                    class="md:hidden fixed inset-0 z-50"
                >
                    <div
                        class="absolute inset-0 bg-ink/50 dark:bg-black/70 backdrop-blur-sm"
                        @click="closeMenu"
                    ></div>
                    <nav
                        class="
                        menu-panel
                        absolute top-0 right-0 h-full w-[min(320px,84vw)]
                        flex flex-col p-5
                        bg-bg dark:bg-bg-dark
                        border-l border-black/10 dark:border-white/[.14]
                        shadow-[-18px_0_40px_rgba(0,0,0,0.18)]
                        "
                    >
                        <VSvgComponent
                            class="self-end mb-4 fill-ink dark:fill-ink-dark focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none rounded-full"
                            width="26px"
                            height="26px"
                            :icon="mdiClose"
                            :aria-label="t('general.closeMenu')"
                            role="button"
                            tabindex="0"
                            @click="closeMenu"
                            @keydown.enter="closeMenu"
                        />
                        <router-link
                            class="router-link router-link--home menu-link"
                            to="/"
                            @click="closeMenu"
                        >
                            {{ t('general.about') }}
                        </router-link>
                        <router-link
                            v-for="(item, index) in links"
                            :key="index"
                            class="router-link menu-link"
                            :to="item.path"
                            @click="closeMenu"
                        >
                            {{ t(item.name as string) }}
                        </router-link>
                        <a
                            class="menu-link flex items-center gap-2 text-soft dark:text-soft-dark"
                            target="_blank"
                            rel="noopener noreferrer"
                            :href="LINK_TO_GIT"
                            @click="closeMenu"
                        >
                            {{ t('general.source') }}
                            <VSvgComponent
                                :icon="mdiOpenInNew"
                                width="16px"
                                height="16px"
                                class="fill-soft dark:fill-soft-dark"
                            />
                        </a>
                    </nav>
                </div>
            </transition>
        </div>
    </header>
</template>
<style>
.menu-link {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  transition: background-color .2s ease, color .2s ease;
}
.menu-enter-active,
.menu-leave-active {
  transition: opacity .22s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
.menu-enter-active .menu-panel,
.menu-leave-active .menu-panel {
  transition: transform .28s cubic-bezier(.2, .8, .2, 1);
}
.menu-enter-from .menu-panel,
.menu-leave-to .menu-panel {
  transform: translateX(100%);
}
.router-link {
  color: theme('colors.soft');
}
.dark .router-link {
  color: theme('colors.soft-dark');
}
/* Раздел остаётся активным и на вложенных страницах: /works/:id подсвечивает «Работы».
   Ссылка на главную исключена — её путь совпадает с началом любого маршрута */
.router-link-active:not(.router-link--home),
.router-link--home.router-link-exact-active {
  font-weight: 700;
  background-color: theme('colors.mint');
  color: theme('colors.onmint');
}
.dark .router-link-active:not(.router-link--home),
.dark .router-link--home.router-link-exact-active {
  background-color: theme('colors.nav-active-dark');
  color: #fff;
}
</style>
