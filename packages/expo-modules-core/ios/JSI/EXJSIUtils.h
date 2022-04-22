// Copyright 2018-present 650 Industries. All rights reserved.

#ifdef __cplusplus

#import <jsi/jsi.h>
#import <ReactCommon/RCTTurboModule.h>

namespace jsi = facebook::jsi;
namespace react = facebook::react;

namespace expo {

std::shared_ptr<jsi::Object> createWeakObject(jsi::Runtime &runtime, std::shared_ptr<jsi::Object> object);

using PromiseInvocationBlock = void (^)(RCTPromiseResolveBlock resolveWrapper, RCTPromiseRejectBlock rejectWrapper);

void callPromiseSetupWithBlock(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> jsInvoker, std::shared_ptr<react::Promise> promise, PromiseInvocationBlock setupBlock);

} // namespace expo

#endif
