import {AppSidebar} from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import Flights from "@/components/flights.tsx";
import {TopBar} from "@/components/topbar.tsx";

export function App() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <TopBar/>
                <Flights/>
            </SidebarInset>
        </SidebarProvider>
    )
}

