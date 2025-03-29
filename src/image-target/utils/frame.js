/**
 *
 * @param {(...args) => any} fn
 * @param {() => boolean} getShouldContinue returns true if would like to execute the function on next frame
 */
export function runOnEveryFrame(fn, getShouldContinue) {
  const awaitAndRerun = async () => {
    await fn();
    if (getShouldContinue()) {
      requestAnimationFrame(awaitAndRerun);
    }
  };
  awaitAndRerun();
}
