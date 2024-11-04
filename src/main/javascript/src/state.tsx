import type {} from '@redux-devtools/extension'
import {create} from "zustand";
import {SearchResult} from "./api/types.ts";
import {devtools} from "zustand/middleware";

interface FlightsStore {
    flights: SearchResult | null;
    setFlights: (trips: SearchResult) => void
}

export const useFlightsStore = create<FlightsStore>()(devtools(
    (set) => ({
        flights: null,
        setFlights: trips => set({flights: trips})
    })
))