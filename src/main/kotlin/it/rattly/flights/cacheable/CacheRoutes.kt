package it.rattly.flights.cacheable

import it.rattly.flights.cacheable.impl.AirportCache
import it.rattly.flights.cacheable.impl.IconCache
import klite.annotations.GET

class CacheRoutes(private val airportCache: AirportCache, private val iconCache: IconCache) {
    @GET("/airports")
    suspend fun airports() = airportCache.all()

    @GET("/icons")
    suspend fun icons() = iconCache.all()
}