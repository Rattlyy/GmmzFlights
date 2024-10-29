import {Button} from "@/components/ui/button";
import React from "react";
import {ModeToggle} from "@/components/ui/dark-toggle";
import {Airport, Trip} from "@/lib/types";
import SearchForm from "@/components/search-form";

interface HeaderProps {
    airports: Airport[],
    setTrips: (trips: Trip[]) => void,
    startTransition: React.TransitionStartFunction,
    isPending: boolean
}

export default function Header({airports, setTrips, startTransition, isPending}: HeaderProps) {
    return (
        <header className="py-4 px-6">
            <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">Flight Finder</div>
                <SearchForm airports={airports} setTrips={setTrips} startTransition={startTransition} isPending={isPending}/>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="px-6 py-2 rounded-md">
                        Filter
                    </Button>
                    <Button variant="outline" className="px-6 py-2 rounded-md">
                        Order
                    </Button>
                    <Button variant="outline" className="px-6 py-2 rounded-md">
                        Export as Spreadsheet
                    </Button>
                    <ModeToggle/>
                </div>
            </div>
        </header>
    )
}