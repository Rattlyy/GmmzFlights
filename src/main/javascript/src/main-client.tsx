import {hydrateRoot} from 'react-dom/client'
import "@/index.css"
import {AppRoutes, Shell} from "@/App.tsx";
import {BrowserRouter} from "react-router-dom";
import {ErrorBoundary} from "react-error-boundary";

// noinspection RequiredAttributes
hydrateRoot(document.getElementById('root')!,
    <Shell>
        <ErrorBoundary fallbackRender={({error}) => <div className={"flex flex-col w-full h-full text-center items-center justify-center"}>
            <h1 className={"text-4xl text-center text-red-500"}>An error occurred</h1>
            <p className={"text-center text-red-500"}>{error.message}</p>
        </div>}>
            <BrowserRouter>
                <AppRoutes/>
            </BrowserRouter>
        </ErrorBoundary>
    </Shell>
)