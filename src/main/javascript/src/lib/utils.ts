import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {Options} from "react-lottie";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function baseUrl(str: string) {
    return (import.meta.env.DEV ? "http://localhost:5173/" : "https://flights.gmmz.dev/") + str
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lottieOptions(data: any) {
    return {
        loop: true,
        autoplay: true,
        animationData: data,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    } as Options
}