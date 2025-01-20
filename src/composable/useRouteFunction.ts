import { useRoute } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export function useRouteFunction(title?: string) {
    const { t } = useI18n();
    const workName = ref<string>();
    const updateLocale = () => {
        const routeData = useRoute();
        let titleFromRoute = routeData.params?.id || routeData.meta.title as string;
        titleFromRoute = titleFromRoute !== undefined && Array.isArray(titleFromRoute) ? titleFromRoute[0] : titleFromRoute;
        workName.value = t(title || titleFromRoute) as string;
        document.title = workName.value;
    };
    onBeforeMount(() => {
        updateLocale();
    });

    return { workName };
}
