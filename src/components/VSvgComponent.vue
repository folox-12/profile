<script setup lang="ts">
import { defineProps, toRefs, withDefaults, defineEmits } from 'vue';
type SvgProps = {
  fill?: string,
  width?: string,
  height?: string,
  icon?: string,
  viewBox?: string,
}

const emit = defineEmits<{(e: 'click'): void, } >();

const click = () => emit('click');

const props = withDefaults(defineProps<SvgProps>(), {
    fill: 'dark',
    width: '24px',
    height: '24px',
    viewBox: '0 0 24 24'
});

const { fill, width, height, icon, viewBox } = toRefs(props);
</script>
<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        class="hover:cursor-pointer"
        :viewBox="viewBox"
        :fill="fill"
        :width="width"
        :height="height"
        @click="click"
    >
        <slot v-if="icon">
            <path :d="icon" />
        </slot>
        <slot v-else />
    </svg>
</template>
