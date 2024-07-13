import java.io.ByteArrayOutputStream

plugins {
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.serialization") version "2.0.0"
    id("idea")
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
    val kliteVersion = "master-SNAPSHOT"
    implementation("com.github.codeborne.klite:klite-server:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jdbc:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jackson:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-json:$kliteVersion")
    implementation("com.github.codeborne.klite:klite-jobs:$kliteVersion")

    implementation("it.skrape:skrapeit:1.3.0-alpha.2")
    implementation("com.github.kittinunf.fuel:fuel:2.+")
    implementation("org.redisson:redisson:3.32.0")
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.0-RC.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:+")

    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
}

tasks.register<JavaExec>("types.ts") {
    dependsOn("classes")
    mainClass.set("klite.json.TSGenerator")
    classpath = sourceSets.main.get().runtimeClasspath
    args("${layout.buildDirectory.get()}/classes/kotlin/main")
    standardOutput = ByteArrayOutputStream()
    doLast {
        layout.projectDirectory.file("src/main/javascript/lib/types.ts").asFile.writeText(standardOutput.toString())
    }
}

idea {
    module {
        isDownloadSources = true
        isDownloadJavadoc = true
    }
}

tasks.test {
    useJUnitPlatform()
}