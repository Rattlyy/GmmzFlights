import {createRoot} from 'react-dom/client'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './index.css'
import App from './App.tsx'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {createTheme, MantineColorsTuple, MantineProvider} from '@mantine/core';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";

const myColor: MantineColorsTuple = [
    '#f1f3f9',
    '#e0e4eb',
    '#bec6d9',
    '#98a7c7',
    '#798cb8',
    '#657baf',
    '#5b73ac',
    '#4b6197',
    '#415688',
    '#354a79'
];

const theme = createTheme({
    primaryColor: "myColor",
    colors: {
        myColor,
    }
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
            <ReactQueryDevtools initialIsOpen={false} />
            <MantineProvider theme={theme} forceColorScheme={"dark"}>
                <App/>
            </MantineProvider>
        </QueryClientProvider>
    </StrictMode>,
)
