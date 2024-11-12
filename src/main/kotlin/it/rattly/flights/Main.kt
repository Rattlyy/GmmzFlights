package it.rattly.flights

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
import kotlin.properties.Delegates
import kotlin.reflect.full.primaryConstructor
import org.redisson.config.Config as RedissonConfig

lateinit var redisson: RedissonReactiveClient

suspend fun main() {
    Config.useEnvFile()
    redisson = Redisson.create(RedissonConfig().apply {
        useSingleServer().address = "redis://localhost:6379"
    }).reactive()

    /**
     * TODO: fix company name is id and not name in skrape
     * TODO: order, filter, refresh
     * TODO: fix arrival and departure shouldn't be time but the date lol
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

        context("/api") {
            useOnly<JsonBody>()

            annotated<TripRoutes>()
            annotated<CacheRoutes>()

            openApi()
        }
    }.start()
}

fun Server.converters() {
    Converter.use<List<String>> {
        it.split(",")
    }

    Converter.use<LocalDate> {
        LocalDate.parse(it.run { if (it.contains("T")) it.split("T")[0] else it }, LocalDate.Formats.ISO)
    }
}