import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createI18n, useI18n } from 'vue-i18n';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { defaultLanguage, languages } from '@/i18n';

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const i18n = createI18n({
    legacy: false,
    locale: defaultLanguage,
    fallbackLocale: defaultLanguage,
    messages: {
        ...languages
    }
});
const vuetify = createVuetify({
    components,
    directives
});

createApp(App, {
    setup() {
        const { t } = useI18n({ useScope: 'global' });
        return { t };
    }
})
    .use(router)
    .use(vuetify)
    .use(i18n)
    .mount('#app');
