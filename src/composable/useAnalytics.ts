import type { Router } from 'vue-router';

/**
 * Код сайта в GoatCounter — та часть, что стоит в адресе статистики:
 * https://<КОД>.goatcounter.com. Если пусто, счётчик не подключается вовсе.
 */
const GOATCOUNTER_CODE = 'vasilevsergey';

const endpoint = () => `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;

type GoatCounter = {
    count: (options: { path: string, title?: string, event?: boolean }) => void;
};

const counter = (): GoatCounter | undefined => {
    return (window as unknown as { goatcounter?: GoatCounter }).goatcounter;
};

let loaded = false;

const loadScript = () => {
    if (loaded || !GOATCOUNTER_CODE) {
        return;
    }

    loaded = true;

    const script = document.createElement('script');

    // no-onload отключает автоматический подсчёт: у одностраничного приложения
    // переходы не перезагружают документ, поэтому считаем их вручную
    script.async = true;
    script.dataset.goatcounter = endpoint();
    script.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
    script.src = '//gc.zgo.at/count.js';
    document.head.appendChild(script);
};

/** Просмотр страницы. Вызывается на каждый переход роутера */
export const trackView = (path: string) => {
    counter()?.count({ path, title: document.title });
};

/** Событие — например, клик по ссылке на почту или телеграм */
export const trackEvent = (name: string) => {
    counter()?.count({ path: name, title: name, event: true });
};

/** Подключает счётчик и начинает считать переходы */
export const useAnalytics = (router: Router) => {
    if (!GOATCOUNTER_CODE) {
        return;
    }

    loadScript();

    router.afterEach((to) => {
        // Даём странице обновить заголовок, иначе в отчёте окажется предыдущий
        setTimeout(() => trackView(to.fullPath), 0);
    });
};
