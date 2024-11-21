import * as React from "react"
import {format} from "date-fns"
import {Calendar as CalendarIcon} from "lucide-react"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {useSidebar} from "@/components/ui/sidebar.tsx";
import {
    Drawer, DrawerClose,
    DrawerContent, DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer.tsx";
import {DateRange} from "react-day-picker";

type DatePickerProps = React.HTMLAttributes<HTMLDivElement> & {
    dateRange: DateRange
    setDateRange: (dateRange: DatePickerProps['dateRange']) => void
}

export function DatePickerWithRange({dateRange, setDateRange, className,}: DatePickerProps) {
    const {isMobile} = useSidebar()

    if (isMobile) {
        return <div className={cn("grid gap-2", className)}>
            <Drawer>
                <DrawerTrigger>
                    <PickerButton dateRange={dateRange} setDateRange={setDateRange}/>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className={"text-xl w-full text-center pt-4"}>Select dates</DrawerTitle>
                        <DrawerDescription>Choose your trip dates</DrawerDescription>
                    </DrawerHeader>
                    <PickerCalendar dateRange={dateRange} setDateRange={setDateRange}/>
                    <DrawerFooter>
                        <DrawerClose>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    }

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger>
                    <PickerButton dateRange={dateRange} setDateRange={setDateRange}/>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <PickerCalendar dateRange={dateRange} setDateRange={setDateRange}/>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function PickerCalendar({dateRange, setDateRange, className,}: DatePickerProps) {
    return <Calendar
        className={className}
        initialFocus
        mode="range"
        fromDate={new Date()}
        defaultMonth={dateRange.from}
        selected={dateRange}
        onSelect={(range) => {
            if(range) setDateRange(range)
        }}
        numberOfMonths={2}
    />
}

const PickerButton = React.forwardRef(function ({dateRange, className,}: DatePickerProps, ref) {
    return <Button
        // @ts-expect-error dormi
        ref={ref}
        id="date"
        variant={"outline"}
        className={cn(
            "justify-start text-left font-normal",
            dateRange ? "text-muted-foreground" : "",
            className
        )}
    >
        <CalendarIcon/>
        {dateRange.from ? (
            dateRange.to ? (
                <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                </>
            ) : (
                format(dateRange.from, "LLL dd, y")
            )
        ) : (
            <span>Pick a date</span>
        )}
    </Button>
})


