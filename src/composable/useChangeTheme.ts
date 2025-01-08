import { onMounted } from 'vue';

export default function useChangeTheme() {
// On page load or when changing themes, best to add inline in `head` to avoid FOUC
    onMounted(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });

    const setLightTheme = () => {
        localStorage.setItem('theme', 'light');

        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    };

    const setDarkTheme = () => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
    };

    const toggleTheme = () => {
        if (localStorage.theme === 'dark') {
            setLightTheme();
        } else {
            setDarkTheme();
        }
    };

    return {
        setDarkTheme,
        setLightTheme,
        toggleTheme
    };
}
