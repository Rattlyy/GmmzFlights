@file:OptIn(ExperimentalUuidApi::class)

package it.rattly.flights

import eu.vendeli.tgbot.TelegramBot
import eu.vendeli.tgbot.annotations.CommandHandler
import eu.vendeli.tgbot.api.message.message
import eu.vendeli.tgbot.types.ParseMode
import eu.vendeli.tgbot.types.User
import eu.vendeli.tgbot.types.internal.MessageUpdate
import it.rattly.flights.users.UsersRepository
import klite.Config
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

val bot = TelegramBot(Config["TG_BOT_TOKEN"])

@CommandHandler(["/start"])
suspend fun startCommand(user: User, bot: TelegramBot, msg: MessageUpdate) {
    val usersRepository = server.require(UsersRepository::class)

    usersRepository.save(
        usersRepository[
            usersRepository.tgCodeCache[Uuid.parse(msg.text.replace("/start ", ""))] ?: run {
                message("To access this bot, register on https://flights.gmmz.dev/ and link your account.")
                    .send(user, bot)

                return
            }
        ]?.also { it.tgId = user.id } ?: run {
            message("Invalid code sent. Please try again.").send(user, bot)
            return
        }
    )

    message("Hello <b>${user.firstName}</b>!\nYou can configure your price notifications in the web app.")
        .options { parseMode = ParseMode.HTML }
        .send(user, bot)
}