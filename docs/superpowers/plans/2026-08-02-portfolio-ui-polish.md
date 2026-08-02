# Portfolio UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the portfolio's hero section (avatar, socials, resume download), enrich the project-details page (role/period, prev/next navigation), and pass over the whole UI for accessibility/consistency polish.

**Architecture:** No new subsystems — this extends existing Vue 3 SFCs (`AboutView.vue`, `WorksDetails.vue`, `WorksView.vue`, `VHeader.vue`) and existing data modules (`constants/general.ts`, `constants/projects.ts`, `locales/*.json`). All changes follow the existing Tailwind-utility-class + `vue-i18n` + `@mdi/js` icon patterns already used in the codebase.

**Tech Stack:** Vue 3 (`<script setup>`, TypeScript in `.vue`/`.ts` files), Tailwind CSS (custom color tokens in `tailwind.config.js`), vue-i18n (`ru.json`/`en.json`), `@mdi/js` + existing `VSvgComponent.vue` for icons, Vue Router 4.

## Global Constraints

- No test framework is configured in this project (no jest/vitest, no `test` script in `package.json`) — verification for every task is `yarn lint` (must pass with 0 errors) and `yarn build` (must succeed), plus a manual check via `yarn serve` described in the task.
- Follow existing color tokens only (`bg`, `bg-dark`, `ink`, `ink-dark`, `soft`, `soft-dark`, `card`, `card-dark`, `mint`, `mint-dark`, `mintline`, `mintline-dark`, `imgbg`, `imgbg-dark`, `tagbg`, `onmint`) — do not invent new colors.
- All new user-facing strings go through `vue-i18n` (`t('...')`) with entries in both `src/locales/ru.json` and `src/locales/en.json` — never hardcode Russian or English text directly in a template.
- Two external files are dependencies of this plan, supplied by the repo owner outside this plan's scope: `src/assets/avatar.jpg` (hero photo) and `public/resume.pdf` (downloadable CV). Task 3 documents exactly what happens if they're missing at build time.
- Icons use the existing `VSvgComponent` (`src/components/VSvgComponent.vue`) with `@mdi/js` icon paths — the same pattern already used in `VHeader.vue`. Do not introduce a new icon library.

---

### Task 1: Add hero/social constants and extend project data model

**Files:**
- Modify: `src/constants/general.ts`
- Modify: `src/constants/projects.ts`

**Interfaces:**
- Produces: `LINK_TO_TELEGRAM: string`, `LINK_TO_LINKEDIN: string`, `RESUME_PATH: string` (exported from `src/constants/general.ts`)
- Produces: `DetailedInfo.role?: string`, `DetailedInfo.period?: string` (extended type in `src/constants/projects.ts`), and populated `period` values for all three projects in `PROJECT_WORKS`

- [ ] **Step 1: Add the new constants**

In `src/constants/general.ts`, after the existing `export const EMAIL = 'foloxprog@gmail.com';` line, add:

```ts
export const LINK_TO_TELEGRAM = 'https://t.me/F0lox';
export const LINK_TO_LINKEDIN = 'https://www.linkedin.com/in/сергей-васильев-912198364/';
export const RESUME_PATH = '/resume.pdf';
```

- [ ] **Step 2: Extend `DetailedInfo` with `role` and `period`**

In `src/constants/projects.ts`, change:

```ts
type DetailedInfo = {
    stack?: string,
    website?: string[],
}
```

to:

```ts
type DetailedInfo = {
    stack?: string,
    website?: string[],
    role?: string,
    period?: string,
}
```

- [ ] **Step 3: Populate `period` for each project**

In `src/constants/projects.ts`, add a `period` field to each project's `details` object (using the existing `year` value as a string; leave `role` unset for now — the repo owner will fill it in later):

For the `kiosk` project's `details`:
```ts
details: {
    stack: 'HTML, CSS, JavaScript, Node.js',
    website: ['https://github.com/folox-12/kiosk'],
    period: '2024'
}
```

For the `gym` project's `details`:
```ts
details: {
    stack: 'HTML, CSS, JavaScript, Nuxt2, Pinia, Node.js, Express.js, Sequelize',
    website: ['https://github.com/folox-12/gym_front', 'https://github.com/folox-12/gym_front'],
    period: '2023'
}
```

For the `chop` project's `details`:
```ts
details: {
    stack: 'React, Tauri, Tailwind CSS, Rust, TypeScript',
    website: ['https://github.com/folox-12/CHOP-Gen-App'],
    period: '2026'
}
```

