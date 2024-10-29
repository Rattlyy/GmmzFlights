package trips

import cacheable.impl.IconCache
import cacheable.impl.AIRPORT_ANYWHERE
import cacheable.impl.Airport
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.Serializable
import kotlin.math.pow
import kotlin.math.roundToInt

@Serializable
data class Trip(
    val flights: List<Flight>,
    val lengthOfStay: Int,
    val totalPrice: Double = flights.sumOf { it.price }.round(2),
    val bookUrls: Map<List<String>, String>
)

@Serializable
data class Flight(
    val sourceAirport: Airport,
    val destinationAirport: Airport,
    val departureTime: String,
    val arrivalTime: String,
    val date: String,
    //val duration: String,
    val price: Double,
    val company: String,
    val companyIata: String,
    val cheapSeats: String
)

val PLACEHOLDER_TRIP = Trip(
    flights = listOf(
        Flight(
            date = "2023-01-01",
            sourceAirport = AIRPORT_ANYWHERE,
            destinationAirport = AIRPORT_ANYWHERE,
            departureTime = "10:00",
            arrivalTime = "10:00",
            //duration = "1",
            price = 1.00,
            company = "Ryanair",
            companyIata = "FR",
            cheapSeats = "1",
        ),

        Flight(
            date = "2023-01-01",
            sourceAirport = AIRPORT_ANYWHERE,
            destinationAirport = AIRPORT_ANYWHERE,
            departureTime = "10:00",
            arrivalTime = "10:00",
            //duration = "1",
            price = 1.00,
            company = "Ryanair",
            companyIata = "FR",
            cheapSeats = "1"
        ),
    ),

    bookUrls = mapOf(
        listOf("test") to "https://example.com",
        listOf("test") to "https://example.com",
        listOf("test") to "https://example.com",
        listOf("test") to "https://example.com",
    ),

    lengthOfStay = 1
)