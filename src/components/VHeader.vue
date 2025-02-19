<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { routes } from '@/router/index';
import useChangeTheme from '@/composable/useChangeTheme';
import { LINK_TO_GIT } from '@/constants/general';
import { English, Russian } from '@/i18n';

const { t, locale } = useI18n();
const { toggleTheme } = useChangeTheme();

const changeLocale = () => {
    if (locale.value === English) {
        locale.value = Russian;
    } else {
        locale.value = English;
    }
};

const links = computed(() => routes.filter(({ meta }) => !meta?.isSubDirectory && meta?.as !== 'link'));

</script>

<template>
    <header class="flex gap-3 justify-between items-center pt-3.5 pb-3.5 backdrop-filter">
        <div class="main-menu flex gap-3 items-center">
            <router-link
                class="router-link p-2 hover:underline"
                to="/"> {{t('general.about')}} </router-link>
            <router-link
                v-for="(item, index) in links"
                class="router-link p-2 hover:underline"
                :key="index"
                :to="item.path">
                {{ t(item.name as string) }}
            </router-link>
            <a target="_blank" :href="LINK_TO_GIT">{{ t('general.source') }}</a>
        </div>
        <div class="head-buttons">
            <div class="size-2 bg-red-800" @click="toggleTheme" />
            <div class="size-2 bg-red-800" @click="changeLocale" />
        </div>
    </header>
</template>
<style>
.router-link-exact-active {
  background-color: #6edcc4c8;

  &:hover {
    color: black;
  }
}
</style>
