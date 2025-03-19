import kioskImage from '@/assets/works/kiosk/kiosk.png';
import gymImage from '@/assets/works/gym/gym.png';

type DetailedInfo = {
    stack?: string,
    website?: string,
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
    details?: DetailedInfo
}

export const PROJECT_WORKS: ProjectType[] = [
    {
        id: 'kiosk',
        name: 'Kiosk',
        to: '/works/kiosk/',
        shortDescription: `
            Kiosk
            Приложение для культурного центра военной части, предназначенное для отображения и воспроизведения медиафайлов (фото, видео, музыка).
        `,
        description: `
            Приложение для культурного центра военной части, предназначенное для отображения и воспроизведения медиафайлов (фото, видео, музыка).
        `,
        preview: kioskImage,
        images: [kioskImage, kioskImage],
        year: 2024,
        details: {
            stack: 'HTML, CSS, JavaScript, Node.js'
        }
    },
    {
        id: 'gym',
        name: 'GYM_APP',
        to: '/works/gym',
        shortDescription: `
            Веб-приложение предоставляет пользователям удобный инструмент для создания, планирования и распространения программ тренировок.
        `,
        description: `
                    Веб-приложение предоставляет пользователям удобный инструмент для создания, планирования и распространения программ тренировок.  Создание тренировочных программ
            Гибкий редактор для составления индивидуальных и групповых программ тренировок.
            Запись тренировок в календарь
            Интеграция с календарем для удобного планирования тренировочного процесса.
            Публикация программ на площадке
            Возможность выставления программ на открытой платформе для доступа другими пользователями.
            Добавление программ в личный кабинет
            Возможность сохранения понравившихся программ в персональном профиле.
        `,
        preview: gymImage,
        images: [gymImage],
        year: 2023,
        details: {
            stack: 'HTML, CSS, JavaScript, Nuxt2, Pinia, Node.js, Express.js, Sequelize'
        }
    }
];

export const getProjectWorkById = (id: string): ProjectType | undefined => {
    return PROJECT_WORKS.find(el => el.id === id);
};
