import {useDisplayStore, useFlightsStore} from "../state.tsx";
import {Icon, Trip} from "../api/types.ts";
import {$api} from "../api/api.ts";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Calendar, Clock, MoveUp, PlaneLanding, PlaneTakeoff} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {lottieOptions} from "@/lib/utils.ts";
import {Fragment, useEffect, useState} from "react";
import {compareAsc, format, parseISO} from "date-fns";
import {useIsMobile} from "@/hooks/use-mobile.tsx";
import Lottie from "react-lottie";

export default function Flights() {
    const isMobile = useIsMobile()
    const {flights: result, isLoading} = useFlightsStore()
    const {filter, order} = useDisplayStore()
    const {data: icons} = $api.useQuery(
        "get",
        "/icons"
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [papera, setPapera] = useState<any>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [aereo, setAereo] = useState<any>()

    useEffect(() => {
        fetch("/papera.json").then(response => response.json()).then(data => setPapera(data))
        fetch("/aereo-vola.json").then(response => response.json()).then(data => setAereo(data))
    }, [Lottie]);

    if (result == null || isLoading) {
        return <>
            {isMobile ? <div className={"flex flex-row items-start"}>
                <MoveUp className={"animate-bounce"} size={50}/>
            </div> : null}
            <div className={"w-full h-full flex flex-col items-center justify-center"}>
                <Lottie
                    options={isLoading ? lottieOptions(aereo) : lottieOptions(papera)}
                    isClickToPauseDisabled={true}
                    height={200}
                    width={200}
                />

                <div className={"flex flex-row items-center justify-center text-center pt-4"}>
                    <PlaneTakeoff/>
                    <h1 className={"pl-4 pr-4 text-xl text-muted-foreground "}>gmmz.dev // flights</h1>
                    <PlaneLanding/>
                </div>
            </div>
        </>
    }

    let trips = result
    if (order != null) {
        switch (order) {
            case "price-desc":
                trips = result.sort((a, b) => b.totalPrice - a.totalPrice)
                break
            case "price-asc":
                trips = result.sort((a, b) => a.totalPrice - b.totalPrice)
                break
            case "date":
                trips = result.sort((a, b) => compareAsc(parseISO(a.hops[0].date), parseISO(b.hops[0].date)))
                break
            case "clear":
                trips = result
                break
        }
    }

    if (filter != null) {
        trips = trips.filter(flight => flight.hops.some(hop =>
            hop.sourceAirport.name.toLowerCase().includes(filter.toLowerCase()) ||
            hop.destinationAirport.name.toLowerCase().includes(filter.toLowerCase())
        ))
    }

    return <main className="flex-1 bg-muted/20 py-8">
        <div className="max-w-full pl-5 pr-5 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((flight, i) => <Flight key={i} icons={icons} flight={flight}/>)}
        </div>
    </main>
}

interface FlightProps {
    flight: Trip
    icons: Icon[] | undefined
}

export function Flight({flight, icons}: FlightProps) {
    return <Card>
        <CardContent className="flex flex-col gap-4 pt-8 pl-8 pr-8">
            {flight.hops.map(hop => <>
                <div className="flex items-center justify-between gap-2 font-medium text-xl">
                    {[hop.sourceAirport, hop.destinationAirport].map((airport, i) =>
                        <Popover key={i} modal={false}>
                            <PopoverTrigger>
                                <div className="flex gap-2">
                                    {i == 0 ? <PlaneTakeoff className="w-6 h-6"/> :
                                        <PlaneLanding className="w-6 h-6"/>} {airport.code}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent>
                                {airport.name}
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <div>
                            <div className="text-sm text-muted-foreground">Airline</div>
                            <div className="font-medium flex flex-row gap-1">
                                <div className="w-[16px] h-[16px] bg-no-repeat justify-self-center self-center"
                                     style={{backgroundImage: `${(icons ? icons : []).find(icon => icon.code == hop.companyIata)?.css}`}}/>
                                {hop.company}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Date</div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-5 h-5 self-center justify-self-center"/>
                                <div
                                    className="font-medium">{format(parseISO(hop.date), "dd/MM/yyyy")}</div>
                            </div>
                        </div>
                    </div>

                    <div className="self-center justify-self-center flex flex-col">
                    </div>

                    <div className="flex flex-col gap-2">
                        <div>
                            <div className="text-sm text-muted-foreground">Departure</div>
                            <div className="font-medium flex flex-row gap-1">
                                <Clock className="w-5 h-5 self-center justify-self-center"/>
                                <div className="font-medium">{hop.departureTime}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Arrival</div>
                            <div className="font-medium flex flex-row gap-1">
                                <Clock className="w-5 h-5 self-center justify-self-center"/>
                                <div className="font-medium">{hop.arrivalTime}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <Separator/>
            </>)}
            <div className="flex-col items-center justify-between">
                {flight.hops.map(flight => <>
                    <div className="flex justify-between">
                        <div className="text-md text-muted-foreground">Leg Price</div>
                        <div className="text-md">{flight.price} €</div>
                    </div>
                </>)}

                <div className="flex justify-between items-center">
                    <div className="font-medium text-2xl">Total Price</div>
                    <div className="font-extrabold text-3xl">{flight.totalPrice} €</div>
                </div>
            </div>

            <Popover>
                <PopoverTrigger>
                    <Button className="w-full">Book</Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className={"flex flex-col gap-3"}>
                        {flight.bookUrls.map((bookUrls, i) =>
                            <Fragment key={i}>
                                {bookUrls.urls.map((url, i) =>
                                    <Button key={i} onClick={() => {
                                        window.open(url, "__blank")
                                    }}>
                                        {bookUrls.name}
                                    </Button>)}
                            </Fragment>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </CardContent>
    </Card>
}