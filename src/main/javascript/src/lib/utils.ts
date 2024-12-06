import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function baseUrl(str: string) {
    return (import.meta.env.DEV ? "http://localhost:5173/" : "https://flights.gmmz.dev/") + str
}