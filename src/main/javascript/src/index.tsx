import src from "./index.css?inline"

export function Index({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <script defer data-domain="flights.gmmz.dev" src="https://plausible.gmmz.dev/js/script.js"></script>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta name="description" content="gmmz.dev - flights, the flight tracker price aggregator from the future"/>
            <title>gmmz.dev - flights</title>

            <link rel="apple-touch-icon" sizes="180x180"
                  href="https://corsproxy.io/?https://gmmz.dev/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32"
                  href="https://corsproxy.io/?https://gmmz.dev/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16"
                  href="https://corsproxy.io/?https://gmmz.dev/favicon-16x16.png"/>
            <link rel="mask-icon" href="https://corsproxy.io/?https://gmmz.dev/safari-pinned-tab.svg"
                  color="#5bbad5"/>
            <link rel="stylesheet" href={"data:text/css;base64," + Buffer.from(src).toString('base64')}/>
        </head>

        <body>
        <div id="root" className={"dark font-sans"}>{children}</div>
        </body>
        </html>
    )
}