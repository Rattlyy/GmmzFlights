package it.rattly.flights.trips

import fuel.httpGet
import it.rattly.flights.Response
import it.rattly.flights.trips.AirportQuery
import it.rattly.flights.trips.PLACEHOLDER_TRIP
import it.rattly.flights.trips.Trip
import it.rattly.flights.cacheable.impl.AirportCache
import it.rattly.flights.cacheable.impl.SingleAirport
import it.rattly.flights.redisson
import klite.annotations.GET
import klite.annotations.QueryParam
import klite.base64Decode
import kotlinx.coroutines.delay
import kotlinx.coroutines.reactive.awaitSingle
import kotlinx.datetime.LocalDate
import org.redisson.api.RLocalCachedMapReactive
import org.redisson.api.options.LocalCachedMapOptions.name
import java.nio.charset.Charset
import kotlin.time.Duration.Companion.minutes
import kotlin.time.toJavaDuration

@Suppress("unused")
class TripRoutes(private val tripService: TripService, private val airportCache: AirportCache) {
    private val cache: RLocalCachedMapReactive<Int, List<Trip>> = redisson.reactive().getLocalCachedMap(
        name<Int, List<Trip>>("trips").maxIdle(10.minutes.toJavaDuration())
    )

    @GET("/mockFlights")
    suspend fun mockFlights(): MutableList<Trip> {
        delay(1000)
        return mutableListOf<Trip>().apply {
            repeat(10) {
                add(PLACEHOLDER_TRIP)
            }
        }
    }

    @GET("/flights")
    suspend fun flights(
        @QueryParam("sourceAirports") sourceAirportCodes: List<String>,
        @QueryParam("destinationAirports") destinationAirportCodes: List<String>,
        @QueryParam("adults") adults: Int,
        @QueryParam("children") children: Int,
        @QueryParam("infants") infants: Int,
        @QueryParam("startDate") startDate: LocalDate,
        @QueryParam("endDate") endDate: LocalDate,
        @QueryParam("everywhere") everywhere: Boolean = false,
        @QueryParam("direct") direct: Boolean = false,
    ): Response<List<Trip>> {
        require(startDate < endDate) { "Start date must be before end date." }
        require(adults >= 0) { "Adults must be a positive number." }
        require(children >= 0) { "Children must be a positive number." }
        require(infants >= 0) { "Infants must be a positive number." }
        require(adults + children + infants != 0) { "You must have atleast one passenger." }

        val sourceAirports = sourceAirportCodes.map {
            airportCache.code(it) ?: throw IllegalArgumentException("Cannot find airport $it")
        }

        val destinationAirports =
            if (everywhere) listOf(SingleAirport("Everywhere", "XXX")) else destinationAirportCodes.map {
                airportCache.code(it) ?: throw IllegalArgumentException("Cannot find airport $it")
            }

        val cacheKey = listOf(
            sourceAirportCodes,
            destinationAirportCodes,
            adults,
            children,
            infants,
            startDate,
            endDate,
            everywhere,
            direct
        ).sumOf { it.hashCode() }

        return if (cache.containsKey(cacheKey).awaitSingle())
            Response.Success(cache.get(cacheKey).awaitSingle().also { println("[$cacheKey] HIT") })
        else tripService.fetchTrips(
            AirportQuery(
                sourceAirports.first().name,
                sourceAirports.first().code,
                sourceAirports.takeLast(sourceAirports.size - 1).map { it.code }
            ),

            AirportQuery(
                destinationAirports.first().name,
                destinationAirports.first().code,
                destinationAirports.takeLast(sourceAirports.size - 1).map { it.code }
            ),

            adults,
            children,
            infants,
            startDate,
            endDate,
            direct
        ).fold(
            onSuccess = { println("[$cacheKey] MISS"); cache.put(cacheKey, it).subscribe(); Response.Success(it) },
            onFailure = { throw it }
        ) //TODO: handle nothing found
    }
}