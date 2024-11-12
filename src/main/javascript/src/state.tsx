import type {} from '@redux-devtools/extension'
import {create} from "zustand";
import {SearchResult} from "./api/types.ts";
import {devtools} from "zustand/middleware";

interface FlightsStore {
    flights: SearchResult | null;
    isLoading: boolean
    setFlights: (trips: SearchResult) => void
    setIsLoading: (isLoading: boolean) => void
}

export const useFlightsStore = create<FlightsStore>()(devtools(
    (set) => ({
        flights: null,
        isLoading: false,
        setFlights: trips => set({flights: trips}),
        setIsLoading: isLoading => set({isLoading: isLoading})
    })
))