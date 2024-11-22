import {createRoot} from 'react-dom/client'
import './index.css'

import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";
import {App} from "@/App.tsx";
import {ThemeProvider} from "@/theme-provider.tsx";
import {LogtoProvider, LogtoConfig, UserScope} from '@logto/react';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import {Callback} from "@/callback.tsx";

const config: LogtoConfig = {
    endpoint: 'https://auth.gmmz.dev/',
    appId: 'z4svyw4vtrqn9xizzh6wx',
    scopes: [
        UserScope.Email,
        UserScope.Phone,
        UserScope.Profile,
        UserScope.CustomData,
        UserScope.Identities,
        UserScope.Organizations,
    ],
};

const router = createBrowserRouter([
    {path: "/", element: <App/>,},
    {path: "/auth", element: <Callback />}
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <LogtoProvider config={config}>
            <QueryClientProvider client={new QueryClient()}>
                <ReactQueryDevtools initialIsOpen={false}/>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <RouterProvider router={router}/>
                </ThemeProvider>
            </QueryClientProvider>
        </LogtoProvider>
    </StrictMode>,
)
