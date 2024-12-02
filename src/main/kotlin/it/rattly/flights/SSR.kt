package it.rattly.flights

import klite.AssetsHandler
import klite.Config
import klite.Server
import klite.StatusCode
import klite.isDev
import org.graalvm.polyglot.Context
import org.graalvm.polyglot.HostAccess
import org.graalvm.polyglot.Source
import org.graalvm.polyglot.io.IOAccess
import org.intellij.lang.annotations.Language
import java.io.File
import java.nio.file.Path

fun Server.ssr() {
    val ctx = Context
        .newBuilder("js")
        .option("js.esm-eval-returns-exports", "true")
        .option("js.commonjs-require", "true")
        .option(
            "js.commonjs-require-cwd",
            Path.of("${if (Config.isDev) "./src/main/javascript/" else "/web/"}node_modules").toAbsolutePath().toString()
        )
        .allowAllAccess(true)
        .allowIO(IOAccess.ALL)
        .allowHostAccess(HostAccess.ALL)
        .allowExperimentalOptions(true).build()

    @Language("JavaScript")
    val polyfillContents = """
            var TextEncoder = require("text-encoding").TextEncoder
            var TextDecoder = require("text-encoding").TextDecoder
            var window = this;
            var SecureRandom = Java.type('java.security.SecureRandom');
            var crypto = {
                getRandomValues: (buf) => {
                    var bytes = SecureRandom.getSeed(buf.length);
                    buf.set(bytes);
                }
            }

            var process = {
                env: {
                    NODE_DEBUG: false
                }
            }
            
            function setTimeout(callback,delay) {}
        """

    ctx.eval("js", polyfillContents)
    ctx.eval(
        Source.newBuilder(
            "js",

            Path.of("${if (Config.isDev) "./src/main/javascript/dist-server/" else "/web/"}bundle.js")
                .toAbsolutePath()
                .toUri().toURL()

        ).mimeType("application/javascript+module").build()
    )

    val rendered = ctx.eval("js", "window.renderFunc('/')").toString()
    val file = File(if (Config.isDev) "./src/main/javascript/dist/index.html" else "/web/index.html")
        .readLines()
        .joinToString("").replace(
            "<div id=\"root\"></div>",
            "<div id=\"root\" class=\"dark\">${rendered}</div>"
        )

    decorator { it, next ->
        if (it.path != "/") {
            return@decorator next(it)
        }

        it.send(StatusCode.OK, file, "text/html")
    }

    assets("/", AssetsHandler(Path.of("./src/main/javascript/dist")))
}