import {DatePickerWithRange} from "@/components/ui/daterangepicker";
import {MultiSelect} from "@/components/ui/multi-select";
import {Airport, Trip} from "@/lib/types";
import {Button} from "@/components/ui/button";
import {Form, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {PlaneIcon, PlaneLanding, PlaneTakeoff} from "lucide-react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {addYears} from "date-fns";
import {Input} from "@/components/ui/input";
import {getFlights} from "@/lib/api";
import React from "react";
import {ToastAction} from "@/components/ui/toast";
import {useToast} from "@/components/ui/use-toast";

const schema = z.object({
    departureAirports: z.array(z.string()).min(1),
    destinationAirports: z.array(z.string()).min(1),
    adults: z.number().min(1),
    childrenState: z.number().min(0),
    infants: z.number().min(0),
    startDate: z.date(),
    endDate: z.date(),
    direct: z.boolean(),
})

interface HeaderProps {
    airports: Airport[],
    setTrips: (trips: Trip[]) => void,
    startTransition: React.TransitionStartFunction,
    isPending: boolean
}

export default function SearchForm({airports, setTrips, startTransition, isPending}: HeaderProps) {
    let airportOptions = airports.map(airport => {
        return {label: airport.name, value: airport.id.toString(), icon: PlaneIcon}
    })

    const {toast} = useToast()
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            departureAirports: [],
            destinationAirports: [],
            adults: 1,
            childrenState: 0,
            infants: 0,
            startDate: new Date(),
            endDate: addYears(new Date(), 1),
            direct: false,
        }
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField name="dateRange" render={(field) => (
                    <FormItem>
                        <FormLabel hidden={true}>Dates</FormLabel>
                        <DatePickerWithRange
                            className=""
                            {...field}
                        />
                        <FormMessage/>
                    </FormItem>
                )}/>

                <FormField name="departureAirports" render={(field) => (
                    <FormItem>
                        <FormLabel hidden={true}>From</FormLabel>
                        <MultiSelect
                            options={airportOptions}
                            defaultValue={[]}
                            icon={<PlaneTakeoff/>}
                            onValueChange={value => {
                                form.setValue("departureAirports", value)
                            }}

                            placeholder="From"
                            className="pl-10 pr-4 py-2 rounded-md bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                            {...field}
                        />
                        <FormMessage/>
                    </FormItem>
                )}/>

                <FormField name="destinationAirports" render={(field) => (
                    <FormItem>
                        <FormLabel hidden={true}>To</FormLabel>
                        <MultiSelect
                            options={airportOptions}
                            defaultValue={[]}
                            asChild={true}
                            icon={<PlaneLanding/>}
                            onValueChange={value => {
                                form.setValue("destinationAirports", value)
                            }}

                            placeholder="To"
                            className="pl-10 pr-4 py-2 rounded-md bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                            {...field}
                        />
                        <FormMessage/>
                    </FormItem>
                )}/>

                <FormField name="adults" render={(field) => (
                    <FormItem>
                        <FormLabel hidden={true}>Adults</FormLabel>
                        <Input
                            placeholder="Adults"
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                        />
                        <FormMessage/>
                    </FormItem>
                )}/>

                <FormField name="children" render={(field) => (
                    <FormItem>
                        <FormLabel hidden={true}>Children</FormLabel>
                        <Input
                            placeholder="Children"
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                        />
                        <FormMessage/>
                    </FormItem>
                )}/>

                <FormField name="infants" render={(field) => (
                    <FormItem>
                        <FormLabel hidden={true}>Infants</FormLabel>
                        <Input
                            placeholder="Infants"
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                        />
                        <FormMessage/>
                    </FormItem>
                )}/>

                <Button type="submit" className="px-6 py-2 rounded-md" disabled={isPending}>
                    Search
                </Button>
            </form>
        </Form>
    )


    async function onSubmit(data: z.infer<typeof schema>) {
        startTransition(async () => {
            const action = await getFlights({
                departureAirports: data.departureAirports.map(airport => ({id: parseInt(airport)} as Airport)),
                destinationAirports: data.destinationAirports.map(airport => ({id: parseInt(airport)} as Airport)),
                adults: data.adults,
                childrenState: data.childrenState,
                infants: data.infants,
                startDate: data.startDate,
                endDate: data.endDate,
                direct: data.direct,
            })

            if ("status" in action) {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: action.statusText,
                    action: <ToastAction altText="Try again" onClick={() => onSubmit(data)}> Try again </ToastAction>,
                })

                setTrips([])
            } else {
                setTrips(action)
            }
        })
    }
}