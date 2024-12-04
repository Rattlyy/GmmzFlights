import {AppSidebar} from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {lazy, Suspense} from "react";

export function App() {
    const TopBar = lazy(() => import("@/components/topbar.tsx"))
    const Flights = lazy(() => import("@/components/flights.tsx"))

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <Suspense fallback={<div className={"w-full h-full flex items-center justify-center"}>Loading...</div>}>
                    <TopBar/>
                    <Flights/>
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    )
}