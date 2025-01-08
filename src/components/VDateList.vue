<script setup lang="ts">
import { defineProps } from 'vue';
type DataAboutBio = {
    date: string;
    text: string;
};

defineProps<
{
    data: DataAboutBio[]
}
>();

</script>
<template>
    <ul>
        <li v-for="(element, key) in data"
            class="flex"
            :key="key">
            <span class="mr-2 font-bold">{{ element.date }}</span>
            <span class="break-words break-all">{{ element.text }}</span>
        </li>
    </ul>
</template>
