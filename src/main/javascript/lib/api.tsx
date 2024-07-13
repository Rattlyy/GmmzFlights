import {Airport, Icon, Trip} from "@/lib/types";

export interface GetFlightsParams {
    departureAirports: Airport[],
    destinationAirports: Airport[],
    adults: number,
    childrenState: number,
    infants: number,
    startDate: Date,
    endDate: Date,
    direct: boolean,
}

export async function getFlights(data: GetFlightsParams) {
    return process.env.NODE_ENV == "development" ? await api<Trip[]>(
        `http://localhost:8080/api/flights?sourceAirports=${data.departureAirports.map(e => e.id).join(",")}&destinationAirports=${data.destinationAirports.map(e => e.id).join(",")}&adults=1&children=${data.childrenState}&infants=${data.infants}&startDate=${data.startDate.toISOString()}&endDate=${data.endDate.toISOString()}&direct=${data.direct}`
    ) : api<Trip[]>(`http://localhost:8080/api/mockFlights`)
}

export async function getIcons() {
    return await api<Icon[]>(`http://localhost:8080/api/icons`)
}

export async function getAirports() {
    return await api<Airport[]>(`http://localhost:8080/api/airports`)
}

async function api<T>(url: string): Promise<T> {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                return Promise.reject({status: response.status, statusText: response.statusText})
            }

            return response.json() as Promise<T>
        })
}