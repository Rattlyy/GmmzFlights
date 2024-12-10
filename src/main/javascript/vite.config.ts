import {defineConfig, UserConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig(({isSsrBuild}) => {
    const build: UserConfig = {
        plugins: [react()],
        build: {
            manifest: true,
            rollupOptions: {
                treeshake: "recommended",
                output: {
                    manualChunks: {
                        lottie: ['@alfonmga/react-lottie-light-ts'],
                        react: ['react', 'react-dom'],
                        zod: ['zod'],
                        router: ['react-router-dom'],
                        datefns: ['date-fns'],
                        tailwindmerge: ['tailwind-merge'],
                        tanstackquery: ['@tanstack/react-query'],
                    }
                }
            }
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    }

    if (isSsrBuild) {
        // @ts-expect-error type gymnastics
        delete build.build.rollupOptions.output.manualChunks
    }

    return build
})