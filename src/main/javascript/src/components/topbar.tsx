import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {ArrowDownWideNarrow, ArrowUpNarrowWide, ArrowUpWideNarrow, Calendar, X} from "lucide-react";
import React from "react";
import {useDisplayStore, useFlightsStore} from "@/state.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useIsMobile} from "@/hooks/use-mobile.tsx";

export function TopBar() {
    const flights = useFlightsStore(e => e.flights)
    const {setOrder, setFilter} = useDisplayStore()
    const isMobile = useIsMobile()
    return <div className={"flex flex-row gap-3 p-2 h-16 border-b border-sidebar-border bg-sidebar items-center"}>
        <SidebarTrigger className={"pl-2"}/>
        {flights ? <>
            <Select onValueChange={setOrder}>
                <SelectTrigger className="pl-3 w-[180px]">
                    <SelectValue placeholder={<It><ArrowDownWideNarrow size={"1rem"}/> Order</It>}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="price-asc"><It><ArrowUpNarrowWide size={"1rem"}/> Price
                        Ascending</It></SelectItem>
                    <SelectItem value="price-desc"><It><ArrowUpWideNarrow size={"1rem"}/>Price
                        Descending</It></SelectItem>
                    <SelectItem value="date"><It><Calendar size={"1rem"}/> Date</It></SelectItem>
                    <SelectSeparator/>
                    <SelectItem value="clear"><It><X size={"1rem"}/> Clear</It></SelectItem>
                </SelectContent>
            </Select>

            <Input className="grow" placeholder={"Search"} onChange={e => setFilter(e.target.value)}/>
        </> : null}

        {isMobile ?
            flights ? null : <h1 className={"text-nowrap w-full text-center text-3xl font-bold"}>gmmz.dev // flights</h1>
            :
            <h1 className={(flights ? "" : "w-full grow") + "text-nowrap lg:text-3xl sm:text-xl font-bold flex flex-row gap-2 pb-3 pt-1 pl-3 pr-3 text-center items-center justify-end"}>
                gmmz.dev // flights
            </h1>
        }
    </div>
}

function It({children}: { children: React.ReactNode }) {
    return <div className={"flex flex-row items-center justify-center gap-2"}>{children}</div>
}