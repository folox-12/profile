<script setup lang="ts">
import { routes } from '@/router/index';
import { computed, ComputedRef } from 'vue';
import { RouteRecordRaw } from 'vue-router';

const links: ComputedRef<Array<RouteRecordRaw>> = computed(() => routes);

</script>

<template>
    <router-link v-for="(item, index) in links" :key="index" :to="item.path">
        {{$t(item.name as string)}}
    </router-link>
</template>
