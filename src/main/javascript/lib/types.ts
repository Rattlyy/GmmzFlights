// class cacheable.impl.Airport
export interface Airport {additionals: Array<string>; code: string; id: number; name: string}
// class cacheable.impl.Icon
export interface Icon {code: string; css: string}
// class trips.Flight
export interface Flight {arrivalTime: string; cheapSeats: string; company: string; companyIata: string; date: string; departureTime: string; destinationAirport: Airport; price: number; sourceAirport: Airport}
// class trips.Trip
export interface Trip {// @ts-ignore
    bookUrls: Record<Array<string>, string>; flights: Array<Flight>; lengthOfStay: number; totalPrice: number}