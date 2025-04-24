import { useI18n } from 'vue-i18n';

export default function useTranslation() {
    const { t } = useI18n();
    const getTranslatedDescription = (description?: string): string => {
        if (typeof description !== 'string') return '';
        return t(description);
    };

    return {
        getTranslatedDescription
    };
}
