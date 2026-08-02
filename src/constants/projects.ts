import kioskImage from '@/assets/works/kiosk/kiosk.png';
import kioskThanks from '@/assets/works/kiosk/thanks.png';

import gymImage from '@/assets/works/gym/gym.png';

import chop1 from '@/assets/works/chop/chop1.png';
import chop2 from '@/assets/works/chop/chop2.png';
import chop3 from '@/assets/works/chop/chop3.png';
import chop4 from '@/assets/works/chop/chop4.png';

type DetailedInfo = {
    stack?: string,
    website?: string[],
    role?: string,
    period?: string,
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
        images: [kioskImage, kioskThanks],
        year: 2024,
        details: {
            stack: 'HTML, CSS, JavaScript, Node.js',
            website: ['https://github.com/folox-12/kiosk'],
            period: '2024'
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
            website: ['https://github.com/folox-12/gym_front', 'https://github.com/folox-12/gym_front'],
            period: '2023'
        }
    },
    {
        id: 'chop',
        name: 'Chop',
        to: '/works/chop',
        shortDescription: 'works.chop.shortDescription',
        description: 'works.chop.description',
        preview: chop1,
        images: [chop1, chop3, chop2, chop4],
        year: 2026,
        details: {
            stack: 'React, Tauri, Tailwind CSS, Rust, TypeScript',
            website: ['https://github.com/folox-12/CHOP-Gen-App'],
            period: '2026'
        }
    }
];

export const getProjectWorkById = (id: string): ProjectType | undefined => {
    return PROJECT_WORKS.find(el => el.id === id);
};
