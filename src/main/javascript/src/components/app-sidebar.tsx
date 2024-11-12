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

// This is sample data.
const data = {
    user: {
        name: "Login",
        email: "Unlock advanced features",
        avatar: "/avatars/shadcn.jpg",
    },
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser user={data.user}/>
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
