package it.rattly.flights.trips

import com.fleeksoft.ksoup.Ksoup
import com.fleeksoft.ksoup.nodes.Element
import fuel.httpGet
import it.rattly.flights.trips.AirportQuery
import it.rattly.flights.trips.BookUrl
import it.rattly.flights.trips.Flight
import it.rattly.flights.trips.Trip
import it.rattly.flights.cacheable.impl.AirportCache
import klite.NotFoundException
import klite.base64Encode
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.format
import kotlinx.datetime.format.DateTimeFormatBuilder
import kotlinx.datetime.format.char
import org.apache.http.client.utils.URIBuilder
import kotlin.math.pow
import kotlin.math.roundToInt

//TODO: Rivedere in generale il codice perchè fa oggettivamente schifo

class TripService(private val airportCache: AirportCache) {
    suspend fun fetchTrips(
        sourceAirports: AirportQuery = AirportQuery("Bari", "BRI", listOf("BDS")),
        destinationAirports: AirportQuery = AirportQuery("Anywhere", "XXX"),
        adults: Int,
        children: Int,
        infants: Int,
        startDate: LocalDate,
        endDate: LocalDate,
        direct: Boolean,
    ) = runCatching {
        Ksoup.parse(
            buildURL(
                sourceAirports, destinationAirports, adults, children, infants, startDate, endDate, direct
            ).httpGet().body.string()
        ).let { document ->
            // scraped from azair's website, idk how it works but it works
            // coded at 3 am and I never want to touch this code again
            document.select("#reslist").first()?.children()?.filter { it.classNames().contains("result") }
                ?.map { res ->
                    Trip(
                        hops = scrapeFlights(res, airportCache),
                        lengthOfStay = 212,
                        bookUrls = res.select("a").mapNotNull { it ->
                            BookUrl(
                                (it.attribute("onclick") ?: return@mapNotNull null).value
                                    .replace("trackBook('", "")
                                    .replace("')", "")
                                    .replace(",'", ",")
                                    .split("',")
                                    .filter { it.toIntOrNull() == null }
                                    .mapNotNull { airportCache.code(it) }
                                    .joinToString(" -> "),
                                it.attributes().mapNotNull { it.value }.filter { it.contains("book/") }.map {
                                    "/bookUrls?url=" + it.base64Encode()
                                }
                            )
                        }.filterNot { it.urls.isEmpty() }.distinct()
                    )
                } ?: throw NotFoundException("")
        }
    }
}

suspend fun scrapeFlights(res: Element, airportCache: AirportCache) =
    res.select(".detail").map { detail ->
        val date = res.select(".date").map { it.text() }
        var pIndex = -1
        detail.select("p").mapNotNull { p -> // hack da rivedere che manco mi ricordo perchè ho fatto
            if (pIndex != 1) pIndex += 1

            val from = p.select(".from").first() ?: return@mapNotNull null
            val to = p.select(".to").first()?: return@mapNotNull null
            val sourceAirportName = from.select(".code").first()?.text()?.take(3) ?: return@mapNotNull null
            val destinationAirportName = to.select(".code").first()?.text()?.take(3) ?: return@mapNotNull null
            val departureTime = from.text().split(" ")[1]
            val arrivalTime = to.text().split(" ")[0]

            val airline = p.select(".airline").first()?: return@mapNotNull null
            val company = airline.text()
            val iata = airline.classNames().last().replace("iata", "")
            val price = p.select(".legPrice").first()?.text()?.replace("€", "")?.toDouble()?.round(2) ?: return@mapNotNull null

            val format = LocalDate.Format {
                dayOfMonth() ; char('/'); monthNumber(); char('/'); yearTwoDigits(2000)
            }

            Flight(
                date = format.parse(date[pIndex].split(" ")[1]),
                sourceAirport = airportCache.code(sourceAirportName)!!,
                destinationAirport = airportCache.code(destinationAirportName)!!,
                departureTime = departureTime,
                arrivalTime = arrivalTime,
                price = price,
                company = company.upperFirst(),
                companyIata = iata,
                cheapSeats = detail.select(".waiting").first()!!.text(),
                duration = "bho da fare" //TODO: durcha
            )
        }
    }.flatten()

private fun String.upperFirst() = this.replaceFirstChar { it.uppercaseChar() }

private fun buildURL(
    sourceAirport: AirportQuery = AirportQuery("Bari", "BRI", listOf("BDS")),
    destinationAirport: AirportQuery = AirportQuery("Anywhere", "XXX"),
    adults: Int,
    children: Int,
    infants: Int,
    startDate: LocalDate,
    endDate: LocalDate,
    direct: Boolean
): String {
    println("new query : $sourceAirport, $destinationAirport")
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
        addParameter(
            "depdate", //"$day.$month.$yearNew"
            startDate.format(LocalDate.Format { dayOfMonth(); char('.'); monthNumber(); char('.'); year() })
        )
        addParameter(
            "arrdate", //"$day.$month.$yearNew"
            endDate.format(LocalDate.Format { dayOfMonth(); char('.'); monthNumber(); char('.'); year() })
        )
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

fun Double.round(digits: Int): Double {
    return (this * 10.0.pow(digits)).roundToInt() / 10.0.pow(digits)
}