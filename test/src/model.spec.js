const { assert } = require("chai");

const { Model } = require("../../src/model");
const { Table } = require("../../src/table");

const validateTablesErrorMessage = `"tables" must be an array`;
const validatePropertiesErrorMessage = `"properties" must be an object`;
const validateCollectionsErrorMessage = `"collections" must be an object`;

describe("model", () => {
  describe("#constructor", () => {
    it("should create model instance", () => {
      const model = {
        tables: [
          {
            tableName: "DimCustomer",
            tableScope: "dim"
          }
        ],
        sourceDataSets: [
          {
            dataSetName: "publicDataSet"
          }
        ]
      };

      const modelInstance = new Model(model);

      const {
        tables: [table]
      } = modelInstance;

      assert.isObject(model);
      assert.isObject(table);
      assert.isTrue(table instanceof Table);
    });

    it("should copy properties", () => {
      const model = {
        properties: {
          foo: "bar"
        },
        collections: {
          col1: [],
          col2: [1, 2, 3]
        }
      };

      const modelInstance = new Model(model);

      assert.isNotEmpty(modelInstance.properties);
      assert.deepEqual(modelInstance.properties, model.properties);
    });
    it("should copy collections", () => {
      const model = {
        properties: {
          foo: "bar"
        },
        collections: {
          col1: [],
          col2: [1, 2, 3]
        }
      };

      const modelInstance = new Model(model);

      assert.isNotEmpty(modelInstance.collections);
      assert.deepEqual(modelInstance.collections, model.collections);
    });

    it("should create blank model instance", () => {
      const model = {};

      const modelInstance = new Model(model);

      assert.isObject(modelInstance);
      assert.isArray(modelInstance.tables);
      assert.isArray(modelInstance.sourceDataSets);
      assert.isObject(modelInstance.properties);
      assert.isObject(modelInstance.collections);
    });
  });

  describe("#validateProperties", () => {
    it("should fail if not an object", () => {
      assert.throws(
        () => Model.prototype.validateProperties(),
        Error,
        validatePropertiesErrorMessage
      );
    });
    it("should not fail if object", () => {
      assert.doesNotThrow(() => {
        Model.prototype.validateProperties({ foo: "bar" });
      });
    });
  });

  describe("#validateCollections", () => {
    it("should fail if not an object", () => {
      assert.throws(
        () => Model.prototype.validateCollections(),
        Error,
        validateCollectionsErrorMessage
      );
    });
    it("should not fail if object", () => {
      assert.doesNotThrow(() => {
        Model.prototype.validateCollections({ foo: "bar" });
      });
    });
  });

  describe("#validateTables", () => {
    it("should throw error if value is missing", () => {
      assert.throws(
        () => Model.prototype.validateTables(),
        Error,
        validateTablesErrorMessage
      );
    });

    it("should throw error if value is not an array", () => {
      assert.throws(
        () =>
          Model.prototype.validateTables({
            tableName: "DimCurrency"
          }),
        Error,
        validateTablesErrorMessage
      );
    });

    it("should not throw error if value is an empty array", () => {
      assert.doesNotThrow(() => Model.prototype.validateTables([]));
    });

    it('should return "true" if value is not an empty array', () => {
      const result = Model.prototype.validateTables([
        { tableName: "DimCurrency" }
      ]);

      assert.isTrue(result);
    });
  });

  describe("#createTable", () => {
    it('should throw error if "model" param is missing', () => {
      assert.throws(
        () =>
          Model.prototype.createTable(null, {
            tableScope: "dim"
          }),
        Error
      );
    });

    it('should return "Table" object with all specified options', () => {
      const options = {
        tableName: "DimCurrency",
        tableScope: "dim"
      };

      const result = Model.prototype.createTable.call({}, options);

      assert.isObject(result);
      assert.isTrue(result instanceof Table);
      assert.include(result, options);
    });
  });
});
