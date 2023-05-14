/**
 * Set a deep property on nested objects
 * @param  {object}   obj  A object
 * @param  {String}   path A path
 * @param  {Any}      val  Anything that can be set
 * @author victornpb https://gist.github.com/victornpb/4c7882c1b9d36292308e
 */
export default function setDeepVal(obj, path, val) {
    var props = path.split('.');
    for (var i = 0, n = props.length - 1; i < n; ++i) {
        obj = obj[props[i]] = obj[props[i]] || {};
    }
    obj[props[i]] = val;
    return obj;
}
