import java.io.ByteArrayOutputStream

plugins {
    kotlin("jvm") version "2.0.21"
    kotlin("plugin.serialization") version "2.0.21"

    id("co.uzzu.dotenv.gradle") version "4.0.0"
    id("com.google.cloud.tools.jib") version "3.3.1"
    id("com.google.devtools.ksp") version "2.0.21-1.0.28"
    id("eu.vendeli.telegram-bot") version "7.5.0"
    id("idea")
    application
}

group = "it.rattly"
version = "1.0-SNAPSHOT"

repositories {
    mavenLocal()
    mavenCentral()
    maven("https://oss.sonatype.org/content/repositories/snapshots/")
    maven("https://jitpack.io")
}

dependencies {
    val kliteVersion = "master-SNAPSHOT"//"1.6.9"
    implementation("com.github.codeborne.klite:klite-server:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jdbc:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jackson:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-json:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jobs:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-openapi:$kliteVersion")

    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.0-RC.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:+")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-rx2:1.9.0")

    implementation("org.redisson:redisson:3.32.0")
    implementation("org.apache.httpcomponents:httpclient:4.5.14")
    implementation("com.github.kittinunf.fuel:fuel:3.0.0-alpha03")
    implementation("com.nimbusds:nimbus-jose-jwt:9.47")
    implementation("com.fleeksoft.ksoup:ksoup-lite:0.1.9")
    implementation("org.postgresql:postgresql:42.7.4")
    implementation("org.graalvm.js:js:24.1.1")
    implementation("org.graalvm.polyglot:polyglot:24.1.1")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

application {
    mainClass.set("it.rattly.flights.MainKt")
}

tasks.register<Exec>("runViteBuild") {
    workingDir = layout.projectDirectory.dir("src/main/javascript").asFile
    commandLine = listOf("bun", "run", "--bun", "build:all")
}

tasks.jib.get().dependsOn("runViteBuild")

jib {
    from {
        image = "ghcr.io/graalvm/jdk-community:23"

        platforms {
            platform { os = "linux"; architecture = "arm64" }
        }

        extraDirectories {
            paths {
                path {
                    setFrom("src/main/javascript/dist")
                    into = "/web"
                }

                path {
                    setFrom("src/main/javascript/dist-server")
                    into = "/web"
                }

                path {
                    setFrom("src/main/javascript/node_modules/text-encoding")
                    into = "/web/node_modules/text-encoding"
                }

                path {
                    setFrom("src/main/resources/public")
                    into = "/web"
                }
            }
        }
    }

    to {
        image = "ghcr.io/rattlyy/gmmzflights:latest"
        auth {
            username = env.REGISTRY_USERNAME.value
            password = env.REGISTRY_PASSWORD.value
        }
    }

    container {
        mainClass = "it.rattly.flights.MainKt"
        jvmFlags = listOf("-Xss2m", "-XX:MaxRAMPercentage=80", "-XX:+ExitOnOutOfMemoryError")
    }
}

tasks.register<JavaExec>("types.ts") {
    dependsOn("classes")
    mainClass.set("klite.json.TSGenerator")
    classpath = sourceSets.main.get().runtimeClasspath
    args("${layout.buildDirectory.get()}/classes/kotlin/main")
    standardOutput = ByteArrayOutputStream()
    println(sourceSets.main.get().runtimeClasspath.forEach { println(it) })
    doLast {
        layout.projectDirectory.file("src/main/javascript/src/api/types.ts").asFile.writeText(standardOutput.toString())
    }
}

tasks.register<Exec>("generateBunStuff") {
    dependsOn("types.ts")
    workingDir(layout.projectDirectory.dir("src/main/javascript"))
    commandLine("bun", "run", "openapi", "&&", "bun", "run", "zod")
}

idea {
    module {
        isDownloadSources = true
        isDownloadJavadoc = true
    }
}