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
  val script = """
    function add(a, b) {
      return a + b;
    }
    function sub(a, b) {
      return a - b;
    }
    class EppoCalculator {
      constructor() {
      }
      add(a, b) {
        return add(a, b);
      }
      sub(a, b) {
        return sub(a, b);
      }
    }
    const calc = new EppoCalculator();
    console.log(calc.sub(calc.add(10, 25), 5));
  """.trimIndent()
  context.evaluate(script)
  println("All set!")
}
