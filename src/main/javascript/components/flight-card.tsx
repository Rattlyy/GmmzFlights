"use client"

import {Card, CardContent} from "@/components/ui/card";
import React from "react";
import {Button} from "@/components/ui/button";
import {Icon, Trip} from "@/lib/types";
import {Armchair, Clock, PlaneLanding, PlaneTakeoff} from "lucide-react";
import {Separator} from "@/components/ui/separator";

interface FlightCardProps {
    trip: Trip
    icons: Icon[]
}

export function FlightCard({trip, icons}: FlightCardProps) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4 pt-88 pl-8 pr-8">
                {trip.flights.map(flight => <>
                    <div className="flex items-center justify-between gap-2 font-medium text-xl">
                        <div className="flex gap-2"><PlaneTakeoff className="w-6 h-6"/> {flight.sourceAirport.name}
                        </div>
                        <div className="flex gap-2"><PlaneLanding
                            className="w-6 h-6"/> {flight.destinationAirport.name}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="text-sm text-muted-foreground">Airline</div>
                                <div className="font-medium flex flex-row gap-1">
                                    <div className="w-[16px] h-[16px] bg-no-repeat justify-self-center self-center"
                                         style={{backgroundImage: `${icons.find(icon => icon.code == flight.companyIata)!.css}`}}/>
                                    {flight.company}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Departure</div>
                                <div className="font-medium flex flex-row gap-1">
                                    <Clock className="w-5 h-5 self-center justify-self-center"/>
                                    <div className="font-medium">{flight.departureTime}</div>
                                </div>
                            </div>
                        </div>

                        <div className="self-center justify-self-center flex flex-col">
                        </div>

                        <div className="flex flex-col gap-2">
                            <div>
                                <div className="text-sm text-muted-foreground">Seats</div>
                                <div className="flex items-center gap-1">
                                    <Armchair className="w-5 h-5 self-center justify-self-center"/>
                                    <div className="font-medium">{flight.cheapSeats}</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Arrival</div>
                                <div className="font-medium flex flex-row gap-1">
                                    <Clock className="w-5 h-5 self-center justify-self-center"/>
                                    <div className="font-medium">{flight.arrivalTime}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator/>
                </>)}
                <div className="flex-col items-center justify-between">
                    {trip.flights.map(flight => <>
                        <div className="flex justify-between">
                            <div className="text-md text-muted-foreground">Leg Price</div>
                            <div className="text-md">{flight.price} €</div>
                        </div>
                    </>)}

                    <div className="flex justify-between items-center">
                        <div className="font-medium text-2xl">Total Price</div>
                        <div className="font-extrabold text-3xl">{trip.totalPrice} €</div>
                    </div>
                </div>

                <Button className="w-full">Book</Button>
            </CardContent>
        </Card>
    )
}