import {
    mdiLanguageJavascript,
    mdiLanguageTypescript,
    mdiVuejs,
    mdiNuxt,
    mdiReact,
    mdiNodejs,
    mdiTailwind,
    mdiSass,
    mdiFruitPineapple,
    mdiTeddyBear,
    mdiDatabase,
    mdiDesktopTowerMonitor,
    mdiLanguageRust
} from '@mdi/js';

export const LINK_TO_GIT = 'https://github.com/folox-12';
export const EMAIL = 'd5881857@gmail.com';
export const LINK_TO_TELEGRAM = 'https://t.me/F0lox';
export const LINK_TO_LINKEDIN = 'https://www.linkedin.com/in/сергей-васильев-912198364/';
export const CV_PATH = '/resume.pdf';

// Логотип Express (simple-icons), в @mdi/js бренд-иконки нет
const expressPath = 'M12.262 16.666h1.146l6.975-9.325H19.22zm9.778 1.441v.004l-4.334-5.706-.557.74 4.873 6.682H.945V4.173h9.505l5.026 6.7.574-.772-4.374-5.928h.003l-.719-.945H0v17.544h24zM10.917 8.705a3.8 3.8 0 0 0-1.292-1.183q-.796-.45-1.916-.45c-.746 0-1.37.14-1.906.424a3.76 3.76 0 0 0-1.31 1.12 4.9 4.9 0 0 0-.75 1.581 7.17 7.17 0 0 0 0 3.696c.148.567.402 1.101.75 1.573a3.5 3.5 0 0 0 1.31 1.066q.803.39 1.906.389 1.77 0 2.739-.868.966-.867 1.328-2.457h-1.139q-.271 1.084-.977 1.734-.704.651-1.952.65-.812 0-1.392-.342a3.1 3.1 0 0 1-.957-.869 3.5 3.5 0 0 1-.551-1.182 5 5 0 0 1-.17-1.133 9 9 0 0 0-.015-.286 4.5 4.5 0 0 1 .015-.829c.047-.418.147-.83.296-1.223A3.7 3.7 0 0 1 5.54 9.05a2.9 2.9 0 0 1 .922-.742q.541-.28 1.246-.28c.47 0 .869.093 1.23.28q.541.281.922.742.379.461.587 1.057t.225 1.246H5.625l.004.957h6.182a7.3 7.3 0 0 0-.18-1.924 4.9 4.9 0 0 0-.715-1.68z';

export const SKILLS = [
    { name: 'JavaScript', icon: mdiLanguageJavascript },
    { name: 'TypeScript', icon: mdiLanguageTypescript },
    { name: 'Vue', icon: mdiVuejs },
    { name: 'Nuxt', icon: mdiNuxt },
    { name: 'React', icon: mdiReact },
    { name: 'Node.js', icon: mdiNodejs },
    { name: 'Express.js', icon: expressPath },
    { name: 'Tailwind CSS', icon: mdiTailwind },
    { name: 'Sass', icon: mdiSass },
    { name: 'Pinia', icon: mdiFruitPineapple },
    { name: 'Zustand', icon: mdiTeddyBear },
    { name: 'Sequelize', icon: mdiDatabase },
    { name: 'Tauri', icon: mdiDesktopTowerMonitor },
    { name: 'Rust', icon: mdiLanguageRust }
];
