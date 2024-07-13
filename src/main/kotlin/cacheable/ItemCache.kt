package cacheable

import klite.Server
import klite.jobs.JobRunner
import klite.jobs.NamedJob
import org.redisson.api.RList
import redisson
import java.util.concurrent.TimeUnit
import kotlin.reflect.KClass
import kotlinx.coroutines.future.await as c

abstract class ItemCache<T : Any>(private val name: String, private val classT: KClass<T>) {
    private var currentlyFetching = false
    private lateinit var cache: RList<T>

    suspend fun init(server: Server) {
        cache = redisson.getList(name)
        server.use<JobRunner>().apply {
            this.schedule(NamedJob(name) {
                cache.deleteAsync().c()
                cache.addAllAsync(getFromSOT()).c()
            }, delay = 0, period = 15, TimeUnit.MINUTES)
        }
    }

    abstract suspend fun getFromSOT(): List<T>

    open suspend fun all(): List<T> = cache.readAllAsync().c()
}