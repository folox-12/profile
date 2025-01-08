<script setup lang="ts">
import { defineProps } from 'vue';
type Props = {
    title: string;
    description?: string;
}

defineProps<Props>();

</script>
<template>
    <div class="">
        <h2 class="
            block
            py-3 text-xl font-bold
            decoration-4 decoration-gray-600 underline underline-offset-8
            "
        >

            <span v-if="title">{{ title }}</span>
            <span v-else>
                <slot name="title" />
            </span>
        </h2>
        <div v-if="description">
            <span class="block indent-2">
                {{ description }}
            </span>
        </div>
        <div v-else>
            <slot></slot>
        </div>
    </div>
</template>
