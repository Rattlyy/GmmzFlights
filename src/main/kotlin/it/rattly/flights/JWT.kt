package it.rattly.flights

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
import it.rattly.flights.users.JWTData
import it.rattly.flights.users.UserRoutes
import klite.Server
import klite.StatusCode
import klite.StatusCodeException
import klite.annotations.annotated
import klite.jackson.JsonBody
import klite.openapi.openApi
import java.net.URI
import java.text.ParseException

val processor = DefaultJWTProcessor<SecurityContext>().apply {
    jwsTypeVerifier = DefaultJOSEObjectTypeVerifier(JOSEObjectType("at+jwt"), JOSEObjectType.JWT)
    jwsKeySelector = JWSVerificationKeySelector(
        JWSAlgorithm.ES384,
        JWKSourceBuilder.create<SecurityContext>(URI("https://auth.gmmz.dev/oidc/jwks").toURL())
            .retrying(true)
            .build()
    )

    jwtClaimsSetVerifier = DefaultJWTClaimsVerifier(
        JWTClaimsSet.Builder()
            .issuer("https://auth.gmmz.dev/oidc")
            .audience("https://flights.gmmz.dev/private")
            .build(),

        setOf(
            JWTClaimNames.SUBJECT,
            JWTClaimNames.ISSUED_AT,
            JWTClaimNames.EXPIRATION_TIME,
            JWTClaimNames.AUDIENCE
        )
    )
}

fun Server.jwt() {
    context("/private") {
        useOnly<JsonBody>()
        openApi()
        before {
            val token = (it.header("Authentication") ?: throw StatusCodeException(
                StatusCode.Forbidden,
                "No Authentication header specified"
            )).replace("Bearer ", "")


            it.attr(
                "jwt",

                try {
                    jackson.convertValue<JWTData>(
                        processor.process(token, null).toJSONObject(),
                        JWTData::class.java
                    )
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

        annotated<UserRoutes>()
    }
}