package cloud.eppo.example

import cloud.eppo.example.quickjs.QuickJSContext

fun main() {
  val osArch = System.getProperty("os.arch")
  println("OS Architecture: $osArch")
  NativeLibraryLoader.loadLibrary("libeppojs.so")
  val context: QuickJSContext = QuickJSContext.create()
  val console = object : QuickJSContext.Console {
    override fun log(message: String) {
      println("console.log: $message")
    }

    override fun info(message: String?) {
      println("console.info: $message")
    }

    override fun warn(message: String?) {
      println("console.warn: $message")
    }

    override fun error(message: String?) {
      println("console.error: $message")
    }
  }
  context.setConsole(console)
  val eppoBundle = Main::class.java.getResourceAsStream("/index.js")?.bufferedReader()?.readText()
  val script = """
    const assignmentLogger = {
      logAssignment(assignment) {
        console.log({
          userId: assignment.subject,
          event: "Eppo Randomized Assignment",
          type: "track",
          properties: { ...assignment },
        });
      },
    };
    eppoSdk.init({
      apiKey: "$sdkKey",
      assignmentLogger,
    }).then(() => {
      const eppoClient = eppoSdk.getInstance();
      const variation = eppoClient.getStringAssignment(
        "llama3_vs_gpt4o",
        "subject-key",
        {},
        "fooBar",
      );
      console.log("variation: " + variation);
    });
  """.trimIndent()
  if (eppoBundle != null) {
    context.evaluate("$eppoBundle\n$script")
  } else {
    throw RuntimeException("Failed to load script")
  }
  println("All set!")
}

class Main {
  companion object {
    @JvmStatic
    fun main(args: Array<String>) {
      main()
    }
  }
}
