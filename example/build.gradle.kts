import java.net.URI

plugins {
  kotlin("jvm") version "1.9.23"
  id("com.github.johnrengelman.shadow") version("8.1.1")
  application
}

group = "cloud.eppo"
version = "1.0-SNAPSHOT"

application {
  mainClass.set("cloud.eppo.example.MainKt")
}

repositories {
  mavenCentral()
  mavenLocal()
  maven { url = URI("https://s01.oss.sonatype.org/content/repositories/snapshots/") }
}

dependencies {
  testImplementation(kotlin("test"))
}

tasks.test {
  useJUnitPlatform()
}
kotlin {
  jvmToolchain(8)
}
