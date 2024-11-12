import {SidebarTrigger} from "@/components/ui/sidebar.tsx";

export function TopBar() {
    return <div className={"flex flex-row gap-2 p-2 h-16 border-b border-sidebar-border bg-sidebar items-center"}>
        <SidebarTrigger />
        <h1 className={"grow w-full lg:text-3xl sm:text-xl font-bold flex flex-row gap-2 p-2 justify-end"}>
            gmmz.dev // flights
        </h1>
    </div>
}