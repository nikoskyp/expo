// Copyright 2022-present 650 Industries. All rights reserved.

#import <ExpoModulesCore/EXJSIUtils.h>
#import <ExpoModulesCore/EXJavaScriptWeakObject.h>

@implementation EXJavaScriptWeakObject {
  /**
   Pointer to the `EXJavaScriptRuntime` wrapper.

   \note It must be weak because only then the original runtime can be safely deallocated
   when the JS engine wants to without unsetting it on each created object.
   */
  __weak EXJavaScriptRuntime *_runtime;

  /**
   Shared pointer to the `WeakRef` JS object.
   */
  std::shared_ptr<jsi::Object> _jsWeakObject;
}

- (nonnull instancetype)initWith:(std::shared_ptr<jsi::Object>)jsObject
                         runtime:(nonnull EXJavaScriptRuntime *)runtime
{
  if (self = [super init]) {
    _runtime = runtime;
    _jsWeakObject = expo::createWeakObject(*[runtime get], jsObject);
  }
  return self;
}

- (nonnull EXJavaScriptObject *)lock
{
  jsi::Runtime *runtime = [_runtime get];
  jsi::Object ref = _jsWeakObject->getProperty(*runtime, "deref")
    .asObject(*runtime)
    .asFunction(*runtime)
    .callWithThis(*runtime, *_jsWeakObject)
    .asObject(*runtime);
  std::shared_ptr<jsi::Object> refPtr = std::make_shared<jsi::Object>(std::move(ref));

  return [[EXJavaScriptObject alloc] initWith:refPtr
                                      runtime:_runtime];
}

@end
