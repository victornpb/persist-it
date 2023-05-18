/**
 * Sets a deep property on nested objects.
 * @param {object} obj - The object on which to set the property.
 * @param {string} path - The path of the property to set.
 * @param {*} val - The value to set. It can be of any type.
 * @returns {object} The modified object with the deep property set.
 * @author victornpb https://gist.github.com/victornpb/4c7882c1b9d36292308e
 * @example
 * const obj = {};
 * setDeepVal(obj, 'foo.bar.baz', 42);
 * console.log(obj.foo.bar.baz); // Output: 42
 */
export default function setDeepVal(obj, path, val) {
  const props = path.split('.');
  for (var i = 0, n = props.length - 1; i < n; ++i) {
    obj = obj[props[i]] = obj[props[i]] || {};
  }
  obj[props[i]] = val;
  return obj;
}
