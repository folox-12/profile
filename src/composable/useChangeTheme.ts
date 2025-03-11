import { ref, watch, onMounted } from 'vue';

export default function useChangeTheme() {
    const themeVariant = ref<string>(localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );

    const isThemeDark = ref(themeVariant.value === 'dark');

    const updateThemeClass = (theme: string) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.classList.toggle('light', theme === 'light');
    };

    // Следим за изменениями themeVariant и обновляем localStorage и классы
    watch(themeVariant, (newValue) => {
        localStorage.setItem('theme', newValue);
        isThemeDark.value = newValue === 'dark';
        updateThemeClass(newValue);
    });

    const setLightTheme = () => {
        themeVariant.value = 'light';
    };

    const setDarkTheme = () => {
        themeVariant.value = 'dark';
    };

    const toggleTheme = () => {
        themeVariant.value = isThemeDark.value ? 'light' : 'dark';
    };

    // Устанавливаем тему при загрузке
    onMounted(() => {
        updateThemeClass(themeVariant.value);
    });

    return {
        setDarkTheme,
        setLightTheme,
        toggleTheme,
        isThemeDark
    };
}
