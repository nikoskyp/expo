// Copyright 2022-present 650 Industries. All rights reserved.

public typealias SharedObjectId = Int
internal typealias SharedObjectPair = (native: SharedObject, javaScript: JavaScriptWeakObject)

let sharedObjectIdPropertyName = "__expo_shared_object_id__"

public final class SharedObjectRegistry {
  private static var nextId: SharedObjectId = 1
  internal static var pairs = [SharedObjectId: SharedObjectPair]()

  internal static var size: Int {
    return pairs.count
  }

  internal static func pullNextId() -> SharedObjectId {
    let id = nextId
    nextId += 1
    return id
  }

  internal static func get(_ id: SharedObjectId) -> SharedObjectPair? {
    return pairs[id]
  }

  @discardableResult
  internal static func put(_ pair: SharedObjectPair) -> SharedObjectId {
    let id = pullNextId()
    pairs[id] = pair
    return id
  }

  internal static func delete(_ id: SharedObjectId) {
    pairs[id] = nil
  }

  internal static func toNativeObject(_ jsObject: JavaScriptObject) -> SharedObject? {
    if let objectId = try? jsObject.getProperty(sharedObjectIdPropertyName).asInt() {
      return pairs[objectId]?.native
    }
    return nil
  }

  internal static func toJavaScriptObject(_ nativeObject: SharedObject) -> JavaScriptWeakObject? {
    let objectId = nativeObject.sharedObjectId
    return pairs[objectId]?.javaScript
  }

  internal static func createSharedJavaScriptObject(runtime: JavaScriptRuntime, nativeObject: SharedObject) -> JavaScriptWeakObject {
    let object = runtime.createObject()
    let id = put((native: nativeObject, javaScript: object.createWeak()))

    nativeObject.sharedObjectId = id
    object.defineProperty(sharedObjectIdPropertyName, value: id, options: [])
    object.setDeallocator {
      delete(id)
    }
    return object.createWeak()
  }

  internal static func ensureSharedJavaScriptObject(runtime: JavaScriptRuntime, nativeObject: SharedObject) -> JavaScriptWeakObject {
    if let jsObject = toJavaScriptObject(nativeObject) {
      // JS object for this native object already exists in the registry, just return it.
      return jsObject
    }
    return createSharedJavaScriptObject(runtime: runtime, nativeObject: nativeObject)
  }
}
