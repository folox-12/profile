import kioskImage from '@/assets/works/kiosk/kiosk.png';
import kioskThanks from '@/assets/works/kiosk/thanks.png';

import gymImage from '@/assets/works/gym/gym.png';
import gymDemoVideo from '@/assets/works/gym/gym-demo.mp4';
import gymDemoPoster from '@/assets/works/gym/gym-demo-poster.jpg';

import chop1 from '@/assets/works/chop/chop1.png';
import chop2 from '@/assets/works/chop/chop2.png';
import chop3 from '@/assets/works/chop/chop3.png';
import chop4 from '@/assets/works/chop/chop4.png';

type WebsiteLink = {
    url: string,
    label?: string,
}
type DetailedInfo = {
    stack?: string,
    website?: WebsiteLink[],
    role?: string,
    period?: string,
}
export type ImageMedia = {
    type: 'image',
    src: string,
}
export type VideoMedia = {
    type: 'video',
    src: string,
    poster: string,
}
export type MediaItem = ImageMedia | VideoMedia;

const image = (src: string): ImageMedia => ({ type: 'image', src });

export type ProjectType = {
    id: string,
    name: string,
    to: string,
    shortDescription:string;
    description: string,
    preview: string,
    media: MediaItem[],
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
        media: [image(kioskImage), image(kioskThanks)],
        year: 2024,
        details: {
            stack: 'HTML, CSS, JavaScript, Node.js',
            website: [{ url: 'https://github.com/folox-12/kiosk' }],
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
        media: [{ type: 'video', src: gymDemoVideo, poster: gymDemoPoster }, image(gymImage)],
        year: 2023,
        details: {
            stack: 'HTML, CSS, JavaScript, Nuxt2, Pinia, Node.js, Express.js, Sequelize',
            website: [
                { url: 'https://github.com/folox-12/gym_front', label: 'Frontend' },
                { url: 'https://github.com/folox-12/gym_back', label: 'Backend' }
            ],
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
        media: [image(chop1), image(chop3), image(chop2), image(chop4)],
        year: 2026,
        details: {
            stack: 'React, Tauri, Tailwind CSS, Rust, TypeScript',
            website: [{ url: 'https://github.com/folox-12/CHOP-Gen-App' }],
            period: '2026'
        }
    }
];

export const getProjectWorkById = (id: string): ProjectType | undefined => {
    return PROJECT_WORKS.find(el => el.id === id);
};
