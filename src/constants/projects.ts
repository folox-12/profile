import kioskImage from '@/assets/works/kiosk/kiosk.png';
import gymImage from '@/assets/works/gym/gym.png';

type ProjectType = {
    name: string,
    to: string,
    description: string,
    preview: string,
}

export const PROJECT_WORKS: ProjectType[] = [
    {
        name: 'Kiosk',
        to: '/works/kiosk',
        description: 'about about about about',
        preview: kioskImage
    },
    {
        name: 'GYM_APP',
        to: '/works/gym',
        description: 'gym gym gym gym gym gym gym gym gym gym gym gym',
        preview: gymImage

    }
];
