import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Следит за классом `dark` на <html> — тема переключается через useChangeTheme,
 * но его состояние локально для каждого вызова, поэтому читаем DOM напрямую.
 */
export function useDarkModeClass() {
    const isDark = ref(document.documentElement.classList.contains('dark'));

    let observer: MutationObserver | null = null;

    onMounted(() => {
        observer = new MutationObserver(() => {
            isDark.value = document.documentElement.classList.contains('dark');
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
        observer = null;
    });

    return { isDark };
}
