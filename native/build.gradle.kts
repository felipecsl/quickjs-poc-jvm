import org.gradle.nativeplatform.internal.DefaultTargetMachineFactory

plugins {
  `cpp-library`
}

library {
  baseName.set("eppo-js")
  source.from(file("cpp"))
  source.from(file("quickjs"))
  linkage = listOf(Linkage.STATIC, Linkage.SHARED)
  targetMachines = listOf(machines.linux.x86_64,
    machines.windows.x86, machines.windows.x86_64,
    machines.macOS.x86_64)
  tasks.withType<CppCompile> {
    // C sources had to be defined here for some reason.
    source.from(fileTree("cpp") {
      include("*.cpp")
    })

    // Add jni include paths.
    var javaHome = System.getProperty("java.home") ?: throw GradleException("java.home not found")
    if (javaHome.endsWith("/jre")) {
      javaHome = javaHome.substring(0, javaHome.length - 4)
    }
    if (javaHome.endsWith("/")) {
      javaHome = javaHome.substring(0, javaHome.length - 1)
    }
    includes("$javaHome/include")
    val os = (machines as DefaultTargetMachineFactory).host().operatingSystemFamily
    if (os.isLinux) {
      includes("$javaHome/include/linux")
    } else if (os.isWindows) {
      includes("$javaHome/include/win32")
    } else if (os.isMacOs) {
      includes("$javaHome/include/darwin")
    } else {
      throw GradleException("unsupported OS: $os")
    }

    compilerArgs.addAll(
      listOf(
        "-std=c++11",
        "-L${projectDir}/libs"
      )
    )
  }

  tasks.withType<LinkExecutable> {
    linkerArgs.addAll("quickjs/libquickjs.a", "-lquickjs")
  }
}
