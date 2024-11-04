import com.ryandens.jlink.tasks.JlinkJreTask
import java.io.ByteArrayOutputStream

plugins {
    kotlin("jvm") version "2.0.20"
    kotlin("plugin.serialization") version "2.0.20"

    id("co.uzzu.dotenv.gradle") version "4.0.0"
    id("com.google.cloud.tools.jib") version "3.3.1"
    id("com.ryandens.jlink-jib") version "0.4.1"
    id("com.ryandens.temurin-binaries-repository") version "0.4.1"
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

val jdk by configurations.creating {
    isCanBeResolved = true
    isCanBeConsumed = false
    isVisible = false
}

val copyJdks = tasks.register<Copy>("copyJdks") {
    from(provider {tarTree(jdk.singleFile)})
    into(project.layout.buildDirectory.dir("jdks"))
}

dependencies {
    val kliteVersion = "1.6.9"
    implementation("com.github.codeborne.klite:klite-server:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jdbc:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jackson:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-json:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jobs:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-openapi:$kliteVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-rx2:1.9.0")

    implementation("com.github.kittinunf.fuel:fuel:2.+")
    implementation("org.redisson:redisson:3.32.0")
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.0-RC.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:+")

    implementation("org.apache.httpcomponents:httpclient:4.5.14")
    implementation("com.github.kittinunf.fuel:fuel:3.0.0-alpha03")
    implementation("com.fleeksoft.ksoup:ksoup-lite:0.1.9")

    jdk("temurin19-binaries:OpenJDK19U-jdk_aarch64_linux_hotspot_19.0.2_7:jdk-19.0.2+7@tar.gz")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

application {
    mainClass.set("it.rattly.flights.MainKt")
}

jlinkJre {
    compress = 2
    noHeaderFiles = true
    noManPages = true
    stripDebug = true
    modules = setOf(
        "java.base",
        "jdk.httpserver",
        "java.sql",
        "java.net.http",
        "jdk.crypto.ec",
        "java.naming",
        "java.management"
    )
}

jib {
    from {
        image = "gcr.io/distroless/java-base-debian11:nonroot-arm64"
        platforms {
            platform { os = "linux"; architecture = "arm64" }
        }
    }

    to {
        image = "ghcr.io/Rattlyy/FlightsLooker:latest"
        auth {
            username = env.REGISTRY_USERNAME.value
            password = env.REGISTRY_PASSWORD.value
        }
    }

    container {
        jvmFlags = listOf("-Xss256K", "-XX:MaxRAMPercentage=80", "-XX:+ExitOnOutOfMemoryError")
        ports = listOf("8080:8080")
    }
}

tasks.register<JavaExec>("types.ts") {
    dependsOn("classes")
    mainClass.set("klite.json.TSGenerator")
    classpath = sourceSets.main.get().runtimeClasspath
    args("${layout.buildDirectory.get()}/classes/kotlin/main")
    standardOutput = ByteArrayOutputStream()
    doLast {
        layout.projectDirectory.file("src/main/javascript/src/api/types.ts").asFile.writeText(standardOutput.toString())
    }
}

idea {
    module {
        isDownloadSources = true
        isDownloadJavadoc = true
    }
}