- [ ] **Step 4: Verify**

Run: `yarn lint`
Expected: no errors (0 problems) — this catches TypeScript type errors on the new `DetailedInfo` fields.

- [ ] **Step 5: Commit**

```bash
git add src/constants/general.ts src/constants/projects.ts
git commit -m "Добавлены константы соцссылок/резюме и поля role/period для проектов"
```

---

### Task 2: Add new i18n keys

**Files:**
- Modify: `src/locales/ru.json`
- Modify: `src/locales/en.json`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces: translation keys `hero.downloadResume`, `hero.socialGithub`, `hero.socialTelegram`, `hero.socialLinkedin`, `hero.socialEmail`, `general.role`, `general.period`, `general.prevProject`, `general.nextProject`, `general.toggleTheme`, `general.openMenu`, `general.closeMenu`, `general.prevImage`, `general.nextImage` — consumed by Tasks 3, 5, 6, 7.

- [ ] **Step 1: Add keys to `src/locales/ru.json`**

Change the `"hero"` object from:

```json
    "hero": {
        "name": "Васильев Сергей",
        "role": "Frontend Developer"
    },
```

to:

```json
    "hero": {
        "name": "Васильев Сергей",
        "role": "Frontend Developer",
        "downloadResume": "Скачать резюме",
        "socialGithub": "GitHub",
        "socialTelegram": "Telegram",
        "socialLinkedin": "LinkedIn",
        "socialEmail": "Email"
    },
```

Change the `"general"` object from:

```json
    "general": {
        "about": "Обо мне",
        "now": "Сейчас",
        "source": "Гит",
        "works": "Проекты",
        "stack": "СТЕК",
        "site": "Сайт",
        "code": "Исходный код"
    },
```

to:

```json
    "general": {
        "about": "Обо мне",
        "now": "Сейчас",
        "source": "Гит",
        "works": "Проекты",
        "stack": "СТЕК",
        "site": "Сайт",
        "code": "Исходный код",
        "role": "РОЛЬ",
        "period": "ПЕРИОД",
        "prevProject": "Предыдущий проект",
        "nextProject": "Следующий проект",
        "toggleTheme": "Переключить тему",
        "openMenu": "Открыть меню",
        "closeMenu": "Закрыть меню",
        "prevImage": "Предыдущее изображение",
        "nextImage": "Следующее изображение"
    },
```

- [ ] **Step 2: Add keys to `src/locales/en.json`**

Change the `"hero"` object from:

```json
    "hero": {
        "name": "Sergey Vasilev",
        "role": "Frontend Developer"
    },
```

to:

```json
    "hero": {
        "name": "Sergey Vasilev",
        "role": "Frontend Developer",
        "downloadResume": "Download resume",
        "socialGithub": "GitHub",
        "socialTelegram": "Telegram",
        "socialLinkedin": "LinkedIn",
        "socialEmail": "Email"
    },
```

Change the `"general"` object from:

```json
    "general": {
        "about": "About",
        "works": "Works",
        "source": "Source",
        "now": "Now",
        "stack": "STACK",
        "site": "Site",
        "code": "Source code"
    },
```

to:

```json
    "general": {
        "about": "About",
        "works": "Works",
        "source": "Source",
        "now": "Now",
        "stack": "STACK",
        "site": "Site",
        "code": "Source code",
        "role": "ROLE",
        "period": "PERIOD",
        "prevProject": "Previous project",
        "nextProject": "Next project",
        "toggleTheme": "Toggle theme",
        "openMenu": "Open menu",
        "closeMenu": "Close menu",
        "prevImage": "Previous image",
        "nextImage": "Next image"
    },
```

- [ ] **Step 3: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/locales/ru.json'))" && node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json'))"`
Expected: no output, exit code 0 (both files parse as valid JSON).

- [ ] **Step 4: Commit**

```bash
git add src/locales/ru.json src/locales/en.json
git commit -m "Добавлены ключи локализации для hero-соцссылок, резюме и деталей проекта"
```

---

### Task 3: Build the extended hero block in AboutView

**Files:**
- Modify: `src/views/AboutView.vue`

