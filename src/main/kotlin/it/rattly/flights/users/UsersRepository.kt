package it.rattly.flights.users

import it.rattly.flights.redisson
import klite.jdbc.BaseCrudRepository
import klite.jdbc.BaseEntity
import klite.jdbc.UpdatableEntity
import org.redisson.api.options.LocalCachedMapOptions
import java.math.BigInteger
import java.time.Instant
import javax.sql.DataSource
import kotlin.time.Duration.Companion.minutes
import kotlin.time.toJavaDuration
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

class UsersRepository(db: DataSource) : BaseCrudRepository<User, String>(db, "users") {
    val usersCache = redisson.getLocalCachedMap<String, User>(LocalCachedMapOptions.name<String, User>("users"))
    val tgCodeCache = redisson.getLocalCachedMap<Uuid, String>(
        LocalCachedMapOptions
            .name<Uuid, String>("telegram_queue")
            .timeToLive(10.minutes.toJavaDuration())
    )

    operator fun get(id: String) = getNull(id, false)
    fun getNull(id: String, forUpdate: Boolean) =
        try {
            usersCache[id] ?: super.get(id, forUpdate).also { usersCache.put(id, it) }
        } catch (_: NoSuchElementException) {
            null
        }

    override fun save(entity: User): Int {
        usersCache.put(entity.id, entity)
        return super.save(entity)
    }
}

data class User(
    override var id: String,
    var tgId: Long?,
    var createdAt: Instant = Instant.now(),
    override var updatedAt: Instant? = null,
) : BaseEntity<String>, UpdatableEntity
