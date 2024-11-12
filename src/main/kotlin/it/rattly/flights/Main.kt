package it.rattly.flights

import fuel.httpGet
import it.rattly.flights.cacheable.CacheRoutes
import it.rattly.flights.cacheable.impl.AirportCache
import it.rattly.flights.cacheable.impl.IconCache
import it.rattly.flights.trips.TripRoutes
import it.rattly.flights.trips.TripService
import klite.*
import klite.annotations.annotated
import klite.jackson.JsonBody
import klite.jdbc.DBModule
import klite.openapi.openApi
import kotlinx.datetime.LocalDate
import org.redisson.Redisson
import org.redisson.api.RedissonReactiveClient
import java.nio.charset.Charset
import java.nio.file.Path
import kotlin.reflect.full.primaryConstructor
import org.redisson.config.Config as RedissonConfig

lateinit var redisson: RedissonReactiveClient

suspend fun main() {
    Config.useEnvFile()
    redisson = Redisson.create(RedissonConfig().apply {
        useSingleServer().address = Config["REDIS_ADDRESS"]
    }).reactive()

    /**
     * TODO: order, filter, refresh
     */

    Server(
        requestIdGenerator = XRequestIdGenerator(),
        httpExchangeCreator = XForwardedHttpExchange::class.primaryConstructor!!
    ).apply {
        converters()
        use<DBModule>()
        use<JsonBody>()

        register(AirportCache().also { it.init(this) })
        register(IconCache().also { it.init(this) })
        register(TripService(require<AirportCache>()))

        before<CorsHandler>()

        assets("/", AssetsHandler(Path.of("/web"), useIndexForUnknownPaths = true))
        context("/bookUrls") {
            get {
                val path = this.queryParams["url"]?.base64Decode()?.toString(Charset.defaultCharset()) ?: error("gay")

                require(path.contains("book/b.php")) { "gay" }

                "https://www.azair.eu/$path".httpGet().body.byteStream().transferTo(startResponse(StatusCode.OK, contentType = "text/html"))
                null
            }
        }

        context("/api") {
            useOnly<JsonBody>()

            annotated<TripRoutes>()
            annotated<CacheRoutes>()

            openApi()
        }
    }.start()
}

fun converters() {
    Converter.use<List<String>> {
        it.split(",")
    }

    Converter.use<LocalDate> {
        LocalDate.parse(it.run { if (it.contains("T")) it.split("T")[0] else it }, LocalDate.Formats.ISO)
    }
}