<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { PROJECT_WORKS } from '@/constants/projects';
import { computed, reactive, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { workName } = useRouteFunction();
const { t } = useI18n();

const JS_FRAMEWORKS = new Set([
    'react', 'vue', 'nuxt', 'nuxt2', 'node.js', 'express.js', 'pinia', 'zustand'
]);
const JS_LANGUAGE = new Set(['javascript', 'typescript']);

const techPriority = (tech: string): number => {
    const lower = tech.toLowerCase();
    if (JS_FRAMEWORKS.has(lower)) return 2;
    if (JS_LANGUAGE.has(lower)) return 1;
    return 0;
};

const ProjectWithDescription = PROJECT_WORKS.map(({ shortDescription, description, ...other }) => {
    const stackList = other.details?.stack?.split(',').map(s => s.trim()) ?? [];
    const sortedStack = [...stackList].sort((a, b) => techPriority(b) - techPriority(a));
    const primaryTech = techPriority(sortedStack[0] ?? '') > 0 ? sortedStack[0] : undefined;
    return {
        shortDescription: computed(() => t(shortDescription)),
        description: computed(() => t(description)),
        tags: sortedStack.slice(0, 3),
        primaryTech,
        ...other
    };
});

const carouselIndex = reactive<Record<string, number>>({});

const currentIndex = (id: string) => carouselIndex[id] ?? 0;

const shiftImage = (id: string, count: number, dir: number, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const current = currentIndex(id);
    carouselIndex[id] = (current + dir + count) % count;
};

const setImage = (id: string, index: number, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    carouselIndex[id] = index;
};

const hoverTimers: Record<string, ReturnType<typeof setInterval>> = {};

const stopAutoplay = (id: string) => {
    if (hoverTimers[id]) {
        clearInterval(hoverTimers[id]);
        delete hoverTimers[id];
    }
};

const startAutoplay = (id: string, count: number) => {
    if (count < 2) return;
    stopAutoplay(id);
    hoverTimers[id] = setInterval(() => {
        carouselIndex[id] = (currentIndex(id) + 1) % count;
    }, 1200);
};

const hovering = reactive<Record<string, boolean>>({});

const activateCard = (id: string, count: number) => {
    hovering[id] = true;
    startAutoplay(id, count);
};

const deactivateCard = (id: string) => {
    hovering[id] = false;
    stopAutoplay(id);
};

onUnmounted(() => {
    Object.keys(hoverTimers).forEach(stopAutoplay);
});
</script>

<template>
    <div>
        <span class="
            inline-block
            mb-6 text-[26px] font-bold
            pb-2 border-b-[3px] border-ink dark:border-ink-dark
            "
        >
            {{ workName }}
        </span>
        <div class="works grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[22px]">
            <router-link v-for="({ id, name, to, media, shortDescription, tags, primaryTech }, key) in ProjectWithDescription"
                         class="
                         group
                         bg-card dark:bg-card-dark
                         border border-black/10 dark:border-white/[.14]
                         rounded-2xl p-5
                         flex flex-col gap-3.5
                         shadow-[0_1px_2px_rgba(0,0,0,0.04)]
                         transition-all duration-300 ease-out
                         hover:-translate-y-1.5 hover:shadow-[0_18px_32px_rgba(0,0,0,0.14)] hover:border-mintline/60 dark:hover:border-mintline-dark/60
                         focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                         "
                         :key=key
                         :to="to"
                         @mouseenter="activateCard(id, media.length)"
                         @mouseleave="deactivateCard(id)"
                         @focusin="activateCard(id, media.length)"
                         @focusout="deactivateCard(id)">
                <div class="laptop-frame relative w-full h-[230px] flex items-end justify-center rounded-[10px] overflow-hidden pb-[18px] bg-imgbg dark:bg-imgbg-dark ring-1 ring-black/5 dark:ring-white/5">
                    <div class="laptop-tilt relative w-[220px]">
                        <div class="relative w-full aspect-[16/10] bg-[#1b1b1b] rounded-t-lg rounded-b-[3px] p-[7px_7px_9px] shadow-[0_20px_26px_rgba(0,0,0,0.25)]">
                            <div class="relative w-full h-full rounded-[3px] overflow-hidden bg-black">
                                <template v-for="(item, imgKey) in media" :key="imgKey">
                                    <video v-if="item.type === 'video' && imgKey === currentIndex(id) && hovering[id]"
                                           class="absolute inset-0 w-full h-full object-cover"
                                           :src="item.src"
                                           :poster="item.poster"
                                           muted
                                           loop
                                           playsinline
                                           autoplay
                                    ></video>
                                    <img v-else
                                         :alt="name"
                                         class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                         :class="imgKey === currentIndex(id) ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                                         :src="item.type === 'video' ? item.poster : item.src">
                                </template>
                            </div>
                        </div>
                        <div class="w-[112%] -ml-[6%] h-[10px] bg-gradient-to-b from-[#2b2b2b] to-[#161616] rounded-b-md shadow-[0_3px_6px_rgba(0,0,0,0.3)]"></div>
                    </div>

                    <template v-if="media.length > 1">
                        <div
                            role="button"
                            tabindex="0"
                            :aria-label="`${name} — ${t('general.prevImage')}`"
                            class="absolute left-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            @click="(e) => shiftImage(id, media.length, -1, e)"
                            @keydown.enter="(e) => shiftImage(id, media.length, -1, e)"
                        >‹</div>
                        <div
                            role="button"
                            tabindex="0"
                            :aria-label="`${name} — ${t('general.nextImage')}`"
                            class="absolute right-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            @click="(e) => shiftImage(id, media.length, 1, e)"
                            @keydown.enter="(e) => shiftImage(id, media.length, 1, e)"
                        >›</div>
                        <div class="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-[3]">
                            <div v-for="(item, dotKey) in media"
                                 :key="dotKey"
                                 :aria-label="`${dotKey + 1}`"
                                 class="w-1.5 h-1.5 rounded-full cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                 :class="dotKey === currentIndex(id) ? 'bg-ink dark:bg-ink-dark' : 'bg-black/20 dark:bg-white/20'"
                                 @click="(e) => setImage(id, dotKey, e)"
                            ></div>
                        </div>
                    </template>
                </div>
                <p class="text-lg font-bold font-serif tracking-tight truncate">{{ name }}</p>
                <p class="text-sm leading-[1.55] text-soft dark:text-soft-dark flex-1 line-clamp-2">{{ shortDescription }}</p>
                <div v-if="tags.length" class="flex flex-wrap gap-1.5">
                    <span v-for="tag in tags"
                          :key="tag"
                          class="
                          text-[11px] font-bold uppercase tracking-[.03em]
                          py-1 px-2.5 rounded-md border
                          transition-transform
                          group-hover:-translate-y-0.5
                          "
                          :class="tag === primaryTech
                              ? 'bg-mint dark:bg-mint-dark text-onmint dark:text-white border-mintline dark:border-mintline-dark'
                              : 'bg-tagbg dark:bg-imgbg-dark text-soft dark:text-soft-dark border-transparent'"
                    >{{ tag }}</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.laptop-frame {
    perspective: 1100px;
}
.laptop-tilt {
    transform: rotateX(28deg);
    transform-style: preserve-3d;
    transition: transform .45s ease;
}
.group:hover .laptop-tilt {
    transform: rotateX(6deg) scale(1.03);
}
</style>
