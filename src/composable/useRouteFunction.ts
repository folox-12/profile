import { useRoute } from 'vue-router';
import { onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';

export function useRouteFunction(title?: string) {
    const { t } = useI18n();
    const updateLocale = () => {
        const routeData = useRoute();
        let titleFromRoute = routeData.params?.id || routeData.meta.title as string;
        titleFromRoute = titleFromRoute !== undefined && Array.isArray(titleFromRoute) ? titleFromRoute[0] : titleFromRoute;
        const workName = t(title || titleFromRoute) as string;
        document.title = workName;
    };
    onBeforeMount(() => {
        updateLocale();
    });
}
