/**
 * @template {(...args) => any} T
 * @param {T} fn
 * @param {(...args: Parameters<T>) => string} keyGetter
 * @returns {T}
 */
export function memoize(fn, keyGetter) {
  const cache = new Map();
  return function (...args) {
    const key = keyGetter ? keyGetter(...args) : args.join("_");
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
}
