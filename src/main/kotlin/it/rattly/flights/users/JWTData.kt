package it.rattly.flights.users

import com.fasterxml.jackson.annotation.JsonProperty

data class JWTData(
    @JsonProperty("email")
    val email: String?,
    @JsonProperty("email_verified")
    val emailVerified: Boolean?,
    @JsonProperty("name")
    val name: String?,
    @JsonProperty("phone_number")
    val phoneNumber: String? = null,
    @JsonProperty("phone_number_verified")
    val phoneNumberVerified: Boolean?,
    @JsonProperty("picture")
    val picture: String?,
    @JsonProperty("sub")
    val sub: String,
    @JsonProperty("username")
    val username: String? = null
)