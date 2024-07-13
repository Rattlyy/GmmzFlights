package trips

import cacheable.impl.Airport
import cacheable.impl.AirportCache
import com.sun.net.httpserver.HttpExchange
import klite.annotations.GET
import klite.annotations.QueryParam
import klite.queryParams
import kotlinx.datetime.LocalDate

@Suppress("unused")
class TripRoutes(private val tripService: TripService, private val airportCache: AirportCache) {
    @GET("/mockFlights")
    fun mockFlights() = mutableListOf<Trip>().apply {
        repeat(10) {
            add(PLACEHOLDER_TRIP)
        }
    }

    @GET("/flights")
    suspend fun flights(
        @QueryParam("sourceAirports") sourceAirports: List<Airport>,
        @QueryParam("destinationAirports") destinationAirports: List<Airport>,
        @QueryParam("adults") adults: Int,
        @QueryParam("children") children: Int,
        @QueryParam("infants") infants: Int,
        @QueryParam("startDate") startDate: LocalDate,
        @QueryParam("endDate") endDate: LocalDate,
        @QueryParam("direct") direct: Boolean = false,
    ): MutableList<Trip> {
        require(startDate < endDate) { "Start date must be before end date." }
        require(adults >= 0) { "Adults must be a positive number." }
        require(children >= 0) { "Children must be a positive number." }
        require(infants >= 0) { "Infants must be a positive number." }
        require(adults + children + infants != 0) { "You must have atleast one passenger." }

        require(sourceAirports.isNotEmpty()) { "Couldn't find any source airports" }
        require(destinationAirports.isNotEmpty()) { "Couldn't find any destination airports" }

        return tripService.fetchTrips(
            Airport(
                sourceAirports.first().name,
                sourceAirports.first().code,
                sourceAirports.takeLast(sourceAirports.size - 1).map { it.code }
            ),

            Airport(
                destinationAirports.first().name,
                destinationAirports.first().code,
                destinationAirports.takeLast(destinationAirports.size - 1).map { it.code }
            ),

            adults,
            children,
            infants,
            startDate,
            endDate,
            direct
        )
    }
}