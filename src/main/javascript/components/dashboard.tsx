"use client"

import React, {useState, useTransition} from "react";
import Header from "@/components/header";
import CardList from "@/components/card-list";
import {Airport, Icon, Trip} from "@/lib/types";
import FlightCardSkeleton from "@/components/flight-card-skeleton";
import {FlightCard} from "@/components/flight-card";

export default function Dashboard({airports, icons}: { airports: Airport[], icons: Icon[] }) {
    const [trips, setTrips] = useState<Trip[]>([])
    const [isPending, startTransition] = useTransition();

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                airports={airports}
                setTrips={setTrips}
                startTransition={startTransition}
                isPending={isPending}
            />

            <CardList
                cards={isPending ?
                    [...Array(10)].map(_ => <FlightCardSkeleton key={Math.random()}/>) :
                    trips.map(trip => <FlightCard key={Math.random()} trip={trip} icons={icons}/>)}
            />
        </div>
    )
}