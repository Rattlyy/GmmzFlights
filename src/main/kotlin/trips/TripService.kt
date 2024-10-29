package trips

import cacheable.impl.AIRPORT_ANYWHERE
import cacheable.impl.Airport
import cacheable.impl.AirportCache
import cacheable.impl.IconCache
import it.skrape.core.document
import it.skrape.fetcher.AsyncFetcher
import it.skrape.fetcher.response
import it.skrape.fetcher.skrape
import kotlinx.datetime.LocalDate
import kotlinx.datetime.format
import kotlinx.datetime.format.char
import org.htmlunit.org.apache.http.client.utils.URIBuilder
import kotlin.math.pow
import kotlin.math.roundToInt

class TripService(private val airportCache: AirportCache) {
    suspend fun fetchTrips(
        sourceAirport: Airport = Airport("Bari", "BRI", listOf("BDS")),
        destinationAirport: Airport = Airport("Anywhere", "XXX"),
        adults: Int,
        children: Int,
        infants: Int,
        startDate: LocalDate,
        endDate: LocalDate,
        direct: Boolean,
    ) = skrape(AsyncFetcher /* uses coroutines */) {
        request {
            url = buildURL(sourceAirport, destinationAirport, adults, children, infants, startDate, endDate, direct)
            timeout = 60 * 1000
        }

        response {
            val list = mutableListOf<Trip>()

//            if (devMode) {
//                CoroutineScope(Dispatchers.IO).launch {
//                    File("scraped.html").writeText(document.toString())
//                }
//            }

            // scraped from azair's website, idk how it works but it works
            document.findAll("#reslist").first().children.filter { it.classNames.contains("result") }
                .forEach { res ->
                    val flights = mutableListOf<Flight>()
                    val date = res.findAll(".date").map { it.ownText }
                    res.findAll(".detail").forEach { detail ->
                        var pIndex = -1
                        detail.findAll("p").forEach { p ->
                            if (pIndex != 1) pIndex += 1

                            val from = p.findFirst(".from")
                            val to = p.findFirst(".to")
                            val sourceAirportName = from.findFirst(".code").ownText
                            val destinationAirportName = to.findFirst(".code").ownText
                            val departureTime = from.ownText.split(" ").run {
                                if (this.size <= 3) this[1] else this[0]
                            }
                            val arrivalTime = to.ownText.split(" ").run {
                                if (this.size <= 3) this[1] else this[0]
                            }
                            val airline = p.findFirst(".airline").classNames.last().replace("iata", "")
                            val price = p.findFirst(".legPrice").ownText.replace("€", "").toDouble().round(2)

                            flights.add(
                                Flight(
                                    date = date[pIndex],
                                    sourceAirport = airportCache.code(sourceAirportName) ?: AIRPORT_ANYWHERE,
                                    destinationAirport = airportCache.code(destinationAirportName) ?: AIRPORT_ANYWHERE,
                                    departureTime = departureTime,
                                    arrivalTime = arrivalTime,
                                    price = price,
                                    company = airline,
                                    companyIata = airline,
                                    cheapSeats = detail.findFirst(".waiting").ownText
                                )
                            )
                        }
                    }

                    try {
                        list.add(
                            Trip(
                                flights = flights,
                                lengthOfStay = 212,
                                bookUrls = res.findAll("a").map { it ->
                                    it.eachHref.filter { it.contains("book") } to (
                                            it.attributes["onclick"]
                                                ?.replace("trackBook('", "")
                                                ?.replace("')", "")
                                                ?.replace(",'", ",")
                                                ?.split("',")
                                                ?.filter { it.toIntOrNull() == null }
                                                ?.mapNotNull { airportCache.code(it) }
                                                ?.joinToString(" -> ")
                                                ?: ""
                                            )
                                }.filterNot { it.first.isEmpty() }.distinct().toMap()
                            )
                        )
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            return@response list
        }
    }

    private fun buildURL(
        sourceAirport: Airport = Airport("Bari", "BRI", listOf("BDS")),
        destinationAirport: Airport = Airport("Anywhere", "XXX"),
        adults: Int,
        children: Int,
        infants: Int,
        startDate: LocalDate,
        endDate: LocalDate,
        direct: Boolean
    ): String {
        return URIBuilder(
        ).apply {
            host = "www.azair.eu"
            scheme = "https"
            
            // scraped from azair's website, idk how it works but it works
            path = "azfin.php"
            addParameter("tp", "0")
            addParameter("searchtype", "flexi")
            addParameter("srcAirport", sourceAirport.toString())
            addParameter("srcTypedText", sourceAirport.code.lowercase())
            addParameter("srcFreeTypedText", "")
            addParameter("srcMC", "")

            sourceAirport.additionals.forEachIndexed { index, value ->
                addParameter("srcap$index", value)
            }

            addParameter("srcFreeAirport", "")
            addParameter("dstAirport", destinationAirport.toString())
            addParameter("dstTypedText", destinationAirport.code.lowercase())
            addParameter("dstFreeTypedText", "")
            addParameter("dstMC", "")

            sourceAirport.additionals.forEachIndexed { index, value ->
                addParameter("dstap$index", value)
            }

            addParameter("adults", "$adults")
            addParameter("children", "$children")
            addParameter("infants", "$infants")
            addParameter("minHourStay", "0:45")
            addParameter("maxHourStay", "23:20")
            addParameter("minHourOutbound", "0:00")
            addParameter("maxHourOutbound", "24:00")
            addParameter("minHourInbound", "0:00")
            addParameter("maxHourInbound", "24:00")
            addParameter("depdate", //"$day.$month.$yearNew"
                startDate.format(LocalDate.Format { dayOfMonth(); char('.'); monthNumber(); char('.'); year() }))
            addParameter("arrdate", //"$day.$month.$yearNew"
                endDate.format(LocalDate.Format { dayOfMonth(); char('.'); monthNumber(); char('.'); year() }))
            addParameter("minDaysStay", "1")
            addParameter("maxDaysStay", "14")
            addParameter("nextday", "0")
            addParameter("autoprice", "true")
            addParameter("currency", "EUR")
            addParameter("wizzxclub", "false")
            addParameter("flyoneclub", "false")
            addParameter("blueairbenefits", "false")
            addParameter("megavolotea", "false")
            addParameter("schengen", "false")
            addParameter("transfer", "false")
            addParameter("samedep", "true")
            addParameter("samearr", "true")
            addParameter("dep0", "true")
            addParameter("dep1", "true")
            addParameter("dep2", "true")
            addParameter("dep3", "true")
            addParameter("dep4", "true")
            addParameter("dep5", "true")
            addParameter("dep6", "true")
            addParameter("arr0", "true")
            addParameter("arr1", "true")
            addParameter("arr2", "true")
            addParameter("arr3", "true")
            addParameter("arr4", "true")
            addParameter("arr5", "true")
            addParameter("arr6", "true")
            addParameter("maxChng", if (direct) "0" else "5")
            addParameter("isOneway", "return")
            addParameter("resultSubmit", "Search")
        }.build().toString()
    }
}

fun Double.round(digits: Int): Double {
    return (this * 10.0.pow(digits)).roundToInt() / 10.0.pow(digits)
}