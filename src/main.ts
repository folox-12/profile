import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './css/index.css';
import { MotionPlugin } from '@vueuse/motion';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createI18n } from 'vue-i18n';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { defaultLanguage, languages } from '@/locales';

const savedLocale = localStorage.getItem('locale') || defaultLanguage;

const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: defaultLanguage,
    messages: {
        ...languages
    }
});

createApp(App)
    .use(router)
    .use(i18n)
    .use(MotionPlugin)
    .mount('#app');
