/**
 * @fileoverview Validation utilities.
 * @private
 */

/**
 * Helper util for validation arrays
 * @param {Array} arr
 * @return {Object}
 * @private
 */
const validateArray = arr => {
  const isArray = Array.isArray(arr);
  const isEmptyArray = isArray && arr.length === 0;
  const isArrayOfStrings =
    isArray && !isEmptyArray && arr.every(item => typeof item === "string");

  return {
    isArray,
    isEmptyArray,
    isArrayOfStrings
  };
};

/**
 * Helper util for validating functions
 * @param {Function} func
 * @return {Object}
 * @private
 */
const validateFunction = func => {
  const isFunction =
    !!func &&
    typeof func === "function" &&
    {}.toString.call(func) === "[object Function]";

  return {
    isFunction
  };
};

/**
 * Helper util for validating objects
 * @param {Object} obj
 * @return {Object}
 * @private
 */
const validateObject = obj => {
  const isDefined = obj !== undefined;

  const isObject =
    !!obj && typeof obj === "object" && obj.toString() === "[object Object]";

  const isEmptyObject = isObject && Object.entries(obj).length === 0;

  return {
    isDefined,
    isObject,
    isEmptyObject
  };
};

/**
 * Ensures that parameter is string and is not empty
 * @param {string} str string to validate
 * @returns {boolean}
 * @private
 */
const validateStringNotEmpty = str => {
  return !!str && typeof str === "string";
};

/**
 * Ensures that `tableScope` property
 * - is a string
 * - is one of `validTableScopes`
 * @param {string} tableScope string to validate
 * @param {boolean} allowEmpty sets if empty table scope is allowed
 * @return {boolean}
 * @private
 */
const validateTableScope = (tableScope, allowEmpty = true) => {
  if (!tableScope && allowEmpty) {
    return true;
  }

  if (validateStringNotEmpty(tableScope)) {
    return true;
  }

  throw new Error("'tableScope' property must be non-empty string");
};

module.exports = {
  validateArray,
  validateFunction,
  validateObject,
  validateTableScope,
  validateStringNotEmpty
};