**Interfaces:**
- Consumes: `LINK_TO_TELEGRAM`, `LINK_TO_LINKEDIN`, `RESUME_PATH` from `src/constants/general.ts` (Task 1); `LINK_TO_GIT`, `EMAIL` (already imported in this file); i18n keys `hero.downloadResume`, `hero.socialGithub`, `hero.socialTelegram`, `hero.socialLinkedin`, `hero.socialEmail` (Task 2); external file `src/assets/avatar.jpg` (repo owner dependency — see Step 3 note).
- Produces: nothing consumed by later tasks (leaf UI change).

- [ ] **Step 1: Add imports**

In `src/views/AboutView.vue`, change the script imports from:

```js
import { EMAIL, SKILLS } from '@/constants/general';
```

to:

```js
import { EMAIL, SKILLS, LINK_TO_GIT, LINK_TO_TELEGRAM, LINK_TO_LINKEDIN, RESUME_PATH } from '@/constants/general';
import { mdiGithub, mdiTelegram, mdiLinkedin, mdiEmailOutline } from '@mdi/js';
import VSvgComponent from '@/components/VSvgComponent.vue';
import avatar from '@/assets/avatar.jpg';
```

Also add a `socialLinks` computed array right after the `useRouteFunction();` line:

```js
const socialLinks = computed(() => [
    { href: LINK_TO_GIT, icon: mdiGithub, label: t('hero.socialGithub'), external: true },
    { href: LINK_TO_TELEGRAM, icon: mdiTelegram, label: t('hero.socialTelegram'), external: true },
    { href: LINK_TO_LINKEDIN, icon: mdiLinkedin, label: t('hero.socialLinkedin'), external: true },
    { href: `mailto:${EMAIL}`, icon: mdiEmailOutline, label: t('hero.socialEmail'), external: false }
]);
```

- [ ] **Step 2: Replace the hero template block**

Change:

```html
        <div class="hero flex flex-col">
            <p class="text-[32px] font-bold leading-tight">{{ t('hero.name') }}</p>
            <p class="text-base text-soft dark:text-soft-dark mt-1">{{ t('hero.role') }}</p>
        </div>
```

to:

```html
        <div class="hero flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            <img
                :src="avatar"
                :alt="t('hero.name')"
                class="w-24 h-24 rounded-full object-cover border border-black/10 dark:border-white/[.14] shrink-0"
            >
            <div class="flex flex-col items-center sm:items-start">
                <p class="text-[32px] font-bold leading-tight">{{ t('hero.name') }}</p>
                <p class="text-base text-soft dark:text-soft-dark mt-1">{{ t('hero.role') }}</p>
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3.5">
                    <a
                        v-for="link in socialLinks"
                        :key="link.label"
                        :href="link.href"
                        :target="link.external ? '_blank' : undefined"
                        :aria-label="link.label"
                        class="
                        flex items-center justify-center w-9 h-9 rounded-full
                        border border-black/10 dark:border-white/[.14]
                        bg-card dark:bg-card-dark
                        transition-transform hover:-translate-y-0.5
                        focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                        "
                    >
                        <VSvgComponent
                            :icon="link.icon"
                            width="18px"
                            height="18px"
                            class="fill-ink dark:fill-ink-dark"
                        />
                    </a>
                    <a
                        :href="RESUME_PATH"
                        download
                        class="
                        inline-block w-fit
                        py-2 px-4 rounded-[10px]
                        text-sm font-bold
                        bg-mint dark:bg-mint-dark
                        text-onmint dark:text-white
                        border border-mintline dark:border-mintline-dark
                        shadow-[0_2px_0_#7cc79c] dark:shadow-[0_2px_0_#3d9478]
                        hover:brightness-95
                        transition
                        focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                        "
                    >
                        {{ t('hero.downloadResume') }}
                    </a>
                </div>
            </div>
        </div>
```

- [ ] **Step 3: Verify — note the external avatar dependency**

Run: `yarn lint`
Expected: no errors.

