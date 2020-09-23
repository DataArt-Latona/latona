/**
 * Defines Table class
 *
 * @module latona/core/table
 */

const { Field } = require("./field");
const {
  validateArray,
  validateObject,
  validateTableScope: validateTableScopeUtility,
  validateStringNotEmpty
} = require("./utils/validation");
const { cloneArrayAndSetIsLast } = require("./utils/array");

/**
 * Table class.
 * Creates child field instances and provides handy selectors. May be extended
 *   via addons.
 */
class Table {
  /**
   * @param {!Object} model A model instance
   * @param {!Object} opt Base filed properties: tableName, tableScope
   */
  constructor(model, opt) {
    const {
      tableName,
      tableScope,
      keyPrefix = "",
      options = {},
      references = [],
      fields = []
    } = opt;

    this.validateModel(model);
    this.validateTableName(tableName);
    this.validateTableScope(tableScope);
    this.validateReferences(references);

    // we wrap model into function to avoid circular references when serializing
    this.internalGetModel = () => {
      return model;
    };

    this.keyPrefix = keyPrefix;

    Object.entries(opt).forEach(([k, v]) => {
      this[k] = v;
    });

    this.options = options;
    this.references = references;
    this.fields = fields.map(field => new Field(field));
  }

  /**
   * Ensures that `tableName` is non-empty string
   * @param {string} tableName
   * @return {boolean}
   * @private
   */
  validateTableName(tableName) {
    if (validateStringNotEmpty(tableName)) {
      return true;
    }

    throw new Error("tableName must be specified");
  }

  /**
   * Ensures that `model` property exists and is an Object
   * @param {Object} model A model instance
   * @return {boolean}
   * @private
   */
  validateModel(model) {
    const { isObject } = validateObject(model);

    if (isObject) {
      return true;
    }

    throw new Error("Model must be specified");
  }

  /**
   * Ensures that `references` property
   *
   * - is an Array
   * - contains only strings
   *
   * `references` can be an empty array
   * @param {string[]} references Array of referenced table names
   * @return {boolean}
   * @private
   */
  validateReferences(references) {
    const { isEmptyArray, isArrayOfStrings } = validateArray(references);

    if (isEmptyArray || isArrayOfStrings) {
      return true;
    }

    throw new Error(
      `"references" property must be an array of strings containing table names only.`
    );
  }

  /**
   * Ensures that `tableScope` property
   *
   * - is a string
   * - is one of `validTableScopes`
   *
   * @param {string} tableScope string to validate
   * @return {boolean}
   * @private
   */
  validateTableScope(tableScope) {
    return validateTableScopeUtility(tableScope, false);
  }

  /**
   * Returns table's parent model object
   * @return {Model}
   */
  get model() {
    return this.internalGetModel();
  }

  /**
   * Returns an array of referenced table instances
   * @return {Table[]}
   */
  get referencedTables() {
    const { model, references } = this;
    const { tables } = model;

    return tables.filter(table => references.includes(table.tableName));
  }

  /**
   * Returns an array of all fields
   * @return {Field[]}
   */
  get allFields() {
    return cloneArrayAndSetIsLast(this.fields);
  }

  /**
   * Returns an array of not auto generated fields
   * @return {Field[]}
   */
  get ownFields() {
    return this.fields.filter(field => !field.options.isAutoAdded);
  }
}

module.exports = { Table };
