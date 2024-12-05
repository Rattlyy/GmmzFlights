package it.rattly.flights

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.module.kotlin.convertValue
import fuel.httpGet
import it.rattly.flights.cacheable.CacheRoutes
import it.rattly.flights.cacheable.impl.AirportCache
import it.rattly.flights.cacheable.impl.IconCache
import it.rattly.flights.modules.jwt
import it.rattly.flights.modules.ssr
import it.rattly.flights.trips.TripRoutes
import it.rattly.flights.trips.TripService
import it.rattly.flights.users.UsersRepository
import klite.*
import klite.annotations.annotated
import klite.jackson.JsonBody
import klite.jackson.kliteJsonMapper
import klite.jdbc.DBMigrator
import klite.jdbc.DBModule
import klite.jdbc.RequestTransactionHandler
import klite.openapi.openApi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalDate
import kotlinx.datetime.format
import org.redisson.Redisson
import java.nio.charset.Charset
import java.nio.file.Path
import kotlin.io.encoding.ExperimentalEncodingApi
import kotlin.reflect.full.primaryConstructor
import org.redisson.config.Config as RedissonConfig

lateinit var server: Server
val redisson = Redisson.create(RedissonConfig().apply {
    Config.useEnvFile()
    useSingleServer().address = Config["REDIS_ADDRESS"]
})

val jackson = kliteJsonMapper {
    addModule(SimpleModule("instant").addSerializer(
        object : JsonSerializer<LocalDate>() {
            override fun handledType() = LocalDate::class.java
            override fun serialize(value: LocalDate, gen: JsonGenerator, serializers: SerializerProvider) {
                gen.writeString(value.format(LocalDate.Formats.ISO))
            }
        }
    ))
}

/**
 * TODO: scrape next pages + pagination, asset versioning
 */
@OptIn(ExperimentalEncodingApi::class)
fun main() = Server(
    requestIdGenerator = XRequestIdGenerator(),
    httpExchangeCreator = XForwardedHttpExchange::class.primaryConstructor!!
).apply {
    converters()
    use<DBModule>()
    use<DBMigrator>()
    use<RequestTransactionHandler>()
    use(JsonBody(jackson))

    register(this)
    register<AirportCache>()
    register<IconCache>()
    register<TripService>()
    register<UsersRepository>()

    // Bot TG
    CoroutineScope(Dispatchers.Default + SupervisorJob()).launch {
        if(!Config.isDev) bot.handleUpdates()
    }

    before<CorsHandler>()

    val testSSR = true
    if (Config.isDev && !testSSR)
        assets("/", AssetsHandler(Path.of("src/main/resources/public")))
    else ssr()

    jwt()
    context("/bookUrls") {
        get {
            val path = this.queryParams["url"]?.base64Decode()?.toString(Charset.defaultCharset()) ?: error("gay")

            require(path.contains("book/b.php")) { "gay" }

            "https://www.azair.eu/$path".httpGet().body.byteStream()
                .transferTo(startResponse(StatusCode.OK, contentType = "text/html"))
            null
        }
    }

    context("/api") {
        useOnly<JsonBody>()

        annotated<TripRoutes>()
        annotated<CacheRoutes>()

        openApi()
    }
}.run { this.start(); server = this }

fun converters() {
    Converter.use<List<String>> {
        it.split(",")
    }

    Converter.use<LocalDate> {
        LocalDate.parse(it.run { if (it.contains("T")) it.split("T")[0] else it }, LocalDate.Formats.ISO)
    }
}