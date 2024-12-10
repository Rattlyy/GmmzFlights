import {renderToReadableStream} from 'react-dom/server'
import {StaticRouter} from "react-router-dom/server";
import {AppRoutes, Shell} from "@/App.tsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function render(_url: string, bundleName: string, javaStream: any) {
    const stream = await renderToReadableStream(
        <Shell>
            <StaticRouter location={_url}>
                <AppRoutes/>
            </StaticRouter>
        </Shell>, {
            bootstrapModules: [bundleName]
        }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await stream.pipeTo(new WritableStream<any>({
        write(chunk) {
            javaStream['write(byte[])'](chunk)
        }
    }))
}

// @ts-expect-error lollone
window.renderFunc = render