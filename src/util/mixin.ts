/**
 * mixin
 * @param target
 * @param sources
 */
export default function mixin(target: any, ...sources: any[]) {
  sources.forEach((source) => {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  });
  return target;
}