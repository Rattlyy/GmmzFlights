// class it.rattly.flights.AirportQuery
export interface AirportQuery {additionals: Array<string>; code: string; name: string}
// class it.rattly.flights.BookUrl
export interface BookUrl {name: string; urls: Array<string>}
// class it.rattly.flights.Flight
export interface Flight {arrivalTime: string; cheapSeats: string; company: string; companyIata: string; date: string; departureTime: string; destinationAirport: SingleAirport; duration: string; price: number; sourceAirport: SingleAirport}
// class it.rattly.flights.Icon
export interface Icon {code: string; css: string}
// class it.rattly.flights.Trip
export interface Trip {bookUrls: Array<BookUrl>; hops: Array<Flight>; lengthOfStay: number; totalPrice: number}
// class it.rattly.flights.cacheable.impl.Icon
export interface Icon {code: string; css: string}
// class it.rattly.flights.cacheable.impl.SingleAirport
export interface SingleAirport {code: string; name: string}
// class it.rattly.flights.trips.SearchResult
export interface SearchResult {failReason?: string; generationTime: number; ok: boolean; trips?: Array<Trip>}
