import kioskImage from '@/assets/works/kiosk/kiosk.png';
import kioskThanks from '@/assets/works/kiosk/thanks.png';
import kioskFromLive from '@/assets/works/kiosk/fromLive.png';

import gymImage from '@/assets/works/gym/gym.png';

import chop from '@/assets/works/chop/chop.png';
import chop2 from '@/assets/works/chop/chop2.png';

type DetailedInfo = {
    stack?: string,
    website?: string[],
}
export type ProjectType = {
    id: string,
    name: string,
    to: string,
    shortDescription:string;
    description: string,
    preview: string,
    images: string[],
    year?: number,
    details?: DetailedInfo,
}

export const PROJECT_WORKS: ProjectType[] = [
    {
        id: 'kiosk',
        name: 'Kiosk',
        to: '/works/kiosk/',
        shortDescription: 'works.kiosk.shortDescription',
        description: 'works.kiosk.description',
        preview: kioskImage,
        images: [kioskImage, kioskThanks, kioskFromLive],
        year: 2024,
        details: {
            stack: 'HTML, CSS, JavaScript, Node.js',
            website: ['https://github.com/folox-12/kiosk']
        }
    },
    {
        id: 'gym',
        name: 'GYM_APP',
        to: '/works/gym',
        shortDescription: 'works.gym.shortDescription',
        description: 'works.gym.description',
        preview: gymImage,
        images: [gymImage],
        year: 2023,
        details: {
            stack: 'HTML, CSS, JavaScript, Nuxt2, Pinia, Node.js, Express.js, Sequelize',
            website: ['https://github.com/folox-12/gym_front', 'https://github.com/folox-12/gym_front']
        }
    },
    {
        id: 'chop',
        name: 'CHOP_GENERATION',
        to: '/works/chop',
        shortDescription: 'works.chop.shortDescription',
        description: 'works.chop.description',
        preview: chop,
        images: [chop, chop2],
        year: 2026,
        details: {
            stack: 'Tauri, React, TypeScript, Vite, Tailwind CSS, Zustand, docxtemplater, xlsx, Rust'
        }
    }
];

export const getProjectWorkById = (id: string): ProjectType | undefined => {
    return PROJECT_WORKS.find(el => el.id === id);
};
