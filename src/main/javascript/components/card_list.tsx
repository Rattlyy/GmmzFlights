"use server"

import {FlightCard} from "@/components/flight_card";
import {getFlights, GetFlightsParams} from "@/lib/api";
import {Icon} from "@/lib/types";

interface CardListProps {
    requestData: GetFlightsParams,
    icons: Icon[]
}

export default async function CardList(props: CardListProps) {
    return (
        <main className="flex-1 bg-muted/20 py-8">
            <div className="max-w-full pl-5 pr-5 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {await renderFlights(props.requestData, props.icons)}
            </div>
        </main>
    )
}

async function renderFlights(params: GetFlightsParams, icons: Icon[]) {
    return await getFlights(params)
        .then(trips => trips.map(trip => <FlightCard key={Math.random()} trip={trip} icons={icons}/>))
        .catch(error => <div>Error: {error.statusText}</div>)
}