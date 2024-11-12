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

type DatePickerProps = React.HTMLAttributes<HTMLDivElement> & {
    dateRange: {
        startDate: Date,
        endDate: Date
    }

    setDateRange: (startDate: Date, endDate: Date) => void
}

export function DatePickerWithRange({dateRange, setDateRange, className,}: DatePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "justify-start text-left font-normal",
                            dateRange ? "text-muted-foreground" : ""
                        )}
                    >
                        <CalendarIcon/>
                        {dateRange.startDate ? (
                            dateRange.endDate ? (
                                <>
                                    {format(dateRange.startDate, "LLL dd, y")} -{" "}
                                    {format(dateRange.endDate, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.startDate, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.startDate}
                        selected={{from: dateRange.startDate, to: dateRange.endDate}}
                        onSelect={(range) => {
                            if (range) setDateRange(range.from!, range.to!)
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}


