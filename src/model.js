/**
 * Defines Model class
 *
 * @module latona/core/model
 */

const { Table } = require("./table");
const { SourceDataSet } = require("./source-data-set");
const { validateArray, validateObject } = require("./utils/validation");

/**
 * Model is a container for tables, source data sets, model properties, and
 *   arbitrary collections. May be extended via Latona addons.
 */
class Model {
  /**
   * @param {Object} model A user specified data object
   * @param {Table[]} [model.tables] Optional array of `Table`
   * @param {SourceDataSet[]} [model.sourceDataSets] Optional array of
   *   `SourceDataSet`
   * @param {Object} [model.properties] Optional object containing model
   *   properties. No validation will be applied, defaults to empty object.
   * @param {Object} [model.collections] Optional object containing arbitrary
   *   collections (ex: business processes, stored procedures, etc.).
   *   No validation will be applied, defaults to empty object.
   */
  constructor(model) {
    const {
      tables = [],
      sourceDataSets = [],
      properties = {},
      collections = {}
    } = model;

    this.validateTables(tables);
    this.validateProperties(properties);
    this.validateCollections(collections);

    this.sourceDataSets = sourceDataSets.map(
      sourceDataSet => new SourceDataSet(sourceDataSet)
    );
    this.tables = tables.map(table => this.createTable(table));

    this.properties = properties;
    this.collections = collections;
  }

  /**
   * Ensures that `tables` property exists and is not an empty Array
   * @param {!Array<!Table>} tables List of table instances
   * @private
   */
  validateTables(tables) {
    const { isArray } = validateArray(tables);

    if (!isArray) {
      throw new Error(`"tables" must be an array`);
    }

    return true;
  }

  validateProperties(properties) {
    const { isObject } = validateObject(properties);

    if (!isObject) {
      throw new Error(`"properties" must be an object`);
    }
  }

  validateCollections(collections) {
    const { isObject } = validateObject(collections);

    if (!isObject) {
      throw new Error(`"collections" must be an object`);
    }
  }

  /**
   * Creates Table instance
   * @param {!Object} table Table data
   * @private
   */
  createTable(table) {
    return new Table(this, table);
  }
}

module.exports = { Model };
