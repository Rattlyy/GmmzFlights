package cacheable

import cacheable.impl.AirportCache
import cacheable.impl.IconCache
import klite.annotations.GET

class CacheRoutes(private val airportCache: AirportCache, private val iconCache: IconCache) {
    @GET("/airports")
    suspend fun airports() = airportCache.all()

    @GET("/icons")
    suspend fun icons() = iconCache.all()
}