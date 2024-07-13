import Dashboard from "@/components/dashboard";
import {getAirports, getIcons} from "@/lib/api";

export default async function Home() {
    let airports = await getAirports()
    let icons = await getIcons()

    return (
        <Dashboard airports={airports} icons={icons} />
    );
}


