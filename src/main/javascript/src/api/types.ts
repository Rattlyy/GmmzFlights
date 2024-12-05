// class it.rattly.flights.cacheable.impl.Icon
export interface Icon {code: string; css: string}
// class it.rattly.flights.cacheable.impl.SingleAirport
export interface SingleAirport {code: string; name: string}
// class it.rattly.flights.trips.BookUrl
export interface BookUrl {name: string; urls: Array<string>}
// class it.rattly.flights.trips.Flight
export interface Flight {arrivalTime: string; cheapSeats: string; company: string; companyIata: string; date: string; departureTime: string; destinationAirport: SingleAirport; duration: string; price: number; sourceAirport: SingleAirport}
// class it.rattly.flights.trips.Icon
export interface Icon {code: string; css: string}
// class it.rattly.flights.trips.Trip
export interface Trip {bookUrls: Array<BookUrl>; hops: Array<Flight>; lengthOfStay: number; totalPrice: number}