Run: `yarn build`
Expected outcome depends on whether `src/assets/avatar.jpg` exists yet:
- If the file exists: build succeeds.
- If the file does not exist yet: build fails with `Module not found: Error: Can't resolve '@/assets/avatar.jpg'`. This is expected until the repo owner adds the photo — do not work around it (e.g. don't stub a placeholder image or remove the import). Report this clearly and stop; this task is otherwise complete and correct.

- [ ] **Step 4: Manual check (once avatar.jpg is present)**

Run: `yarn serve`, open the About page in a browser, and confirm:
- Avatar renders as a circle next to name/role (stacked above on mobile width, side-by-side from `sm:` breakpoint up).
- All 4 social icons open the correct destination (GitHub/Telegram/LinkedIn in a new tab, Email opens a mail client).
- "Скачать резюме" / "Download resume" button downloads `resume.pdf` (or 404s if `public/resume.pdf` isn't added yet — also an expected external dependency, not a bug).
- Dark mode toggle still renders the block correctly (card background, border, text colors all switch).

- [ ] **Step 5: Commit**

```bash
git add src/views/AboutView.vue
git commit -m "Расширен hero-блок: аватар, соцссылки, кнопка скачивания резюме"
```

---

### Task 4: Show role/period in WorksDetails

**Files:**
- Modify: `src/views/works/WorksDetails.vue`

**Interfaces:**
- Consumes: `details.role`, `details.period` from `src/constants/projects.ts` (Task 1); i18n keys `general.role`, `general.period` (Task 2).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add role/period display next to STACK/CODE**

In `src/views/works/WorksDetails.vue`, the existing details row is:

```html
    <div v-if="details" class="flex flex-wrap gap-[22px] items-baseline mb-[26px]">
        <div v-if="stackList.length" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                {{ t('general.stack') }}
            </span>
            <div class="flex flex-wrap gap-1.5">
                <span
                    v-for="tech in stackList"
                    :key="tech"
                    class="text-xs font-semibold py-1 px-2.5 rounded-md bg-mint dark:bg-mint-dark text-onmint dark:text-white"
                >
                    {{ tech }}
                </span>
            </div>
        </div>
        <div v-if="details.website" class="flex items-center gap-2.5">
```

Insert a new `role`/`period` block immediately before the `stackList` block (so it reads role → period → stack → code, left to right):

```html
    <div v-if="details" class="flex flex-wrap gap-[22px] items-baseline mb-[26px]">
        <div v-if="details.role" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                {{ t('general.role') }}
            </span>
            <span class="text-sm">{{ details.role }}</span>
        </div>
        <div v-if="details.period" class="flex items-center gap-2.5">
            <span class="text-[11px] font-bold uppercase tracking-[.04em] text-soft dark:text-soft-dark">
                {{ t('general.period') }}
            </span>
            <span class="text-sm">{{ details.period }}</span>
        </div>
        <div v-if="stackList.length" class="flex items-center gap-2.5">
```

(leave the rest of that block — `stackList` and `details.website` divs — unchanged).

- [ ] **Step 2: Verify**

Run: `yarn lint`
Expected: no errors.

Run: `yarn build`
Expected: success (this task has no new external file dependency).

- [ ] **Step 3: Manual check**

Run: `yarn serve`, navigate to `/works/kiosk`, `/works/gym`, `/works/chop`. Confirm "ПЕРИОД: 2024" / "2023" / "2026" (or English "PERIOD: 2024" etc.) renders next to STACK. Confirm no "РОЛЬ"/"ROLE" label appears yet (since `role` is still unset in the data) — the `v-if="details.role"` must hide it cleanly with no empty gap.

- [ ] **Step 4: Commit**

```bash
git add src/views/works/WorksDetails.vue
git commit -m "Добавлено отображение роли и периода разработки на странице проекта"
```

---

### Task 5: Add prev/next project navigation to WorksDetails

**Files:**
- Modify: `src/views/works/WorksDetails.vue`

**Interfaces:**
- Consumes: `PROJECT_WORKS`, `ProjectType` from `src/constants/projects.ts`; i18n keys `general.prevProject`, `general.nextProject` (Task 2).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add prev/next computed values**

In `src/views/works/WorksDetails.vue`, change the import line:

```ts
import { getProjectWorkById, ProjectType } from '@/constants/projects';
```

to:

```ts
import { getProjectWorkById, ProjectType, PROJECT_WORKS } from '@/constants/projects';
```

After the existing `const details = computed(() => currentProject.value?.details);` line, add:

```ts
const currentIndex = computed(() => PROJECT_WORKS.findIndex(p => p.id === currentProject.value?.id));

const prevProject = computed<ProjectType | undefined>(() => {
    if (currentIndex.value === -1 || PROJECT_WORKS.length < 2) return undefined;
    const index = (currentIndex.value - 1 + PROJECT_WORKS.length) % PROJECT_WORKS.length;
    return PROJECT_WORKS[index];
});

const nextProject = computed<ProjectType | undefined>(() => {
    if (currentIndex.value === -1 || PROJECT_WORKS.length < 2) return undefined;
    const index = (currentIndex.value + 1) % PROJECT_WORKS.length;
    return PROJECT_WORKS[index];
});
```

- [ ] **Step 2: Add the navigation block to the template**

At the end of the template, after the closing `</div>` of the screenshots block:

```html
    <div class="flex flex-col gap-5">
        <div
            v-for="(image, key) in currentProject?.images"
            :key="key"
            class="w-full aspect-video rounded-[14px] overflow-hidden border border-black/10 dark:border-white/[.14]"
        >
            <img
                class="w-full h-full object-cover"
                :src="image"
            />
        </div>
    </div>
```

add immediately after it (still inside the root fragment, as a sibling):

```html
    <div
        v-if="prevProject || nextProject"
        class="flex justify-between items-center mt-8 pt-6 border-t border-black/10 dark:border-white/[.14]"
    >
        <router-link
            v-if="prevProject"
            :to="prevProject.to"
            class="
            flex items-center gap-1.5 text-sm font-semibold
            hover:underline
            focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none rounded
            "
        >
            <span aria-hidden="true">←</span>
            <span class="sr-only">{{ t('general.prevProject') }}:</span>
            {{ prevProject.name }}
        </router-link>
        <span v-else></span>
        <router-link
            v-if="nextProject"
            :to="nextProject.to"
            class="
            flex items-center gap-1.5 text-sm font-semibold
            hover:underline
            focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none rounded
            "
        >
            <span class="sr-only">{{ t('general.nextProject') }}:</span>
            {{ nextProject.name }}
            <span aria-hidden="true">→</span>
        </router-link>
    </div>
```

Note: `sr-only` is a Tailwind built-in utility (visually hidden but readable by screen readers) — no custom CSS needed.

- [ ] **Step 3: Verify**

Run: `yarn lint`
Expected: no errors.

Run: `yarn build`
Expected: success.

- [ ] **Step 4: Manual check**

Run: `yarn serve`, navigate to `/works/kiosk`. Confirm you see "← Chop" on the left (kiosk's prev, cyclically wrapping to the last project) and "GYM_APP →" on the right. Click each and confirm navigation works and the page updates (title, images, stack) for the new project. Repeat from `/works/chop` to confirm wraparound to `/works/kiosk` on "next".

- [ ] **Step 5: Commit**

```bash
git add src/views/works/WorksDetails.vue
git commit -m "Добавлена навигация между проектами (предыдущий/следующий) на странице деталей"
```

---

### Task 6: Accessibility pass — alt text and aria-labels

**Files:**
- Modify: `src/views/works/WorksView.vue`
- Modify: `src/views/works/WorksDetails.vue`
- Modify: `src/components/VHeader.vue`

**Interfaces:**
- Consumes: i18n keys `general.prevImage`, `general.nextImage`, `general.toggleTheme`, `general.openMenu`, `general.closeMenu` (Task 2).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Fix `alt` text in `WorksView.vue`**

Change:

```html
                                <img v-for="(image, imgKey) in images"
                                     :key="imgKey"
                                     alt="preview"
                                     class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                     :class="imgKey === currentIndex(id) ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                                     :src="image">
```

to:

```html
                                <img v-for="(image, imgKey) in images"
                                     :key="imgKey"
                                     :alt="name"
                                     class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                     :class="imgKey === currentIndex(id) ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                                     :src="image">
```

- [ ] **Step 2: Add `aria-label` to the carousel controls in `WorksView.vue`**

Change:

```html
                    <template v-if="images.length > 1">
                        <div
                            class="absolute left-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3]"
                            @click="(e) => shiftImage(id, images.length, -1, e)"
                        >‹</div>
                        <div
                            class="absolute right-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3]"
                            @click="(e) => shiftImage(id, images.length, 1, e)"
                        >›</div>
                        <div class="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-[3]">
                            <div v-for="(image, dotKey) in images"
                                 :key="dotKey"
                                 class="w-1.5 h-1.5 rounded-full cursor-pointer"
                                 :class="dotKey === currentIndex(id) ? 'bg-ink dark:bg-ink-dark' : 'bg-black/20 dark:bg-white/20'"
                                 @click="(e) => setImage(id, dotKey, e)"
                            ></div>
                        </div>
                    </template>
```

to:

```html
                    <template v-if="images.length > 1">
                        <div
                            role="button"
                            tabindex="0"
                            :aria-label="t('general.prevImage')"
                            class="absolute left-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            @click="(e) => shiftImage(id, images.length, -1, e)"
                            @keydown.enter="(e) => shiftImage(id, images.length, -1, e)"
                        >‹</div>
                        <div
                            role="button"
                            tabindex="0"
                            :aria-label="t('general.nextImage')"
                            class="absolute right-1.5 top-[44%] -translate-y-1/2 w-7 h-7 rounded-full bg-black/45 text-white flex items-center justify-center cursor-pointer text-sm z-[3] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                            @click="(e) => shiftImage(id, images.length, 1, e)"
                            @keydown.enter="(e) => shiftImage(id, images.length, 1, e)"
                        >›</div>
                        <div class="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-[3]">
                            <div v-for="(image, dotKey) in images"
                                 :key="dotKey"
                                 role="button"
                                 tabindex="0"
                                 :aria-label="`${dotKey + 1}`"
                                 class="w-1.5 h-1.5 rounded-full cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                 :class="dotKey === currentIndex(id) ? 'bg-ink dark:bg-ink-dark' : 'bg-black/20 dark:bg-white/20'"
                                 @click="(e) => setImage(id, dotKey, e)"
                                 @keydown.enter="(e) => setImage(id, dotKey, e)"
                            ></div>
                        </div>
                    </template>
```

- [ ] **Step 3: Add `alt` text to screenshots in `WorksDetails.vue`**

Change:

```html
            <img
                class="w-full h-full object-cover"
                :src="image"
            />
```

to:

```html
            <img
                class="w-full h-full object-cover"
                :src="image"
                :alt="`${currentProject?.name} — ${key + 1}`"
            />
```

- [ ] **Step 4: Add `aria-label` to icon buttons in `VHeader.vue`**

Change:

```html
            <VSvgComponent
                v-if="isDark"
                v-motion-slide-bottom
                fill="yellow"
                :icon="mdiWhiteBalanceSunny"
                @click="toggleTheme"
            />
            <VSvgComponent
                v-else
                v-motion-slide-bottom
                fill="MediumSlateBlue"
                :icon="mdiMoonWaningCrescent"
                @click="toggleTheme"
            />
            <VSvgComponent class="md:hidden ml-2 dark:fill-white"
                           viewBox="0 0 24 24"
                           :icon="mdiMenu"
                           @click="isMenuOpen = true"
            />
```

to:

```html
            <VSvgComponent
                v-if="isDark"
                v-motion-slide-bottom
                fill="yellow"
                :icon="mdiWhiteBalanceSunny"
                :aria-label="t('general.toggleTheme')"
                role="button"
                tabindex="0"
                @click="toggleTheme"
                @keydown.enter="toggleTheme"
            />
            <VSvgComponent
                v-else
                v-motion-slide-bottom
                fill="MediumSlateBlue"
                :icon="mdiMoonWaningCrescent"
                :aria-label="t('general.toggleTheme')"
                role="button"
                tabindex="0"
                @click="toggleTheme"
                @keydown.enter="toggleTheme"
            />
            <VSvgComponent class="md:hidden ml-2 dark:fill-white"
                           viewBox="0 0 24 24"
                           :icon="mdiMenu"
                           :aria-label="t('general.openMenu')"
                           role="button"
                           tabindex="0"
                           @click="isMenuOpen = true"
                           @keydown.enter="isMenuOpen = true"
            />
```

And change the close button:

```html
                    <VSvgComponent
                        class="absolute top-2 right-2"
                        fill="white"
                        :icon="mdiClose"
                        @click="isMenuOpen = false"
                    />
```

to:

```html
                    <VSvgComponent
                        class="absolute top-2 right-2"
                        fill="white"
                        :icon="mdiClose"
                        :aria-label="t('general.closeMenu')"
                        role="button"
                        tabindex="0"
                        @click="isMenuOpen = false"
                        @keydown.enter="isMenuOpen = false"
                    />
```

- [ ] **Step 5: Verify**

Run: `yarn lint`
Expected: no errors.

Run: `yarn build`
Expected: success.

- [ ] **Step 6: Manual check**

Run: `yarn serve`. Use Tab key to navigate: confirm you can reach and activate (via Enter) the theme toggle, the mobile menu button (resize to mobile width first), and the carousel arrows/dots on a project card with multiple screenshots (the `chop` project). Confirm each shows a visible focus ring.

- [ ] **Step 7: Commit**

```bash
git add src/views/works/WorksView.vue src/views/works/WorksDetails.vue src/components/VHeader.vue
git commit -m "Добавлены alt-тексты и aria-label для доступности карусели, скриншотов и хедера"
```

---

### Task 7: Focus states and hover consistency on cards and tags

**Files:**
- Modify: `src/views/works/WorksView.vue`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add focus-visible ring to the project card link**

Change:

```html
            <router-link v-for="({ id, name, to, images, shortDescription, tags }, key) in ProjectWithDescription"
                         class="
                         group
                         bg-card dark:bg-card-dark
                         border border-black/10 dark:border-white/[.14]
                         rounded-2xl p-[18px]
                         flex flex-col gap-3
                         transition-transform
                         hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                         "
                         :key=key
                         :to="to">
```

to:

```html
            <router-link v-for="({ id, name, to, images, shortDescription, tags }, key) in ProjectWithDescription"
                         class="
                         group
                         bg-card dark:bg-card-dark
                         border border-black/10 dark:border-white/[.14]
                         rounded-2xl p-[18px]
                         flex flex-col gap-3
                         transition-transform
                         hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]
                         focus-visible:ring-2 focus-visible:ring-mintline dark:focus-visible:ring-mintline-dark focus-visible:outline-none
                         "
                         :key=key
                         :to="to">
```

- [ ] **Step 2: Add hover transition to stack tags**

Change:

```html
                <div v-if="tags.length" class="flex flex-wrap gap-1.5">
                    <span v-for="tag in tags"
                          :key="tag"
                          class="
                          text-[11px] font-bold uppercase tracking-[.03em]
                          py-1 px-2.5 rounded-md
                          bg-tagbg dark:bg-imgbg-dark
                          text-soft dark:text-soft-dark
                          "
                    >{{ tag }}</span>
                </div>
```

to:

```html
                <div v-if="tags.length" class="flex flex-wrap gap-1.5">
                    <span v-for="tag in tags"
                          :key="tag"
                          class="
                          text-[11px] font-bold uppercase tracking-[.03em]
                          py-1 px-2.5 rounded-md
                          bg-tagbg dark:bg-imgbg-dark
                          text-soft dark:text-soft-dark
                          transition-transform
                          group-hover:-translate-y-0.5
                          "
                    >{{ tag }}</span>
                </div>
```

(uses `group-hover` since the tags are inside the `group` class already on the card `router-link` — hovering the whole card lifts the tags slightly, consistent with the card's own `hover:-translate-y-1`.)

- [ ] **Step 3: Verify**

Run: `yarn lint`
Expected: no errors.

Run: `yarn build`
Expected: success.

- [ ] **Step 4: Manual check**

Run: `yarn serve`, go to `/works/`. Tab to a project card and confirm a visible focus ring appears around the whole card. Hover over a card and confirm the stack tags shift up slightly along with the card's existing lift/shadow effect.

- [ ] **Step 5: Commit**

```bash
git add src/views/works/WorksView.vue
git commit -m "Добавлены focus-visible и согласованный hover для карточек и тегов стека"
```

---

## Self-Review Notes

- **Spec coverage:** Hero (avatar/socials/resume) → Task 3; role/period data + display → Tasks 1 & 4; prev/next navigation → Task 5; alt/aria-label pass → Task 6; focus-visible + tag hover consistency → Tasks 3, 5, 6, 7 (spread across the files where it applies, plus VHeader/WorksView/WorksDetails explicitly in Task 6). All spec sections have a corresponding task.
- **Placeholder scan:** No TBD/TODO markers; every step has literal code, not a description of code.
- **Type consistency:** `ProjectType`/`DetailedInfo` fields (`role`, `period`) defined in Task 1 are consumed with matching names in Tasks 4 and 5 (`details.role`, `details.period`, `PROJECT_WORKS`, `ProjectType`). i18n keys defined in Task 2 (`hero.downloadResume`, `general.role`, etc.) match the exact keys referenced in Tasks 3–6.
- **External dependencies called out explicitly:** `src/assets/avatar.jpg` (Task 3) and `public/resume.pdf` (Task 3, referenced via `RESUME_PATH`) are owner-supplied files outside this plan's scope; Task 3 documents the exact build failure mode if `avatar.jpg` is missing so the implementer doesn't try to "fix" it by stubbing something in.
