package it.rattly.flights.cacheable

import it.rattly.flights.redisson
import klite.Server
import klite.jobs.JobRunner
import klite.jobs.NamedJob
import kotlinx.coroutines.reactive.awaitSingle
import org.redisson.api.RListReactive
import java.time.LocalTime
import kotlin.reflect.KClass

abstract class ItemCache<T : Any>(private val name: String, private val classT: KClass<T>, private val server: Server) {
    private var cache: RListReactive<T> = redisson.reactive().getList(name)

    init {
        server.use<JobRunner>().apply {
            NamedJob(name, allowParallelRun = true) {
                cache.delete().awaitSingle()
                cache.addAll(getFromSOT()).awaitSingle()
            }.also {
                runOnce(it)
                scheduleDaily(it, LocalTime.MIDNIGHT)
            }
        }
    }

    abstract suspend fun getFromSOT(): List<T>

    open suspend fun all(): List<T> = cache.readAll().awaitSingle()
}