package it.rattly.flights.modules

import klite.AssetsHandler
import klite.Config
import klite.Server
import klite.StatusCode
import klite.isDev
import org.graalvm.polyglot.Context
import org.graalvm.polyglot.Source
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
            Path.of("${if (Config.isDev) "./src/main/javascript/" else "/web/"}node_modules").toAbsolutePath()
                .toString()
        )
        .allowAllAccess(true)
        .allowExperimentalOptions(true).build()

    @Language("JavaScript")
    val polyfillContents = """
        var process = {
            env: {
                NODE_DEBUG: false
            }
        }
        
        var TextEncoder = require("text-encoding").TextEncoder
        var TextDecoder = require("text-encoding").TextDecoder
        var ReadableStream = require("web-streams-polyfill").ReadableStream;
        var WritableStream = require("web-streams-polyfill").WritableStream;
        var Buffer = require('buffer/').Buffer
        var URL = require('url').Url
        var window = this;
        var global = {};
        var SecureRandom = Java.type('java.security.SecureRandom');
        var crypto = {
            getRandomValues: (buf) => {
                var bytes = SecureRandom.getSeed(buf.length);
                buf.set(bytes);
            }
        }
        
        function fetch(resource, options) {}
        function fetch(resource) {}
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

    val bundleName = File(if (Config.isDev) "./src/main/javascript/dist/assets" else "/web/assets")
        .list()
        .first { it.startsWith("index") && it.endsWith("js") }

    context("/") {
        get(".*") {
            val response = startResponse(StatusCode.OK, contentType = "text/html")
            ctx.eval("js", "window").invokeMember("renderFunc", path, "/assets/$bundleName", response)
                .invokeMember("then")
        };
    }

    assets("/assets", AssetsHandler(Path.of(if (Config.isDev) "./src/main/javascript/dist" else "/web")))
}