package cloud.eppo.example

import cloud.eppo.example.quickjs.QuickJSContext


fun main() {
  val osArch = System.getProperty("os.arch")
  println("Operating System Architecture: $osArch")
  System.load("/Users/felipecsl/prj/quickjs-poc-jvm/native/libs/arm64/libeppojs.so")
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
  context.evaluate("console.log(1 + 2);")
  println("All set!")
}
