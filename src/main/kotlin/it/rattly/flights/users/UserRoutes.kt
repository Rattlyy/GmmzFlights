@file:OptIn(ExperimentalUuidApi::class)

package it.rattly.flights.users

import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.security.SecurityScheme
import it.rattly.flights.Response
import klite.annotations.AttrParam
import klite.annotations.DELETE
import klite.annotations.GET
import klite.jdbc.upsert
import klite.toValues
import java.time.Instant
import javax.sql.DataSource
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@Suppress("Unused")
class UserRoutes(private val db: DataSource, private val usersRepository: UsersRepository) {
    @GET("/telegram/code")
    fun telegramCode(@Parameter(hidden = true) @AttrParam jwt: JWTData): Response<String> {
        val user = User(id = jwt.sub, tgId = null, updatedAt = Instant.now())

        return if (db.upsert("users", user.toValues()) >= 1) {
            usersRepository.usersCache[jwt.sub] =  user
            val id = Uuid.random()
            usersRepository.tgCodeCache[id] = jwt.sub

            Response.Success(id.toString())
        } else Response.Error("No user saved")
    }

    @DELETE("/telegram")
    fun telegramId(@Parameter(hidden = true) @AttrParam jwt: JWTData) =
        usersRepository[jwt.sub]?.let {Response.Success(it.tgId) } ?: Response.Error("No user saved")
}