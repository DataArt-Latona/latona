const {
  validateObject,
  validateTableScope: validateTableScopeUtility
} = require("../utils/validation");

/**
 * AutoFieldTemplate class.
 * Creates auto field setting item and provides validation.
 */
class AutoFieldTemplate {
  /**
   * @param {!Object} options
   * @param {string} options.tableScope table scope filter value
   * @param {string} options.tableOption table option filter value
   * @param {Object} options.fieldTemplate an object compatible with {@link Field}
   * @param {string} options.fieldTemplate.fieldName mandatory field name
   */
  constructor(options = {}) {
    const { tableOption, tableScope, fieldTemplate } = options;

    this.validateTableOption(tableOption);
    this.validateTableScope(tableScope);
    this.validateFieldTemplate(fieldTemplate);

    Object.entries(options).forEach(([k, v]) => {
      this[k] = v;
    });
  }

  /**
   * Ensures that `tableOption` property
   *
   * - is a string
   * @param {string} tableScope
   * @return {boolean}
   * @private
   */
  validateTableOption(tableOption) {
    if (!tableOption) {
      return true;
    }

    if (typeof tableOption !== "string") {
      throw new Error(
        `"tableOption" property must be specified and be a string`
      );
    }

    return true;
  }

  /**
   * Ensures that `tableScope` property
   *
   * - is a string
   * - is one of `validTableScopes`
   *
   * OR
   *
   * - empty
   *
   * @param {string} tableScope string to validate
   * @return {boolean}
   * @private
   */
  validateTableScope(tableScope) {
    return validateTableScopeUtility(tableScope);
  }

  /**
   * Ensures that `fieldTemplate` property
   *
   * - is an object
   *
   * @param {!Object} fieldTemplate
   * @return {boolean}
   * @private
   */
  validateFieldTemplate(fieldTemplate) {
    if (!fieldTemplate) {
      return true;
    }

    const { isObject } = validateObject(fieldTemplate);

    if (!isObject) {
      throw new Error(`"fieldTemplate" property must be an object`);
    }

    const fieldNameExists = Object.prototype.hasOwnProperty.call(
      fieldTemplate,
      "fieldName"
    );

    if (!fieldNameExists) {
      throw new Error(
        `"fieldName" property must be specified in "fieldTemplate"`
      );
    }

    return true;
  }
}

module.exports = { AutoFieldTemplate };
