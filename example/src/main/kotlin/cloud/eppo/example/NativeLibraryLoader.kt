package cloud.eppo.example

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption

object NativeLibraryLoader {
  @Throws(Exception::class)
  fun loadLibrary(libName: String) {
    val temp = extractLibrary(libName)
    System.load(temp.toString())
  }

  @Throws(Exception::class)
  private fun extractLibrary(libPath: String): Path {
    val temp = Files.createTempFile("lib", null)
    NativeLibraryLoader::class.java.getResourceAsStream("/native/$libPath").use { n ->
      if (n != null) {
        Files.copy(n, temp, StandardCopyOption.REPLACE_EXISTING)
      } else {
        throw Exception("Library not found: $libPath")
      }
    }
    temp.toFile().deleteOnExit()
    return temp
  }
}
