/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'selector',
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    content: [],
    theme: {
        extend: {
            colors: {
                bg: '#fbf3e6',
                'bg-dark': '#22262b',
                ink: '#161513',
                'ink-dark': '#f4f3f0',
                soft: '#4a463f',
                'soft-dark': '#c7c5c0',
                card: '#fffdf8',
                'card-dark': '#2a2e34',
                mint: '#b7ecd1',
                'mint-dark': '#4fb897',
                mintline: '#7cc79c',
                'mintline-dark': '#3d9478',
                imgbg: '#eee6d6',
                'imgbg-dark': '#32363c',
                tagbg: '#f1e9d9',
                onmint: '#0d1a12',
                'nav-active-dark': '#3a6f5c'
            }
        },
        screens: {
            sm: '640px',
            // => @media (min-width: 640px) { ... }

            // Граница десктопа: ниже неё сайт показывается в мобильном виде,
            // включая раздел работ обычным списком вместо экрана ноутбука
            md: '880px',
            // => @media (min-width: 880px) { ... }

            lg: '1024px',
            // => @media (min-width: 1024px) { ... }

            xl: '1280px'
            // => @media (min-width: 1280px) { ... }
        }

    },
    plugins: []
};
