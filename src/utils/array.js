/**
 * @fileoverview Utility for working with arrays.
 * @private
 */

/**
 * Clones array elements and sets boolean property to true for the last element of the array
 * @param {!Array<Object>} arr Array of objects
 * @param {string} att property name that should be set to true
 * @return {!Array<Object>}
 * @private
 */
function cloneArrayAndSetIsLast(arr, att = 'isLast') {
  const resArr = [];
  if (arr && arr.length > 0) {
    arr.forEach(e => {
      resArr.push(Object.assign({}, e));
    });

    resArr[resArr.length - 1][att] = true;
  }
  return resArr;
}

module.exports = {
  cloneArrayAndSetIsLast
};
