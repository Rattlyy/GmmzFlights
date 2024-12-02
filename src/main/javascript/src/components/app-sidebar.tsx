import * as React from "react"

import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarRail,
} from "@/components/ui/sidebar"
import {SearchBox} from "@/components/searchbox.tsx";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                {!import.meta.env.SSR ? <NavUser /> : null}
            </SidebarHeader>
            <SidebarContent>
                <div className={"p-3"}>
                    <SearchBox/>
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
