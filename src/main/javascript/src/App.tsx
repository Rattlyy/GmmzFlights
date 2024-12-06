import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {lazy, ReactNode, Suspense} from "react";
import TopBar from "@/components/topbar.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import AppSidebar from "@/components/app-sidebar.tsx";

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