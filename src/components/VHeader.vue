<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import router, { routes } from '@/router/index';
import useChangeTheme from '@/composable/useChangeTheme';
import { LINK_TO_GIT } from '@/constants/general';
import { English, Russian } from '@/i18n';
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
                            text-2xl dark:text-white text-zinc-800
                            font-bold
                            ` as const;
const links = computed(() => routes
    .filter(({ meta }) => !meta?.isSubDirectory && meta?.as !== 'link'));

const navigateTo = (path: string): void => {
    isMenuOpen.value = false;
    router.push(path);
};
</script>

<template>
    <header class="flex gap-3 justify-between items-center pt-3.5 pb-3.5 backdrop-filter">
        <div class="main-menu flex gap-3 items-center max-md:hidden">
            <router-link
                class="router-link p-2 hover:underline"
                to="/"
            >
                {{t('general.about')}}
            </router-link>
            <router-link
                v-for="(item, index) in links"
                class="router-link p-2 hover:underline"
                :key="index"
                :to="item.path"
            >
                {{ t(item.name as string) }}
            </router-link>
            <a target="_blank" :href="LINK_TO_GIT">{{ t('general.source') }}</a>
        </div>
        <div class="grow flex justify-end gap-1">
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
            <VSvgComponent
                v-for="({ show, viewBox, component }, key) in flags"
                v-show="show"
                :key="key"
                :viewBox="viewBox"
                @click="() => changeLocale()"
            >
                <component :is="component"/>
            </VSvgComponent>
            <VSvgComponent class="md:hidden ml-5 dark:fill-white"
                           viewBox="0 0 24 24"
                           :icon="mdiMenu"
                           @click="isMenuOpen = true"
            />

            <div
                v-if="isMenuOpen"
                class="
                md:hidden
                fixed size-full top-0 left-0 z-50
                bg-stone-800 bg-opacity-90 backdrop-blur-sm
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
.router-link-exact-active {
  background-color: #6EDCC4C8;

  &:hover {
    color: black;
  }
}
</style>
