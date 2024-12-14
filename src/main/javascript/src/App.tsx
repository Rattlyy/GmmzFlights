import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {lazy, ReactNode, StrictMode, Suspense, useEffect, useState} from "react";
import TopBar from "@/components/topbar.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import AppSidebar from "@/components/app-sidebar.tsx";
import {LogtoConfig, LogtoProvider, UserScope} from "@logto/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {ThemeProvider} from "@/theme-provider.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {Route, Routes} from "react-router-dom";
import {Callback} from "@/callback.tsx";
import {Lottie} from "@alfonmga/react-lottie-light-ts";

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
    resources: ["https://flights.gmmz.dev/private"]
};

function NotFound() {
    const [paperaSad, setPaperaSad] = useState({})

    useEffect(() => {
        fetch("https://flights.gmmz.dev/assets/papera-sad.json").then(res => res.json()).then(setPaperaSad)
    }, []);

    return (
        <div className={"flex flex-col w-full h-full min-h-screen items-center justify-center text-center gap-3"}>
            <Lottie
                height={"200px"}
                width={"200px"}
                config={{
                    loop: true,
                    autoplay: true,
                    animationData: paperaSad,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice"
                    }
                }}
            />

            <h1 className={"text-4xl text-center text-white font-bold"}>404 Not Found</h1>
            <p className={"text-center text-white"}>The page you are looking for does not exist.</p>
        </div>
    );
}

export function AppRoutes() {
    return <Routes>
        <Route path={"/"} element={<App/>}/>
        <Route path={"/auth"} element={<Callback/>}/>
        <Route path="*" element={<NotFound/>}/>
    </Routes>
}

export function Shell({children}: { children: ReactNode }) {
    return (<StrictMode>
        <LogtoProvider config={config}>
            <QueryClientProvider client={new QueryClient()}>
                {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false}/> : null}
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    {children}
                    <Toaster/>
                </ThemeProvider>
            </QueryClientProvider>
        </LogtoProvider>
    </StrictMode>)
}

export function App() {
    const Flights = lazy(() => import("@/components/flights.tsx"))

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <TopBar/>
                <CenteredSuspense w={"full"} h={"full"}>
                    <Flights/>
                </CenteredSuspense>
            </SidebarInset>
        </SidebarProvider>
    )
}

export const CenteredSuspense = ({w, h, children}: { w: string, h: string, children: ReactNode }) => {
    return (
        <Suspense fallback={<Skeleton className={"w-" + w + " h-" + h + " rounded-full"}/>}>
            {children}
        </Suspense>
    )
}