<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import router, { routes } from '@/router/index';
import useChangeTheme from '@/composable/useChangeTheme';
import { LINK_TO_GIT } from '@/constants/general';
import { English, Russian } from '@/locales';
import VSvgComponent from './VSvgComponent.vue';
import russianFlag from '@/assets/icons/russian_flag.vue';
import engFlag from '@/assets/icons/eng_flag.vue';
import { mdiWhiteBalanceSunny, mdiMoonWaningCrescent, mdiMenu, mdiClose } from '@mdi/js';

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

const menuMobileLinksClass = `
                            hover:cursor-pointer
                            text-2xl text-white
                            font-bold
                            text-white
                            ` as const;
const links = computed(() => routes
    .filter(({ meta }) => !meta?.isSubDirectory && meta?.as !== 'link'));

const navigateTo = (path: string): void => {
    isMenuOpen.value = false;
    router.push(path);
};
</script>

<template>
    <header class="flex gap-4 justify-between items-center flex-wrap pt-7 pb-7">
        <div class="main-menu flex gap-2 items-center max-md:hidden">
            <router-link
                class="router-link py-2.5 px-4 rounded-lg font-medium transition-colors"
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
            <a class="py-2.5 px-4 rounded-lg font-medium text-soft dark:text-soft-dark hover:underline"
               target="_blank"
               :href="LINK_TO_GIT"
            >
                {{ t('general.source') }}
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
                v-if="isDark"
                v-motion-slide-bottom
                fill="yellow"
                :icon="mdiWhiteBalanceSunny"
                @click="toggleTheme"
            />
            <VSvgComponent
                v-else
                v-motion-slide-bottom
                fill="MediumSlateBlue"
                :icon="mdiMoonWaningCrescent"
                @click="toggleTheme"
            />
            <VSvgComponent class="md:hidden ml-2 dark:fill-white"
                           viewBox="0 0 24 24"
                           :icon="mdiMenu"
                           @click="isMenuOpen = true"
            />

            <div
                v-if="isMenuOpen"
                class="
                md:hidden
                fixed size-full top-0 left-0 z-50
                bg-ink/90 dark:bg-bg-dark/95 backdrop-blur-sm
                "
            >
                <div
                    v-motion-slide-visible-once-right
                    class="
                    relative
                    h-full
                    flex items-center justify-center flex-col gap-1
                    "
                >
                    <span
                        :class="menuMobileLinksClass"
                        @click="navigateTo('/')"
                    >

                        {{t('general.about')}}
                    </span>
                    <span
                        v-for="(item, index) in links"
                        :class="menuMobileLinksClass"
                        :key="index"
                        @click="navigateTo(item.path)"
                    >
                        {{ t(item.name as string) }}
                    </span>
                    <a target="_blank"
                       :class="menuMobileLinksClass"
                       :href="LINK_TO_GIT"
                    >
                        {{ t('general.source') }}
                    </a>
                    <VSvgComponent
                        class="absolute top-2 right-2"
                        fill="white"
                        :icon="mdiClose"
                        @click="isMenuOpen = false"
                    />
                </div>
            </div>
        </div>
    </header>
</template>
<style>
.router-link {
  color: theme('colors.soft');
}
.dark .router-link {
  color: theme('colors.soft-dark');
}
.router-link-exact-active {
  font-weight: 700;
  background-color: theme('colors.mint / 20%');
  color: theme('colors.ink');
}
.dark .router-link-exact-active {
  background-color: theme('colors.nav-active-dark');
  color: #fff;
}
</style>
