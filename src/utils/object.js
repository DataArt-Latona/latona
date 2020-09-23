/**
 * @fileoverview Utility for working with objects
 * @private
 */

/**
 * @param  {Object} obj An object to clone
 * @param {Function} [replacer] Replacer function. See
 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 * @return {Object}
 * @private
 */
const deepClone = (obj, replacer = undefined) => {
  return JSON.parse(JSON.stringify(obj, replacer));
};

module.exports = {
  deepClone
};
