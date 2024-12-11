import {renderToReadableStream} from 'react-dom/server'
import {StaticRouter} from "react-router-dom/server";
import {AppRoutes, Shell} from "@/App.tsx";
import {Index} from "@/index.tsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function render(_url: string, bundleName: string, javaStream: any) {
    const stream = await renderToReadableStream(
        <Index>
            <Shell>
                <StaticRouter location={_url}>
                    <AppRoutes/>
                </StaticRouter>
            </Shell>
        </Index>, {
            bootstrapModules: [bundleName]
        }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await stream.pipeTo(new WritableStream<any>({
        write(chunk) {
            javaStream.write(chunk)
        }
    }))
}

// @ts-expect-error lollone
window.renderFunc = render