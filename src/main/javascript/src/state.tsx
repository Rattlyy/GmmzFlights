import type {} from '@redux-devtools/extension'
import {create} from "zustand";
import {Trip} from "./api/types.ts";
import {devtools} from "zustand/middleware";

interface FlightsStore {
    flights: Trip[] | null;
    isLoading: boolean
    setFlights: (trips: Trip[] | null) => void
    setIsLoading: (isLoading: boolean) => void
}

interface DisplayStore {
    order: string | null
    filter: string | null
    setFilter: (filter: string) => void
    setOrder: (filter: string) => void
}

export const useDisplayStore = create<DisplayStore>()(devtools(
    (set) => ({
        order: null,
        filter: null,
        setFilter: filter => set({filter: filter}),
        setOrder: order => set({order: order})
    })
))

export const useFlightsStore = create<FlightsStore>()(devtools(
    (set) => ({
        flights: null,
        isLoading: false,
        setFlights: trips => set({flights: trips}),
        setIsLoading: isLoading => set({isLoading: isLoading})
    })
))