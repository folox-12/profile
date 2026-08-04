import { useRoute } from 'vue-router';
import { onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export function useRouteFunction(title?: string) {
    const workName = ref<string>();
    const { t, locale } = useI18n();
    const routeData = useRoute();
    const updateLocale = (): void => {
        let titleFromRoute = routeData.params?.id || routeData.meta.title as string;
        titleFromRoute = titleFromRoute !== undefined && Array.isArray(titleFromRoute) ? titleFromRoute[0] : titleFromRoute;
        workName.value = t(title || titleFromRoute) as string;
        document.title = workName.value + ' - Vasilev Sergey';
    };

    watch(locale, () => {
        updateLocale();
    });

    // Компонент страницы переиспользуется при переходе между проектами,
    // поэтому заголовок вкладки обновляем по смене маршрута, а не при монтировании
    watch(() => routeData.fullPath, () => {
        updateLocale();
    });

    onBeforeMount(() => {
        updateLocale();
    });

    return { workName };
}
