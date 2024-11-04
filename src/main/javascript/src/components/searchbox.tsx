import {useForm} from "@mantine/form";
import {Button, Checkbox, MultiSelect, Stack} from "@mantine/core";
import {$api, apiClient} from "../api/api.ts";
import {PlaneLanding, PlaneTakeoff} from "lucide-react";
import {DatePicker} from "@mantine/dates";
import {useFlightsStore} from "../state.tsx";
import {useState} from "react";
import {searchResultSchema} from "../api/zod.ts";

export function SearchBox() {
    const setFlights = useFlightsStore(e => e.setFlights)
    const [isInFlight, setIsInFlight] = useState<boolean>()
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            sourceAirports: [],
            destinationAirports: [],
            adults: 1,
            children: 0,
            infants: 0,
            dates: [new Date(), nextYear],
            everywhere: false,
            direct: false
        },

        validate: {}, //TODO both airport must exist e altra roba
    });

    const {isLoading, data, isError} = $api.useQuery(
        "get",
        "/airports"
    )

    // @ts-expect-error shouldn't happen
    const airports = () => data.map(e => (
        {label: `${e.name} [${e.code}]`, value: e.code}
    ))

    return (
        <form onSubmit={
            form.onSubmit((values) => {//TODO: error handling
                setIsInFlight(true)
                apiClient.GET("/flights", {
                    params: {
                        query: {
                            // @ts-expect-error codegen rotto
                            sourceAirports: values.sourceAirports.join(","),
                            // @ts-expect-error codegen rotto
                            destinationAirports: values.destinationAirports.join(","),
                            adults: values.adults,
                            children: values.children,
                            infants: values.infants,
                            startDate: values.dates[0].toISOString(),
                            endDate: values.dates[1].toISOString()
                        }
                    }
                }).then((res) => {
                    const results = searchResultSchema.safeParse(res.data)
                    if (results.success) {
                        setFlights(results.data)
                    } else {
                        //TODO: HANDLE ERRORS PORCA MADONNA
                    }
                }).catch((e) => {
                    console.log(e)
                }).finally(() => {
                    setIsInFlight(false)
                })
            })
        }>
            <Stack
                align="stretch"
                justify="center"
                gap="md"
            >
                <MultiSelect
                    leftSection={<PlaneTakeoff/>}
                    label="Departure airports"
                    placeholder={isLoading ? "Loading..." : "Choose your airports.."}
                    data={(isLoading || isError) ? [] : airports()}
                    searchable
                    key={form.key('sourceAirports')}
                    disabled={isLoading}
                    {...form.getInputProps('sourceAirports')}
                />

                <MultiSelect
                    leftSection={<PlaneLanding/>}
                    label="Arrival airports"
                    placeholder={isLoading ? "Loading..." : "Choose your airports.."}
                    data={(isLoading || isError) ? [] : airports()}
                    searchable
                    key={form.key('destinationAirports')}
                    disabled={isLoading || form.getValues()["everywhere"]}
                    {...form.getInputProps('destinationAirports')}
                />

                <Checkbox
                    label={"Everywhere"}
                    key={form.key('everywhere')}
                    {...form.getInputProps('everywhere')}
                />

                <DatePicker
                    type={"range"}
                    key={form.key('dates')}
                    {...form.getInputProps('dates')}
                />

                <Button type={"submit"} disabled={isInFlight}>Search</Button>
            </Stack>
        </form>
    )
}