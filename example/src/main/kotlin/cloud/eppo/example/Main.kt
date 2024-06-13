package cloud.eppo.example

import cloud.eppo.example.quickjs.JSCallFunction
import cloud.eppo.example.quickjs.JSFunction
import cloud.eppo.example.quickjs.QuickJSContext
import cloud.eppo.example.quickjs.QuickJSContext.DefaultModuleLoader
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit


fun main() {
  val osArch = System.getProperty("os.arch")
  println("OS Architecture: $osArch")
  NativeLibraryLoader.loadLibrary("libeppojs.so")
  val context: QuickJSContext = QuickJSContext.create()
  context.moduleLoader = object : DefaultModuleLoader() {
    override fun getModuleStringCode(moduleName: String): String {
      println("Loading module: $moduleName")
      return ""
    }
  }
  context.setProperty(context.globalObject, "setTimeout", JSCallFunction { args ->
    val argFunc = args[0] as JSFunction
    val delay = args[1] as Long
    val executor = Executors.newSingleThreadScheduledExecutor()
    val task = Runnable {
      context.call(argFunc, argFunc.objPointer, context.globalObject)
    }
    executor.schedule(task, delay, TimeUnit.MILLISECONDS)
    null
  })

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
  val eppoBundle = Main::class.java.getResourceAsStream("/index.mjs")?.bufferedReader()?.readText()
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
      console.log("sdk initialized");
      const eppoClient = eppoSdk.getInstance();
      const variation = eppoClient.getStringAssignment(
        "llama3_vs_gpt4o",
        "subject-key",
        {},
        "fooBar",
      );
      console.log("variation: " + variation);
    }).catch((error) => {
      console.error("sdk failed to initialize", error);
    })
  """.trimIndent()
  if (eppoBundle != null) {
    val code = context.compileModule("$eppoBundle\n$script")
    context.execute(code)
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
