import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        minify: false,
        rollupOptions: {
            input: {
                index: 'index.html',
                global: 'global.html',
                instance: 'instance.html',
            },
        },
    },
});
