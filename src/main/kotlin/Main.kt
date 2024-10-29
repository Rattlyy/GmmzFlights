import cacheable.CacheRoutes
import cacheable.impl.Airport
import cacheable.impl.AirportCache
import cacheable.impl.IconCache
import klite.*
import klite.annotations.annotated
import klite.jackson.JsonBody
import klite.jdbc.DBModule
import kotlinx.coroutines.runBlocking
import kotlinx.datetime.LocalDate
import org.redisson.Redisson
import org.redisson.api.RedissonClient
import trips.TripRoutes
import trips.TripService
import kotlin.reflect.full.primaryConstructor
import org.redisson.config.Config as RedissonConfig

lateinit var redisson: RedissonClient

suspend fun main() {
    Config.useEnvFile()
    redisson = Redisson.create(RedissonConfig().apply {
        useSingleServer().address = "redis://localhost:6379"
    })

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
        }
    }.start()
}

fun Server.converters() {
    Converter.use<List<Airport>> {
        //todo: remove runBlocking
        val cache = runBlocking { require<AirportCache>().all() }

        it.toIntOrNull()?.let {
            return@use cache.find { entry -> entry.id == it }?.let { listOf(it) } ?: emptyList()
        }

        if (!it.contains(",")) return@use emptyList()

        it.split(",").mapNotNull { id ->
            cache.find { entry ->
                entry.id == (id.toIntOrNull() ?: 0)
            }
        }
    }

    Converter.use<LocalDate> {
        LocalDate.parse(it.run { if (it.contains("T")) it.split("T")[0] else it }, LocalDate.Formats.ISO)
    }
}