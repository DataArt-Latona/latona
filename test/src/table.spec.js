const { assert } = require("chai");

const { Model } = require("../../src/model");
const { Table } = require("../../src/table");

const validateModelErrorMessage = "Model must be specified";
const validateReferencesErrorMessage = `"references" property must be an array of strings containing table names only.`;
const validateTableNameErrorMessage = "tableName must be specified";

const validTableScopesErrorMessage =
  "'tableScope' property must be non-empty string";

const tables = [
  {
    tableName: "DimTable",
    tableScope: "dim",
    references: ["FactTable"]
  },
  {
    tableName: "FactTable",
    tableScope: "fact",
    references: ["InternalTable"]
  },
  {
    tableName: "InternalTable",
    tableScope: "other",
    isInternal: true,
    fields: [
      {
        fieldName: "CustomerKey",
        sqlType: "int",
        lakeType: "int32",
        options: {
          isPersistent: true,
          isPublic: true,
          isNKey: true,
          isIndex: true,
          isVersioned: true
        }
      },
      {
        fieldName: "AutoAdded",
        options: {
          isAutoAdded: true,
          isPublic: false,
          isNKey: false,
          isPersistent: false,
          isVersioned: false
        }
      },
      {
        fieldName: "persistentFieldsWithoutSnapshotDates",
        options: {
          isPersistent: true,
          isVersioned: false
        }
      }
    ]
  },
  {
    tableName: "RawTable",
    tableScope: "raw",
    references: ["FactTable"]
  }
];

describe("table", () => {
  describe("#constructor", () => {
    it("should create table instance with all specified options", () => {
      const [, , otherTable] = tables;

      const table = new Table({}, otherTable);

      assert.isObject(table);
      assert.deepInclude(table, otherTable);
    });

    it("should fail if tableName is missing", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const t = new Table({}, { tableScope: "other" });
        },
        Error,
        validateTableNameErrorMessage
      );
    });
  });

  describe("#validateTableName", () => {
    it("should fail if tableName is empty string", () => {
      assert.throws(
        () => Table.prototype.validateTableName(""),
        Error,
        validateTableNameErrorMessage
      );
    });
  });

  describe("#validateModel", () => {
    it("should throw error if value is missing", () => {
      assert.throws(
        () => Table.prototype.validateModel(),
        Error,
        validateModelErrorMessage
      );
    });

    it("should throw error if value is not an object", () => {
      assert.throws(
        () => Table.prototype.validateModel([]),
        Error,
        validateModelErrorMessage
      );
    });

    it("should return true if value is an object", () => {
      const result = Table.prototype.validateModel({});

      assert.isTrue(result);
    });
  });

  describe("#validateTableScope", () => {
    it("should throw error if value is missing", () => {
      assert.throws(
        () => Table.prototype.validateTableScope(),
        Error,
        validTableScopesErrorMessage
      );
    });

    it("should throw error if value is not a string", () => {
      assert.throws(
        () => Table.prototype.validateTableScope({}),
        Error,
        validTableScopesErrorMessage
      );
    });

    it("should return true if value is a string", () => {
      const result = Table.prototype.validateTableScope("dim");

      assert.isTrue(result);
    });
  });

  describe("#validateReferences", () => {
    it("should throw error if value is missing", () => {
      assert.throws(
        () => Table.prototype.validateReferences(),
        Error,
        validateReferencesErrorMessage
      );
    });

    it("should throw error if value is not an array", () => {
      assert.throws(
        () => Table.prototype.validateReferences({}),
        Error,
        validateReferencesErrorMessage
      );
    });

    it("should throw error if value is not an array of strings", () => {
      assert.throws(
        () => Table.prototype.validateReferences([1, 2, 3]),
        Error,
        validateReferencesErrorMessage
      );
    });

    it("should return true if value is an empty array", () => {
      const result = Table.prototype.validateReferences([]);

      assert.isTrue(result);
    });

    it("should return true if value is an array of strings", () => {
      const result = Table.prototype.validateReferences(["table1", "table2"]);

      assert.isTrue(result);
    });
  });

  describe("#referencedTables", () => {
    it("should return referenced tables", () => {
      const [dimTable, factTable] = tables;

      const model = new Model({
        tables
      });

      const {
        tables: [table]
      } = model;

      assert.isObject(table);
      assert.deepInclude(table, dimTable);
      assert.isArray(table.referencedTables);
      assert.lengthOf(table.referencedTables, 1);
      assert.deepInclude(table.referencedTables[0], factTable);
    });
  });

  describe("#allFields", () => {
    it("should return all fields", () => {
      const [, , tableWithFields] = tables;

      const table = new Table({}, tableWithFields);

      assert.isObject(table);
      assert.isArray(table.allFields);
      assert.lengthOf(table.allFields, 3);
      assert.equal(table.fields.length, table.allFields.length);
      assert.equal(table.allFields[table.allFields.length - 1].isLast, true);
    });

    it("should have no isLast for all fields except last", () => {
      const [, , tableWithFields] = tables;

      const table = new Table({}, tableWithFields);

      table.allFields.forEach((e, idx, arr) => {
        if (idx < arr.length - 1) assert.isUndefined(e.isLast);
      });
    });
  });

  describe("#ownFields", () => {
    it("should return own fields", () => {
      const [, , tableWithFields] = tables;

      const table = new Table({}, tableWithFields);

      assert.isObject(table);
      assert.isArray(table.ownFields);
      assert.lengthOf(table.ownFields, 2);
    });
  });
});
