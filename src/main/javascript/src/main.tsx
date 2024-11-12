import {createRoot} from 'react-dom/client'
import './index.css'

import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";
import {App} from "@/App.tsx";
import {ThemeProvider} from "@/theme-provider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <ReactQueryDevtools initialIsOpen={false}/>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <App/>
            </ThemeProvider>
        </QueryClientProvider>
    </StrictMode>,
)
