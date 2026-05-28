// @ts-check
import { defineConfig } from 'astro/config';
import solid from '@astrojs/solid-js';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    // Enable Solid to support Solid JSX components.
    site: 'https://glowman554.de',
    integrations: [solid({ include: ['**'] })],

    security: {
        checkOrigin: false,
    },

    vite: {
        plugins: [tailwindcss()],
    },

    adapter: node({
        mode: 'standalone',
    }),
});
