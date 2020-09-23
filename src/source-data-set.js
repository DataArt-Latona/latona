const { validateArray, validateObject } = require("./utils/validation");

/**
 * SourceDataSet class.
 * Creates source data set item and provides validation.
 */
class SourceDataSet {
  constructor(opts) {
    const { dataSetName, options, schema } = opts;

    this.validateDataSetName(dataSetName);
    this.validateOptions(options);
    this.validateSchema(schema);

    Object.entries(opts).forEach(([k, v]) => {
      this[k] = v;
    });
  }

  /**
   * Ensures that `dataSetName` property
   * - exists
   * - is a string
   * @param {string} dataSetName
   * @return {boolean}
   * @private
   */
  validateDataSetName(dataSetName) {
    if (!dataSetName || typeof dataSetName !== "string") {
      throw new Error(
        `"dataSetName" property must be specified and be a string`
      );
    }

    return true;
  }

  /**
   * Ensures that `options` property
   * - is an object
   * @param {!Object} options
   * @return {boolean}
   * @private
   */
  validateOptions(options) {
    if (!options) {
      return true;
    }

    const { isObject } = validateObject(options);

    if (!isObject) {
      throw new Error(`"options" property must be an object`);
    }

    return true;
  }

  /**
   * Ensures that `schema` property
   * - is an array
   * @param {!Array<Object>} schema
   * @return {boolean}
   * @private
   */
  validateSchema(schema) {
    const { isArray, isEmptyArray } = validateArray(schema);

    if (!schema || isEmptyArray) {
      return true;
    }

    if (!isArray) {
      throw new Error(`"schema" property must be an array`);
    }

    return schema.forEach(field => this.validateSchemaField(field));
  }

  /**
   * Ensures that schema field
   *
   * - has `fieldName` property and it's a string
   * - has `type` property and it's a string
   * - `options` property is an object
   *
   * @param {!Object} schema field
   * @return {boolean}
   * @private
   */
  validateSchemaField(field) {
    const { isObject: fieldIsObject } = validateObject(field);

    if (!fieldIsObject) {
      throw new Error(`"field" must be an object`);
    }

    const { fieldName, type, options } = field;

    const { isObject } = validateObject(options);

    if (!fieldName || typeof fieldName !== "string") {
      throw new Error(`"fieldName" property must be specified and be a string`);
    }

    if (!type || typeof type !== "string") {
      throw new Error(`"type" property must be specified and be a string`);
    }

    if (options && !isObject) {
      throw new Error(`"options" property must be an object`);
    }

    return true;
  }
}

module.exports = { SourceDataSet };
