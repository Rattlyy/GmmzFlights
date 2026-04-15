package it.rattly.flights.cacheable.impl

import it.rattly.flights.cacheable.ItemCache
import fuel.httpGet
import klite.Server
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

class AirportCache(server: Server) : ItemCache<SingleAirport>("airports", SingleAirport::class, server) {
    suspend fun code(code: String) = all().find { it.code == code }

    override suspend fun all() = super.all()

    override suspend fun getFromSOT() = withContext(Dispatchers.IO) {
        val data = "https://static2.azair.us/www-azair-eu-assets/js/airports_array.js".httpGet().body.string()

        val codeThenName = Regex("""['"]([A-Za-z0-9]{3,4})['"]\s*[:=,\]]\s*['"]([^'"]+)['"]""")
            .findAll(data)
            .map { match ->
                val (code, name) = match.destructured
                SingleAirport(name.trim(), code.trim().uppercase())
            }
            .toList()

        val nameThenCode = Regex("""\[\s*['"]([^'"]+)['"]\s*,\s*['"]([A-Za-z0-9]{3,4})['"]""")
            .findAll(data)
            .map { match ->
                val (name, code) = match.destructured
                SingleAirport(name.trim(), code.trim().uppercase())
            }

        (codeThenName + nameThenCode).distinctBy { it.code }
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
