<script setup lang="ts">
import { useRouteFunction } from '@/composable/useRouteFunction';
import { PROJECT_WORKS } from '@/constants/projects';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
const { workName } = useRouteFunction();
const { t } = useI18n();
const ProjectWithDescription = PROJECT_WORKS.map(({ shortDescription, description, ...other }) => {
    return {
        shortDescription: computed(() => t(shortDescription)),
        description: computed(() => t(description)),
        tags: other.details?.stack?.split(',').map(s => s.trim()).slice(0, 3) ?? [],
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
            <router-link v-for="({ id, name, to, images, shortDescription, tags }, key) in ProjectWithDescription"
                         class="
                         group
                         bg-card dark:bg-card-dark
                         border border-black/10 dark:border-white/[.14]
                         rounded-2xl p-[18px]
                         flex flex-col gap-3
                         transition-transform
                         hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                         "
                         :key=key
                         :to="to">
                <div class="laptop-frame relative w-full h-[230px] flex items-end justify-center rounded-[10px] overflow-hidden pb-[18px] bg-imgbg dark:bg-imgbg-dark">
                    <div class="laptop-tilt relative w-[220px]">
                        <div class="relative w-full aspect-[16/10] bg-[#1b1b1b] rounded-t-lg rounded-b-[3px] p-[7px_7px_9px] shadow-[0_20px_26px_rgba(0,0,0,0.25)]">
                            <div class="relative w-full h-full rounded-[3px] overflow-hidden bg-black">
                                <img v-for="(image, imgKey) in images"
                                     :key="imgKey"
                                     :alt="name"
                                     class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                     :class="imgKey === currentIndex(id) ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                                     :src="image">
                            </div>
                        </div>
                        <div class="w-[112%] -ml-[6%] h-[10px] bg-gradient-to-b from-[#2b2b2b] to-[#161616] rounded-b-md shadow-[0_3px_6px_rgba(0,0,0,0.3)]"></div>
                    </div>

                    <template v-if="images.length > 1">
                        <div
                            role="button"
                            tabindex="0"
                            :aria-label="t('general.prevImage')"
                            class="absolute left-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            @click="(e) => shiftImage(id, images.length, -1, e)"
                            @keydown.enter="(e) => shiftImage(id, images.length, -1, e)"
                        >‹</div>
                        <div
                            role="button"
                            tabindex="0"
                            :aria-label="t('general.nextImage')"
                            class="absolute right-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            @click="(e) => shiftImage(id, images.length, 1, e)"
                            @keydown.enter="(e) => shiftImage(id, images.length, 1, e)"
                        >›</div>
                        <div class="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-[3]">
                            <div v-for="(image, dotKey) in images"
                                 :key="dotKey"
                                 role="button"
                                 tabindex="0"
                                 :aria-label="`${dotKey + 1}`"
                                 class="w-1.5 h-1.5 rounded-full cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                 :class="dotKey === currentIndex(id) ? 'bg-ink dark:bg-ink-dark' : 'bg-black/20 dark:bg-white/20'"
                                 @click="(e) => setImage(id, dotKey, e)"
                                 @keydown.enter="(e) => setImage(id, dotKey, e)"
                            ></div>
                        </div>
                    </template>
                </div>
                <p class="text-[17px] font-bold font-serif">{{ name }}</p>
                <p class="text-sm leading-[1.55] text-soft dark:text-soft-dark flex-1">{{ shortDescription }}</p>
                <div v-if="tags.length" class="flex flex-wrap gap-1.5">
                    <span v-for="tag in tags"
                          :key="tag"
                          class="
                          text-[11px] font-bold uppercase tracking-[.03em]
                          py-1 px-2.5 rounded-md
                          bg-tagbg dark:bg-imgbg-dark
                          text-soft dark:text-soft-dark
                          "
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
    transform: rotateX(6deg);
}
</style>
