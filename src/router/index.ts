import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'general.about',
        component: () => import('@/views/AboutView.vue')
    },
    {
        path: '/works',
        name: 'general.works',
        component: () => import('@/views/HomeView.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
