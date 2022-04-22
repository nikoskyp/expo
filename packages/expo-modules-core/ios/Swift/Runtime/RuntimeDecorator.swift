// Copyright 2022-present 650 Industries. All rights reserved.

internal struct RuntimeDecorator {
  let runtime: JavaScriptRuntime

  internal func decorate(object: JavaScriptObject, withRef ref: JavaScriptObject) {
//    object.setProperty("__ref__", ref)
  }
}
