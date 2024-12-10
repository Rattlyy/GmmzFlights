import {hydrateRoot} from 'react-dom/client'
import "@/index.css"
import {AppRoutes, Shell} from "@/App.tsx";
import {BrowserRouter} from "react-router-dom";

hydrateRoot(document.getElementById('root')!,
    <Shell>
        <BrowserRouter>
            <AppRoutes/>
        </BrowserRouter>
    </Shell>
)