import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { ref } from 'vue';

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'general.about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
            isSubDirectory: true,
            title: 'general.about'
        }
    },
    {
        path: '/works/',
        name: 'general.works',
        meta: {
            as: 'nav-link',
            title: 'general.works'
        },
        component: () => import('@/views/works/WorksView.vue')
    },

    {
        path: '/works/:id',
        meta: {
            isSubDirectory: true
        },
        component: () => import('@/views/works/WorksDetails.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export const isRouteLoading = ref(false);

let showLoaderTimer: ReturnType<typeof setTimeout> | undefined;

const clearShowLoaderTimer = () => {
    clearTimeout(showLoaderTimer);
    showLoaderTimer = undefined;
};

router.beforeEach(() => {
    clearShowLoaderTimer();
    showLoaderTimer = setTimeout(() => {
        isRouteLoading.value = true;
    }, 150);
});

router.afterEach(() => {
    clearShowLoaderTimer();
    isRouteLoading.value = false;
});

router.onError(() => {
    clearShowLoaderTimer();
    isRouteLoading.value = false;
});

export default router;
