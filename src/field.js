/**
 * Defines Field class
 *
 * @module latona/core/field
 */

const { validateObject } = require("../src/utils/validation");

/**
 * Holds all metadata for fields. We expect at least the `fieldName` property
 *   and optional `options` object, which may hold any properties needed by
 *   templates. Also, all properties of the object passed to the constructor
 *   will be copied as a member property to the instance, the use of those
 *   properties, as well as the use of option flags depends on particular template
 *   or addon/extension.
 * @class
 * @property {string} fieldName Field name
 * @property {Object} options Field options. Typical option is a boolean flag
 *   that signals if the field is private, public, natural key, surrogate key,
 *   or whatever else.
 */
class Field {
  /**
   * Creates `Field` object
   * @param {!Object} opt Base field properties: `{"fieldName": "string", "options": {}}`
   */
  constructor(opt) {
    const { fieldName, options = {} } = opt;

    this.validateFieldName(fieldName);
    this.validateOptions(options);

    Object.entries(opt).forEach(([k, v]) => {
      this[k] = v;
    });
  }

  /**
   * Ensures that `fieldName` property exists and is a string
   * @param {string} fieldName
   * @private
   */
  validateFieldName(fieldName) {
    if (typeof fieldName !== "string") {
      throw new Error('"fieldName" property must be specified');
    }

    return true;
  }

  /**
   * Ensures that `options` property exists and is an Object
   * @param {!Object} options An options object
   * @return {boolean}
   * @private
   */
  validateOptions(options) {
    const { isObject } = validateObject(options);

    if (isObject) {
      return true;
    }

    throw new Error("Options must be an Object");
  }
}

module.exports = { Field };
