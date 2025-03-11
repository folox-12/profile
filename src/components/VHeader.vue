<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { routes } from '@/router/index';
import useChangeTheme from '@/composable/useChangeTheme';
import { LINK_TO_GIT } from '@/constants/general';
import { English, Russian } from '@/i18n';
import VSvgComponent from './VSvgComponent.vue';
import russianFlag from '@/assets/icons/russian_flag.vue';
import engFlag from '@/assets/icons/eng_flag.vue';
import { mdiWhiteBalanceSunny, mdiMoonWaningCrescent } from '@mdi/js';

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

const changeLocale = () => {
    if (currentLocale.value === English) {
        currentLocale.value = Russian;
    } else {
        currentLocale.value = English;
    }
};

const links = computed(() => routes
    .filter(({ meta }) => !meta?.isSubDirectory && meta?.as !== 'link'));

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
