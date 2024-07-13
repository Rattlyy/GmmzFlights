import {Card, CardContent} from "@/components/ui/card";
import React from "react";
import {Button} from "@/components/ui/button";
import {Icon, Trip} from "@/lib/types";
import {Armchair, Clock, PlaneIcon, PlaneLanding, PlaneTakeoff} from "lucide-react";

interface FlightCardProps {
    trip: Trip
    icons: Icon[]
}

export function FlightCard({trip, icons}: FlightCardProps) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4 pt-4">
                {trip.flights.map(flight => <>
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 font-medium text-xl">
                            <PlaneTakeoff className="w-6 h-6"/>
                            <div>{flight.sourceAirport.name}</div>
                            <div className="text-muted-foreground">-</div>
                            <PlaneLanding className="w-6 h-6"/>
                            <div>{flight.destinationAirport.name}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-muted-foreground">Departure</div>
                            <div className="font-medium flex flex-row gap-1">
                                <Clock className="w-5 h-5 self-center justify-self-center"/>
                                <div className="font-medium">{flight.departureTime}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Seats</div>
                            <div className="flex items-center gap-1">
                                <Armchair className="w-5 h-5 self-center justify-self-center"/>
                                <div className="font-medium">{flight.cheapSeats}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Price</div>
                            <div className="font-medium">€ {flight.price}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Airline</div>

                            <div className="font-medium flex flex-row gap-1">
                                <div className="w-[16px] h-[16px] bg-no-repeat justify-self-center self-center"
                                     style={{backgroundImage: `${icons.find(icon => icon.code == flight.companyIata)!.css}`}}/>
                                {flight.company}
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
                </>)}
                <div className="text-2xl flex items-center justify-between">
                    <div className="font-medium">Total Price</div>
                    <div className="font-extrabold text-3xl">{trip.totalPrice} €</div>
                </div>

                <Button className="w-full">Book</Button>
            </CardContent>
        </Card>
    )
}