import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // generate .vite/manifest.json in outDir
        manifest: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
