import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarRail,
} from "@/components/ui/sidebar"
import {CenteredSuspense} from "@/App.tsx";
import {lazy} from "react";

export default function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const SearchBox = lazy(() => import("@/components/searchbox.tsx"))
    const NavUser = lazy(() => import("@/components/nav-user.tsx"))

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <CenteredSuspense w={"200px"} h={"300px"}>
                    <NavUser/>
                </CenteredSuspense>
            </SidebarHeader>
            <SidebarContent>
                <div className={"p-3"}>
                    <CenteredSuspense w={"200px"} h={"full"}>
                        <SearchBox/>
                    </CenteredSuspense>
                </div>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
