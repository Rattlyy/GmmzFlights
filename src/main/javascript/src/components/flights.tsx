import {useFlightsStore} from "../state.tsx";
import {
    Anchor,
    Box,
    Button,
    Card,
    Collapse,
    Divider,
    Grid,
    Group,
    Loader,
    Stack,
    Text,
    Title
} from "@mantine/core";
import { Trip } from "../api/types.ts";
import { Armchair, ClockIcon, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { $api } from "../api/api.ts";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { Fragment, useEffect, useState } from "react";

export default function Flights() {
    const result = useFlightsStore(e => e.flights)
    const blockSize = 9
    const [showLimit, setShowLimit] = useState(1)
    const [scroll, _scrollTo] = useWindowScroll()

    const hasListFinished = showLimit*blockSize >= (result?.trips?.length??0)
    const pixelTrasholdLoading = 15

    useEffect(() => {
        if (scroll.y >= document.body.scrollHeight - window.innerHeight - pixelTrasholdLoading && !hasListFinished)  {
            setShowLimit((old) => old + 1)
        }
    }, [scroll])
    // TODO isLoading const isLoading = useFlightsStore(e => e.isLoading)

    if (result == null || !result.ok) {
        return <Text>nind</Text>
    }

    return <Box>
        <Grid>
            {result.trips!.map((e, index) =>{
                if (index >= showLimit*blockSize) return null
                return <Grid.Col span={4} key={index}>
                    <Flight flight={e}/>
                </Grid.Col>
            })}
        </Grid>
        <Box display="flex" style={{ width: "100%", alignItems: "center", justifyContent:"center"}} my={5}>
            {(!hasListFinished)?<Loader />:null}
        </Box>
    </Box>
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
    const iconQuery = $api.useQuery(
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
            backgroundImage: `${!iconQuery.isFetched ? "" : iconQuery.data?.find(icon => icon.code == iata)!.css}`
        }}></div>
        <Text>{company}</Text>
    </Group>
}