const { validateArray, validateTableScope } = require("../utils/validation");

/**
 * CopyFieldsRule class.
 * Creates setting item for controlling fields copying and provides validation.
 */
class CopyFieldsRule {
  /**
   * @param {!Object} options
   * @param {string} options.tableScope table scope filter value
   * @param {string[]} options.fieldOptions field option for filtering fields
   *  in referenced tables
   * @param {string[]} options.unsetOptions field options to unset
   */
  constructor(options) {
    const { tableScope, fieldOptions, unsetOptions } = options;

    validateTableScope(tableScope);
    this.validateFieldOptions(fieldOptions);
    this.validateUnsetOptions(unsetOptions);

    Object.entries(options).forEach(([k, v]) => {
      this[k] = v;
    });
  }

  /**
   * Ensures that `fieldOptions` property
   * - is an array of strings
   * @param {!Object} fieldOptions
   * @return {boolean}
   * @private
   */
  validateFieldOptions(fieldOptions) {
    const { isArrayOfStrings } = validateArray(fieldOptions);

    if (isArrayOfStrings) {
      return true;
    }

    throw new Error(`"fieldOptions" should be an array of strings`);
  }

  /**
   * Ensures that `unsetOptions` property
   * - is an array of strings or empty
   * @param {!Object} unsetOptions
   * @return {boolean}
   * @private
   */
  validateUnsetOptions(unsetOptions) {
    if (!unsetOptions) {
      return true;
    }

    const { isEmptyArray, isArrayOfStrings } = validateArray(unsetOptions);

    if (isEmptyArray || isArrayOfStrings) {
      return true;
    }

    throw new Error(`"unsetOptions" should be an array of strings or empty`);
  }
}

module.exports = { CopyFieldsRule };
