package it.rattly.flights

import it.rattly.flights.cacheable.impl.SingleAirport
import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable
import kotlin.math.roundToInt

@Serializable
data class Icon(val code: String, val css: String)

@Serializable
@Suppress("DEPRECATION")
data class AirportQuery(
    val name: String,
    val code: String,
    val additionals: List<String> = emptyList(),
) {
    override fun toString() =
        "${name.capitalize()} [${code}]" + (if (additionals.isNotEmpty()) " (+${additionals.joinToString(",")})" else "")
}

@Serializable
data class Trip(
    val hops: List<Flight>,
    val lengthOfStay: Int,
    val totalPrice: Int = hops.sumOf { it.price }.roundToInt(),
    val bookUrls: List<BookUrl>
)

@Serializable
data class BookUrl(
    val name: String, val urls: List<String>
)

@Serializable
data class Flight(
    val sourceAirport: SingleAirport,
    val destinationAirport: SingleAirport,
    val departureTime: String,
    val arrivalTime: String,
    val date: String,
    val duration: String,
    val price: Double,
    val company: String,
    val companyIata: String,
    val cheapSeats: String
) {
    //fun iconCss() = runBlocking { IconCache.all() }.find { it.code == companyIata }?.css ?: ""
}

val PLACEHOLDER_TRIP = Trip(
    hops = mutableListOf<Flight>().apply {
        repeat(3) {
            add(
                Flight(
                    date = "2023-01-01",
                    sourceAirport = SingleAirport("Anywhere", "XXX"),
                    destinationAirport = SingleAirport("Anywhere", "XXX"),
                    departureTime = "10:00",
                    arrivalTime = "10:00",
                    duration = "1",
                    price = 1.00,
                    company = "Ryanair",
                    companyIata = "FR",
                    cheapSeats = "1"
                )
            )
        }
    },

    bookUrls = listOf(
        BookUrl("test", listOf("https://example.com")),
        BookUrl("test", listOf("https://example.com")),
        BookUrl("test", listOf("https://example.com")),
        BookUrl("test", listOf("https://example.com")),
        BookUrl("test", listOf("https://example.com")),
    ),

    lengthOfStay = 1
)