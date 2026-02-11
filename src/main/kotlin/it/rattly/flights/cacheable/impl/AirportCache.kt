package it.rattly.flights.cacheable.impl

import it.rattly.flights.cacheable.ItemCache
import fuel.httpGet
import klite.Server
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import org.graalvm.polyglot.Context
import org.graalvm.polyglot.Source

class AirportCache(server: Server) : ItemCache<SingleAirport>("airports", SingleAirport::class, server) {
    suspend fun code(code: String) = all().find { it.code == code }

    override suspend fun all() = super.all()

    override suspend fun getFromSOT() = withContext(Dispatchers.IO) {
        var data = "https://static2.azair.us/www-azair-eu-assets/js/airports_array.js".httpGet().body.string()

        data += """\n\n
        function setArray(javaString) {
            javaString = JSON.stringify(airportsArray);
        }

        window['setArray'] = setArray;
        """

        val ctx = Context.newBuilder("js").allowAllAccess(true).allowExperimentalOptions(true).build()
        ctx.eval("js", data)
        var airports = "";
        ctx.eval("js", "window").invokeMember("setArray", airports);

        
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