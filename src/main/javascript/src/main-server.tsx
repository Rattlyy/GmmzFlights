import {StrictMode} from 'react'
import {renderToString} from 'react-dom/server'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StaticRouter} from "react-router-dom/server";
import {App} from "@/App.tsx";

function render(_url: string) {
    return renderToString(
        <StrictMode>
            <QueryClientProvider client={new QueryClient()}>
                <StaticRouter location={_url}>
                    <App />
                </StaticRouter>
            </QueryClientProvider>
        </StrictMode>,
    )
}

// @ts-expect-error lollone
window.renderFunc = render