# Дизайн: улучшение UI/UX портфолио

Дата: 2026-08-02
Цель: усилить впечатление на рекрутеров/работодателей за счёт более полного hero-блока, более информативной страницы проекта и общей полировки интерфейса.

## 1. Hero (AboutView.vue)

Текущее состояние: только имя + роль.

Новый состав hero (сверху вниз / слева направо на десктопе):
- Круглый аватар (~96–120px) слева/сверху от имени — `src/assets/avatar.jpg` (пользователь добавит файл сам; при отсутствии файла сборка сломается на этапе импорта — это ожидаемо, пользователь предупреждён).
- Имя + роль (как сейчас).
- Ряд из 4 иконок-ссылок: GitHub, Telegram, LinkedIn, Email — через существующий `VSvgComponent` + иконки `@mdi/js` (`mdiGithub`, `mdiTelegram`, `mdiLinkedin`, `mdiEmailOutline`), каждая с `aria-label` и `target="_blank"` (кроме email — `mailto:`).
- Кнопка «Скачать резюме» — `<a href="/resume.pdf" download>`, визуально в стиле существующей mint-кнопки (см. кнопка "Проекты >" в блоке work).

### Новые константы (`src/constants/general.ts`)
```ts
export const LINK_TO_TELEGRAM = 'https://t.me/F0lox';
export const LINK_TO_LINKEDIN = 'https://www.linkedin.com/in/сергей-васильев-912198364/';
export const RESUME_PATH = '/resume.pdf';
```
(`LINK_TO_GIT` и `EMAIL` уже существуют — переиспользуются.)

### Локализация
Новые ключи в `ru.json`/`en.json`: `hero.downloadResume`, `hero.social.github`, `hero.social.telegram`, `hero.social.linkedin`, `hero.social.email` (для aria-label).

### Layout
Flex-row на десктопе (аватар + текстовый блок рядом), flex-col на мобильных (`flex-col sm:flex-row`, `items-center sm:items-start`, `gap-4`/`gap-5`). Иконки и кнопка — в отдельном ряду под именем/ролью (`flex flex-wrap items-center gap-3 mt-3`).

## 2. WorksDetails.vue: роль/период + навигация между проектами

### Модель данных (`src/constants/projects.ts`)
`DetailedInfo` расширяется:
```ts
type DetailedInfo = {
    stack?: string,
    website?: string[],
    role?: string,
    period?: string,
}
```
Для всех трёх текущих проектов `period` = существующий `year` в виде строки (без отдельного заполнения дат — пользователь подтвердил, что точных дат нет). `role` оставляем `undefined` — пользователь заполнит сам позже для каждого проекта; блок рендерится только когда поле присутствует (`v-if`), так что отсутствие `role` не ломает вёрстку.

### Отображение
В существующем блоке деталей (`flex flex-wrap gap-[22px]` рядом со STACK/CODE) добавляются два опциональных элемента в том же визуальном стиле (label uppercase + значение), показываемые через `v-if="details.role"` / `v-if="details.period"`.

### Навигация prev/next
Внизу страницы, после списка скриншотов, новый блок:
```html
<div class="flex justify-between items-center mt-8 pt-6 border-t border-black/10 dark:border-white/[.14]">
  <router-link :to="prevProject.to">← {{ prevProject.name }}</router-link>
  <router-link :to="nextProject.to">{{ nextProject.name }} →</router-link>
</div>
```
Вычисление: индекс текущего проекта в `PROJECT_WORKS` по `id`; `prev`/`next` — циклические соседи (`(index - 1 + length) % length`, `(index + 1) % length`). Если в массиве всего 1 проект — блок не рендерится (`v-if="PROJECT_WORKS.length > 1"`).

## 3. Общая полировка

- `alt` атрибуты на всех `<img>` в WorksView (сейчас `alt="preview"` — заменить на `:alt="name"`) и WorksDetails (добавить `:alt` с именем проекта + номером скриншота).
- `aria-label` на кликабельных иконках без текста: соцссылки в hero, prev/next-стрелки карусели в WorksView, dot-пагинация карусели, солнце/луна и бургер-меню в VHeader (сейчас без aria-label).
- `focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none` на интерактивных элементах без видимого focus state: router-link карточки работ, кнопки-стрелки карусели, иконки в хедере, соцссылки и кнопка резюме в hero.
- Hover-переход на тегах stack в карточках работ (`WorksView.vue`) — сейчас статичны, у skills-чипсов на About уже есть `hover:-translate-y-0.5 transition-transform`, применяем тот же паттерн для консистентности.
- Не трогаем: анимации через `@vueuse/motion` (уже используются последовательно), общую цветовую систему (уже консистентна), структуру роутинга.

## Не входит в объём (явно исключено)
- Featured/pinned проект на главной — пользователь отказался.
- Галерея вместо колонки скриншотов в WorksDetails, кнопки live-demo/repo как отдельные CTA-кнопки — не выбраны пользователем в этом заходе.

## Файлы, которые затрагиваются
- `src/constants/general.ts` — новые константы
- `src/constants/projects.ts` — новые поля `role`/`period`
- `src/locales/ru.json`, `src/locales/en.json` — новые ключи
- `src/views/AboutView.vue` — hero
- `src/views/works/WorksDetails.vue` — role/period, prev/next, alt, focus states
- `src/views/works/WorksView.vue` — alt, aria-label, focus states, hover на тегах
- `src/components/VHeader.vue` — aria-label, focus states на иконках
- `src/assets/avatar.jpg` — добавляется пользователем (внешняя зависимость)
- `public/resume.pdf` — добавляется пользователем (внешняя зависимость)
