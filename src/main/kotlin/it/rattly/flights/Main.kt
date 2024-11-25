package it.rattly.flights

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.module.SimpleModule
import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.jwk.source.JWKSourceBuilder
import com.nimbusds.jose.proc.BadJOSEException
import com.nimbusds.jose.proc.DefaultJOSEObjectTypeVerifier
import com.nimbusds.jose.proc.JWSVerificationKeySelector
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.JWTClaimNames
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier
import com.nimbusds.jwt.proc.DefaultJWTProcessor
import fuel.httpGet
import io.swagger.v3.oas.annotations.enums.ParameterIn
import it.rattly.flights.cacheable.CacheRoutes
import it.rattly.flights.cacheable.impl.AirportCache
import it.rattly.flights.cacheable.impl.IconCache
import it.rattly.flights.trips.TripRoutes
import it.rattly.flights.trips.TripService
import klite.*
import klite.annotations.annotated
import klite.jackson.JsonBody
import klite.jackson.kliteJsonMapper
import klite.jdbc.DBMigrator
import klite.jdbc.DBModule
import klite.openapi.openApi
import kotlinx.datetime.LocalDate
import org.redisson.Redisson
import org.redisson.api.RedissonReactiveClient
import java.net.URI
import java.nio.charset.Charset
import java.nio.file.Path
import java.text.ParseException
import kotlin.io.encoding.ExperimentalEncodingApi
import kotlin.reflect.full.primaryConstructor
import org.redisson.config.Config as RedissonConfig

lateinit var redisson: RedissonReactiveClient

@OptIn(ExperimentalEncodingApi::class)
suspend fun main() {
    Config.useEnvFile()
    redisson = Redisson.create(RedissonConfig().apply {
        useSingleServer().address = Config["REDIS_ADDRESS"]
    }).reactive()

    /**
     * TODO: scrape next pages + pagination, asset versioning
     */

    Server(
        requestIdGenerator = XRequestIdGenerator(),
        httpExchangeCreator = XForwardedHttpExchange::class.primaryConstructor!!
    ).apply {
        //TODO: hotfix, wait for fix
        val jackson = kliteJsonMapper {
            this.addModules(SimpleModule(
                "enum hotfix"
            ).addSerializer<ParameterIn>(ParameterIn::class.java,
                object : JsonSerializer<ParameterIn>() {
                    override fun serialize(
                        value: ParameterIn,
                        gen: JsonGenerator,
                        serializers: SerializerProvider
                    ) {
                        gen.writeString(value.toString().lowercase())
                    }
                }
            ))
        }

        converters()
        use<DBModule>()
        use<DBMigrator>()
        use(JsonBody(jackson))

        register(AirportCache().also { it.init(this) })
        register(IconCache().also { it.init(this) })
        register(TripService(require<AirportCache>()))

        before<CorsHandler>()

        assets("/", AssetsHandler(Path.of("/web"), useIndexForUnknownPaths = true))
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

        val processor = DefaultJWTProcessor<SecurityContext>().apply {
            jwsTypeVerifier = DefaultJOSEObjectTypeVerifier(JOSEObjectType.JWT)
            jwsKeySelector = JWSVerificationKeySelector(
                JWSAlgorithm.ES384,
                JWKSourceBuilder.create<SecurityContext>(URI("https://auth.gmmz.dev/oidc/jwks").toURL())
                    .retrying(true)
                    .build()
            )

            jwtClaimsSetVerifier = DefaultJWTClaimsVerifier(
                JWTClaimsSet.Builder().issuer("https://auth.gmmz.dev/oidc").audience("https://flights.gmmz.dev/private").build(),
                setOf(
                    JWTClaimNames.SUBJECT,
                    JWTClaimNames.ISSUED_AT,
                    JWTClaimNames.EXPIRATION_TIME,
                    JWTClaimNames.AUDIENCE
                )
            )
        }


        context("/private") {
            before {
                val token = (it.header("Authentication") ?: throw StatusCodeException(
                    StatusCode.Forbidden,
                    "No Authentication header specified"
                )).replace("Bearer ", "")


                it.attr(
                    "jwt",

                    try {
                        processor.process(token, null).toPayload()
                    } catch (e: Exception) {
                        if (e is ParseException || e is BadJOSEException) {
                            throw StatusCodeException(StatusCode.Forbidden, "Invalid JWT.")
                        } else {
                            throw e;
                        }
                    }
                )
            }

            get("/") {
                return@get attr("jwt")
            }
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