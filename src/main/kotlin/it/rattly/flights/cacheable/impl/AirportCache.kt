package it.rattly.flights.cacheable.impl

import it.rattly.flights.cacheable.ItemCache
import fuel.httpGet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

class AirportCache : ItemCache<SingleAirport>("airports", SingleAirport::class) {
    suspend fun code(code: String) = all().find { it.code == code }

    override suspend fun all() = super.all()

    override suspend fun getFromSOT() = withContext(Dispatchers.IO) {
        "https://static2.azair.us/www-azair-eu-assets/js/airports_array.js"
            .httpGet().body.string()
            .split("var airportsArray = ")[1]
            .split(";")[0]
            .replace("{", "").replace("}", "")
            .replace("\"", "")
            .replace(" ", "")
            .replace(",", "")
            .split("\n")
            .filterNot { it.isBlank() }
            .map { it.split(":") }
            .map { SingleAirport(it[1].replace("(", " ("), it[0]) }
            .sortedBy { it.toString() }
    }
}

@Serializable
@Suppress("DEPRECATION")
data class SingleAirport(
    val name: String,
    val code: String,
) {
    override fun toString() =
        "${name.capitalize()} [${code}]"
}