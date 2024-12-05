import {$api, apiClient} from "../api/api.ts";
import {PlaneLanding, PlaneTakeoff} from "lucide-react";
import {useFlightsStore} from "../state.tsx";
import React, {useEffect, useMemo} from "react";
import {tripSchema} from "../api/zod.ts";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {MultiSelect} from "@/components/ui/multiselect.tsx";
import {SingleAirport} from "@/api/types.ts";
import {DatePickerWithRange} from "@/components/date-picker.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {addYears} from "date-fns";
import {toast} from "sonner";

export function SearchBox() {
    const {isLoading: isInFlight, setIsLoading: setIsInFlight, setFlights} = useFlightsStore()

    const formSchema = z.object({
        sourceAirports: z.array(z.string()).min(1, "Provide atleast 1 airport."),
        destinationAirports: z.array(z.string()).min(1, "Provide atleast 1 airport."),
        adults: z.number().min(1),
        children: z.number(),
        infants: z.number(),
        everywhere: z.boolean(),
        direct: z.boolean(),
        dateRange: z.object({
            from: z.date(),
            to: z.date()
        })
    }).refine(e => e.dateRange.to > e.dateRange.from, "End date must be greater than start date")

    const {isLoading, data: airports, /*isError TODO*/} = $api.useQuery(
        "get",
        "/airports"
    )

    const airportCodes = () => (airports == undefined ? [] : airports).map(e => e.code)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dateRange: {from: new Date(), to: addYears(new Date(), 1)},
            sourceAirports: [],
            destinationAirports: [],
            adults: 1,
            children: 0,
            infants: 0,
            direct: false,
            everywhere: false
        },
    })

    const everywhereToggled = form.watch("everywhere")
    useEffect(() => {
        if (everywhereToggled) {
            form.setValue("destinationAirports", ["XXX"])
        } else {
            form.setValue("destinationAirports", [])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [everywhereToggled]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setFlights(null)
        setIsInFlight(true)

        try {
            const res = await apiClient.GET("/flights", {
                params: {
                    query: {
                        ...values,
                        //@ts-expect-error codegen rotto TODO klite supporta array
                        sourceAirports: values.sourceAirports.join(","),
                        //@ts-expect-error codegen rotto
                        destinationAirports: values.destinationAirports.join(","),
                        startDate: values.dateRange.from.toISOString(),
                        endDate: values.dateRange.to.toISOString(),
                        dateRange: undefined
                    }
                }
            })

            if (res.response.status == 404)
                toast("No flights found", {
                    description: "No flights found for the given criteria",
                })
            else if (res.response.status == 200)
                setFlights(await z.array(tripSchema).parseAsync(res.data))
            else toast("Server error occurred", {
                    description: res.data ? res.data.toString() : "",
                })
        } catch (e) {
            console.log(e)
            toast("Client error occurred", {
                // @ts-expect-error exception must be any
                description: e.toString(),
            })
        } finally {
            setIsInFlight(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className={"flex flex-col gap-5"}>
                    <AirportMultiSelect
                        label="Departure Airports"
                        value={"sourceAirports"}
                        airportCodes={airportCodes()}
                        isLoading={isLoading}
                        airports={airports}
                        form={form}
                        icon={PlaneTakeoff}
                        disabled={false}
                    />

                    <AirportMultiSelect
                        label="Destination Airports"
                        value={"destinationAirports"}
                        airportCodes={airportCodes()}
                        isLoading={isLoading}
                        airports={airports}
                        form={form}
                        icon={PlaneLanding}
                        disabled={form.watch("everywhere")}
                    />

                    <FormField
                        control={form.control}
                        name="dateRange"
                        render={({field}) =>
                            <FormItem>
                                <FormLabel>Dates</FormLabel>
                                <FormControl>
                                    <DatePickerWithRange
                                        setDateRange={field.onChange}
                                        dateRange={field.value}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        }/>

                    <div className={"flex flex-row w-full items-center justify-between"}>
                        <FormField
                            control={form.control}
                            name="everywhere"
                            render={({field}) =>
                                <FormItem className={"flex flex-row gap-2 justify-center items-center text-center"}>
                                    <FormControl>
                                        <Checkbox
                                            {...field}
                                            value={undefined}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={"border-white"}
                                        />
                                    </FormControl>
                                    <FormLabel>Everywhere</FormLabel>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />

                        <FormField
                            control={form.control}
                            name="direct"
                            render={({field}) =>
                                <FormItem className={"flex flex-row gap-2 justify-center items-center text-center"}>
                                    <FormControl>
                                        <Checkbox
                                            {...field}
                                            value={undefined}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className={"border-white"}
                                        />
                                    </FormControl>
                                    <FormLabel>Direct flights</FormLabel>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                    </div>

                    <Button type={"submit"} disabled={isInFlight}> Search</Button>
                </div>
            </form>
        </Form>
    )
}

type AirportMultiSelectProps = {
    label: string,
    value: string,
    airportCodes: string[],
    isLoading: boolean,
    airports?: SingleAirport[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any,
    icon: React.ComponentType<{ className?: string }>
    disabled: boolean
}

function AirportMultiSelect(props: AirportMultiSelectProps) {
    const airports = useMemo(
        () => (props.airports == null ? [] : props.airports).map(option => ({
            label: option.name + " [" + option.code + "]",
            value: option.code,
            icon: props.icon
        })), [props.airports, props.icon]
    )

    return <FormField
        control={props.form.control}
        name={props.value}
        render={({field}) =>
            <FormItem>
                <FormLabel>{props.label}</FormLabel>
                <FormControl>
                    <MultiSelect
                        options={airports}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder={props.label}
                        modalPopover={true}
                        variant="default"
                        animation={2}
                        maxCount={3}
                        disabled={props.disabled}
                    />
                </FormControl>
                <FormMessage/>
            </FormItem>
        }
    />
}