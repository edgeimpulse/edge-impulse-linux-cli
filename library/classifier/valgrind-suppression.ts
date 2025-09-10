/* eslint-disable @stylistic/max-len */

// SoftmaxInt8LUT uses uninitialized memory - suppress this error
// [0-0] ==389== Use of uninitialised value of size 8
// [0-0] ==389==    at 0x452A58: void tflite::optimized_ops::SoftmaxInt8LUT<signed char, signed char>(tflite::SoftmaxParams const&, tflite::RuntimeShape const&, signed char const*, tflite::RuntimeShape const&, signed char*) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x4504DB: TfLiteStatus tflite::ops::builtin::activations::SoftmaxQuantized<signed char, signed char>(TfLiteContext*, TfLiteTensor const*, TfLiteTensor*, tflite::ops::builtin::activations::SoftmaxOpData*, tflite::ops::builtin::activations::KernelType) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x45A9D3: TfLiteStatus tflite::ops::builtin::activations::SoftmaxEval<(tflite::ops::builtin::activations::KernelType)1>(TfLiteContext*, TfLiteNode*) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x44A263: tflite::Subgraph::InvokeImpl() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x449C73: tflite::Subgraph::Invoke() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x42AB4B: tflite::impl::Interpreter::Invoke() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x405C87: run_nn_inference(ei_impulse const*, ei_feature_t*, unsigned int, unsigned int*, unsigned int, ei_impulse_result_t*, void*, bool) (tflite_full.h:224)
// [0-0] ==389==    by 0x406BDB: run_inference (ei_run_classifier.h:218)
// [0-0] ==389==    by 0x40700F: process_impulse (ei_run_classifier.h:422)
// [0-0] ==389==    by 0x40AC8F: run_classifier (ei_run_classifier.h:1036)
// [0-0] ==389==    by 0x40AC8F: json_message_handler(rapidjson::GenericDocument<rapidjson::UTF8<char>, rapidjson::MemoryPoolAllocator<rapidjson::CrtAllocator>, rapidjson::CrtAllocator>&, char*, unsigned long, unsigned long, unsigned long) (main.cpp:397)
// [0-0] ==389==    by 0x40F3E7: socket_main(char*) (main.cpp:707)
// [0-0] ==389==    by 0x4C06E0F: (below main) (libc-start.c:308)
// [0-0] ==389==  Uninitialised value was created by a heap allocation
// [0-0] ==389==    at 0x484C644: memalign (in /usr/lib/aarch64-linux-gnu/valgrind/vgpreload_memcheck-arm64-linux.so)
// [0-0] ==389==    by 0x6917A3: tflite::SimpleMemoryArena::Commit(bool*) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x689FAB: tflite::ArenaPlanner::ExecuteAllocations(int, int) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x4484C3: tflite::Subgraph::PrepareOpsAndTensors() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x447DB7: tflite::Subgraph::AllocateTensors() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x44B703: tflite::Subgraph::ModifyGraphWithDelegateImpl(TfLiteDelegate*) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x44BCEF: tflite::Subgraph::ModifyGraphWithDelegate(TfLiteDelegate*) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x42C273: TfLiteStatus tflite::impl::Interpreter::ModifyGraphWithDelegateImpl<TfLiteDelegate, void (*)(TfLiteDelegate*)>(std::unique_ptr<TfLiteDelegate, void (*)(TfLiteDelegate*)>&&) (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x42A8EB: tflite::impl::Interpreter::ApplyLazyDelegateProviders() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x42A7EB: tflite::impl::Interpreter::AllocateTensors() (in /app/selenium-tests/builds/runner-linux-aarch64-gestures-gmm-false-int8.eim)
// [0-0] ==389==    by 0x40668F: get_interpreter(ei_learning_block_config_tflite_graph_t*, tflite::impl::Interpreter**) (tflite_full.h:107)
// [0-0] ==389==    by 0x405B9B: run_nn_inference(ei_impulse const*, ei_feature_t*, unsigned int, unsigned int*, unsigned int, ei_impulse_result_t*, void*, bool) (tflite_full.h:186)
const SOFTMAX_INT8_LUT_SUPPRESSION = `
{
   aarch64_softmax_i8_suppression
   Memcheck:Value8
   fun:_ZN6tflite13optimized_ops14SoftmaxInt8LUTIaaEEvRKNS_13SoftmaxParamsERKNS_12RuntimeShapeEPKT_S7_PT0_
   fun:_ZN6tflite3ops7builtin11activations16SoftmaxQuantizedIaaEE12TfLiteStatusP13TfLiteContextPK12TfLiteTensorPS7_PNS2_13SoftmaxOpDataENS2_10KernelTypeE
   fun:_ZN6tflite3ops7builtin11activations11SoftmaxEvalILNS2_10KernelTypeE1EEE12TfLiteStatusP13TfLiteContextP10TfLiteNode
   fun:_ZN6tflite8Subgraph10InvokeImplEv
   fun:_ZN6tflite8Subgraph6InvokeEv
   fun:_ZN6tflite4impl11Interpreter6InvokeEv
   fun:_Z16run_nn_inferencePK10ei_impulseP12ei_feature_tjPjjP19ei_impulse_result_tPvb
   fun:run_inference
   ...
}
{
   x86_softmax_i8_suppression
   Memcheck:Value8
   fun:_ZN6tflite13optimized_ops7SoftmaxIaaEEvRKNS_13SoftmaxParamsERKNS_12RuntimeShapeEPKT_S7_PT0_
   fun:_ZN6tflite3ops7builtin11activations16SoftmaxQuantizedIaaEE12TfLiteStatusP13TfLiteContextPK12TfLiteTensorPS7_PNS2_13SoftmaxOpDataENS2_10KernelTypeE
   fun:_ZN6tflite3ops7builtin11activations11SoftmaxEvalILNS2_10KernelTypeE1EEE12TfLiteStatusP13TfLiteContextP10TfLiteNode
   fun:_ZN6tflite8Subgraph10InvokeImplEv
   fun:_ZN6tflite8Subgraph6InvokeEv
   fun:_ZN6tflite4impl11Interpreter6InvokeEv
   fun:_Z16run_nn_inferencePK10ei_impulseP12ei_feature_tjPjjP19ei_impulse_result_tPvb
   fun:run_inference
   ...
}
`;

export const VALGRIND_SUPPRESSION_FILE = [
   SOFTMAX_INT8_LUT_SUPPRESSION,
].join('\n');
