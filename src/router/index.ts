import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'general.about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
            isSubDirictory: true,
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
            isSubDirictory: true
        },
        component: () => import('@/views/works/WorksDetails.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
