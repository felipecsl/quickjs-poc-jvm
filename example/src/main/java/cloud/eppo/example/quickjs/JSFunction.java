package cloud.eppo.example.quickjs;

public class JSFunction extends JSObject {

  public long getObjPointer() {
    return objPointer;
  }

  private final long objPointer;

  public JSFunction(QuickJSContext context, long objPointer, long pointer) {
    super(context, pointer);
    this.objPointer = objPointer;
  }

  public Object call(Object... args) {
    return getContext().call(this, objPointer, args);
  }

}
