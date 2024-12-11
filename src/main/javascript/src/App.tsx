import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {lazy, ReactNode, StrictMode, Suspense} from "react";
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

export function AppRoutes() {
    return <Routes>
        <Route path={"/"} element={<App/>}/>
        <Route path={"/auth"} element={<Callback/>}/>
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