import {Button} from "@/components/ui/button";
import {PlaneIcon, PlaneLanding, PlaneTakeoff} from "lucide-react";
import React, {useRef} from "react";
import {GetFlightsParams} from "@/lib/api";
import {DatePickerWithRange} from "@/components/ui/daterangepicker";
import {ModeToggle} from "@/components/ui/dark-toggle";
import {MultiSelect} from "@/components/ui/multi-select";
import {addYears} from "date-fns";
import {Airport} from "@/lib/types";

interface HeaderProps {
    requestData?: GetFlightsParams | undefined,
    setRequestData: (value: (((prevState: (GetFlightsParams | undefined)) => (GetFlightsParams | undefined)) | GetFlightsParams | undefined)) => void,
    airports: Airport[]
}

export default function Header({requestData, setRequestData, airports}: HeaderProps) {
    let {current} = useRef<GetFlightsParams>({
        adults: 0,
        childrenState: 0,
        departureAirports: [],
        destinationAirports: [],
        direct: false,
        endDate: addYears(new Date(), 1),
        infants: 0,
        startDate: new Date()
    });

    let airportOptions = airports.map(airport => {
        return {label: airport.name, value: airport.id.toString(), icon: PlaneIcon}
    })

    return (
        <header className="py-4 px-6">
            <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">Flight Finder</div>
                <form className="flex items-center gap-4" onSubmit={e => {
                    e.preventDefault();
                    setRequestData(current)
                }}>
                    <DatePickerWithRange
                        className="pl-10 pr-4 py-2 rounded-md bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                    />

                    <div className="relative">
                        <PlaneTakeoff
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                        <MultiSelect
                            options={airportOptions}
                            defaultValue={[]}
                            onValueChange={value => {
                                current.departureAirports = value.map(it => airports.find(airport => airport.id.toString() == it)!)
                            }}

                            placeholder="From"
                            className="pl-10 pr-4 py-2 rounded-md bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                        />
                    </div>
                    <div className="relative">
                        <PlaneLanding
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                        <MultiSelect
                            options={airportOptions}
                            defaultValue={[]}
                            asChild={true}
                            onValueChange={value => {
                                current.destinationAirports = value.map(it => airports.find(airport => airport.id.toString() == it)!)
                            }}

                            placeholder="To"
                            className="pl-10 pr-4 py-2 rounded-md bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                        />
                    </div>
                    <Button variant="outline" className="px-6 py-2 rounded-md">
                        Search
                    </Button>
                </form>
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