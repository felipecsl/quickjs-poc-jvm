package cloud.eppo.example

import cloud.eppo.example.quickjs.QuickJSContext


fun main() {
  val osArch = System.getProperty("os.arch")
  println("Operating System Architecture: $osArch")
  System.load("/Users/felipecsl/prj/eppo-jvm-example/native/libs/arm64/libeppojs.dylib")
  val context: QuickJSContext = QuickJSContext.create()
  context.evaluate("console.log(1 + 2);")
  val console = object : QuickJSContext.Console {
    override fun log(message: String) {
      println("log: $message")
    }

    override fun info(message: String?) {
      println("info: $message")
    }

    override fun warn(message: String?) {
      println("warn: $message")
    }

    override fun error(message: String?) {
      println("error: $message")
    }
  }
  context.setConsole(console)
  println("Hello World!")
}
