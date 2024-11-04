import {useFlightsStore} from "../state.tsx";
import {
    Anchor,
    Button,
    Card,
    Collapse,
    Divider,
    Grid,
    Group,
    Stack,
    Text,
    Title
} from "@mantine/core";
import {Trip} from "../api/types.ts";
import {Armchair, ClockIcon, PlaneLanding, PlaneTakeoff} from "lucide-react";
import {$api} from "../api/api.ts";
import {useDisclosure} from "@mantine/hooks";
import {Fragment} from "react";

export default function Flights() {
    const result = useFlightsStore(e => e.flights)
    // TODO isLoading const isLoading = useFlightsStore(e => e.isLoading)

    return result == null ? <Text>nind</Text> :
        result.ok ? <Grid>
            {result.trips!.map((e, index) =>
                <Grid.Col span={4} key={index}>
                    <Flight flight={e}/>
                </Grid.Col>
            )}
        </Grid> : <Text>nind</Text>
}

interface FlightProps {
    flight: Trip
}

export function Flight({flight}: FlightProps) {
    const [opened, {toggle}] = useDisclosure(false);
    return <Card>
        <Stack>
            <Divider/>
            {flight.hops.map((hop, hopIndex) =>
                <Fragment key={hopIndex}>
                    <Group justify="space-between">
                        <Stack align={"flex-start"}>
                            <Group>
                                <PlaneTakeoff/>
                                <Title order={2}>{hop.sourceAirport.code}</Title> {/*todo: tooltip*/}
                            </Group>

                            <Stack gap={"1px"}>
                                <Text c={"dimmed"}>Airline</Text>
                                <Company company={hop.company} iata={hop.companyIata}/>
                            </Stack>

                            <Stack gap={"1px"}>
                                <Text c={"dimmed"}>Time</Text>

                                <Group gap={"4px"} align={"center"}>
                                    <ClockIcon size={"15px"}/>
                                    <Text>{hop.departureTime}</Text>
                                </Group>
                            </Stack>
                        </Stack>
                        <Stack h={"100%"} justify={"center"} align={"center"}>
                            <Divider w={"10px"}/>
                            <Text c={"dimmed"}>Price</Text>
                            <Title order={5}>{hop.price} €</Title>
                            <Divider w={"10px"}/>
                        </Stack>
                        <Stack align={"flex-start"}>
                            <Group>
                                <PlaneLanding/>
                                <Title order={2}>{hop.destinationAirport.code}</Title> {/*todo: tooltip*/}
                            </Group>

                            <Stack gap={"1px"}>
                                <Text c={"dimmed"}>Arrival</Text>

                                <Group gap={"4px"} align={"center"}>
                                    <ClockIcon size={"15px"}/>
                                    <Text>{hop.arrivalTime}</Text>
                                </Group>
                            </Stack>

                            <Stack gap={"1px"}>
                                <Text c={"dimmed"}>Seats</Text>

                                <Group gap={"4px"} align={"center"}>
                                    <Armchair size={"15px"}/>
                                    <Text>{hop.cheapSeats}</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Group>
                    <Divider/>
                </Fragment>
            )}
            <Button onClick={toggle}>Book</Button>

            <Collapse in={opened}>
                <Grid grow gutter={"sm"} justify={"center"} columns={2}>
                    {flight.bookUrls.map((e, urlIndex) =>
                        <Fragment key={urlIndex}>
                            {e.urls.map((u, uIndex) =>
                                <Grid.Col span={1} key={uIndex}>
                                    <Group justify={"center"} align={"center"}>
                                        <Anchor href={u} target={"_blank"}><Button>{e.name}</Button></Anchor>
                                    </Group>
                                </Grid.Col>
                            )}
                        </Fragment>
                    )}
                </Grid>
            </Collapse>
        </Stack>
    </Card>
}

interface IconProps {
    company: string,
    iata: string
}

function Company({company, iata}: IconProps) {
    const {data, isLoading} = $api.useQuery(
        "get",
        "/icons"
    )

    return <Group gap={"5px"}>
        <div style={{
            width: "16px",
            height: "16px",
            backgroundRepeat: "no-repeat",
            justifySelf: "center",
            alignSelf: "center",
            // @ts-expect-error shouldnt happen
            backgroundImage: `${isLoading ? "" : data.find(icon => icon.code == iata)!.css}`
        }}></div>
        <Text>{company}</Text>
    </Group>
}