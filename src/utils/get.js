/**
 * Retrieves a deep value inside an object based on the specified path.
 * @param {any} object - The object from which to retrieve the value.
 * @param {string} path - The path to the desired property, e.g., "foo.bar[0].baz.1.a.b".
 * @param {*} [defaultValue=undefined] - Optional value to return when the property doesn't exist or is undefined.
 * @returns {*} The value at the specified path, or the defaultValue if not found.
 * @see {@link https://gist.github.com/victornpb/4c7882c1b9d36292308e}
 * @see {@link http://jsfiddle.net/Victornpb/0u1qygrh/}
 * @example
 * const obj = { foo: { bar: [{ baz: { a: { b: 42 } } }] } };
 * const value = getDeepVal(obj, 'foo.bar[0].baz.a.b');
 * console.log(value); // Output: 42
 */
export default function getDeepVal(object, path, defaultValue=undefined) {
  if (typeof object === 'undefined' || object === null) return defaultValue;
  const pathArray = path.split(/\.|\[["']?|["']?\]/);
  for (let i = 0, l = pathArray.length; i < l; i++) {
    if (pathArray[i] === '') continue;
    object = object[pathArray[i]];
    if (typeof object === 'undefined' || object === null) return defaultValue;
  }
  return (typeof object === 'undefined' || object === null) ? defaultValue : object;
}
