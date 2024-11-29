package it.rattly.flights.cacheable.impl

import it.rattly.flights.cacheable.ItemCache
import fuel.httpGet
import klite.Server
import kotlinx.serialization.Serializable

class IconCache(server: Server) : ItemCache<Icon>("icons", Icon::class, server) {
    override suspend fun getFromSOT() =
        "https://static6.azair.us/www-azair-eu-assets/css/airlines.css".httpGet()
            .body.string()
            .replace(" ", "")
            .replace("}", "")
            .split(".iata")
            .toMutableList().apply { removeFirst() }
            .associate { it.split("{").let { it[0] to it[1] } }
            .map { Icon(it.key, it.value.replace("background-image:", "").removeSuffix(";\n")) }
}

@Serializable
data class Icon(val code: String, val css: String)