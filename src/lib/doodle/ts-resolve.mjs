// Module resolution hook for selfcheck.mts. Node's type stripping needs file
// extensions on relative imports, but the app code imports without them (the
// bundler style used across this repo). This hook retries with ".ts".
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const missing = error && error.code === "ERR_MODULE_NOT_FOUND";
    if (missing && specifier.startsWith(".")) {
      return nextResolve(`${specifier}.ts`, context);
    }
    throw error;
  }
}
