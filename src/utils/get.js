/**
 * Access a deep value inside an object
 * Works by passing a path like "foo.bar", also works with nested arrays like "foo[0][1].baz"
 * @author victornpb https://gist.github.com/victornpb/4c7882c1b9d36292308e
 * Unit tests: http://jsfiddle.net/Victornpb/0u1qygrh/
 * @param {any} object Any object
 * @param {string} path Property path to access e.g.: "foo.bar[0].baz.1.a.b"
 * @param {any} [defaultValue=undefined] Optional value to return when property doesn't exist or is undefined
 * @return {any}
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
