import {defineConfig, HtmlTagDescriptor, Plugin, UserConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig(({isSsrBuild}) => {
    const build: UserConfig = {
        plugins: [react(), injectCssAsStyleTag(), removeStylesheetLinks()],
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

function injectCssAsStyleTag(): Plugin {
    return {
        name: "inject-css-as-style-tags",
        enforce: "post",
        apply: "build",
        transformIndexHtml(_, ctx) {
            const htmlTagDescriptors: HtmlTagDescriptor[] = [];
            const bundle = ctx.bundle;
            if (bundle == null) {
                return [];
            }

            Object.values(bundle)
                .filter((output) => output.fileName.endsWith(".css"))
                .forEach((output) => {
                    if (output.type === "asset" && typeof output.source === "string") {
                        htmlTagDescriptors.push({
                            tag: "style",
                            children: output.source,
                            injectTo: "head",
                        });
                    }
                });

            return htmlTagDescriptors;
        },
    };
}

function removeStylesheetLinks(): Plugin {
    return {
        name: "remove-stylesheet-links",
        enforce: "post",
        apply: "build",
        transformIndexHtml(html, _) {
            return html.replaceAll(/<link\s+rel="stylesheet"(\s.*\s)href="(.*)\.css">/gi, "");
        },
    };
}