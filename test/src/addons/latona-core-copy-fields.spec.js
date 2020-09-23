const { assert } = require("chai");
const { LatonaProject } = require("../../../index");
const addon = require("../../../src/addons/latona-core-copy-fields");

const pathToMockModelFile =
  "./test/mocks/latona-core-copy-fields.spec/model.json";

const errorMessages = {
  rulesMissing: "rules option should be non-empty array",
  fieldOptionsMissing: `"fieldOptions" should be an array of strings`,
  unsetOptionsInvalid: `"unsetOptions" should be an array of strings or empty`,
  noCb: `"addonCreateCb" is expected to be a function`
};

function buildProjObject(copyRules) {
  return {
    model: pathToMockModelFile,
    addons: [
      {
        moduleName: "latona-core-autofields",
        options: {
          fieldTemplates: [
            {
              tableOption: "addSurrogateKey",
              addKeyPrefix: true,
              fieldTemplate: {
                fieldName: "_s_key",
                sqlType: "uniqueidentifier",
                options: {
                  isPublic: true,
                  isSKey: true
                }
              }
            }
          ]
        }
      },
      {
        moduleName: "latona-core-copy-fields",
        options: {
          rules: copyRules
        }
      }
    ]
  };
}

describe("latona-core-copy-fields", () => {
  it("should fail if cb not provided", () => {
    assert.throws(
      () => {
        addon.create();
      },
      Error,
      errorMessages.noCb
    );
  });
  it("should fail if rules are missing", () => {
    assert.throws(
      () => {
        LatonaProject.load(buildProjObject(undefined));
      },
      Error,
      errorMessages.rulesMissing
    );

    assert.throws(
      () => {
        LatonaProject.load(buildProjObject([]));
      },
      Error,
      errorMessages.rulesMissing
    );
  });
  it("should make no change if no tables are referenced", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          fieldOptions: ["isNKey"],
          unsetOptions: ["isNKey", "isSKey"]
        },
        {
          fieldOptions: ["isSKey"]
        }
      ])
    );

    const tModel = proj.transformedModel;
    const tables = tModel.tables.filter(
      t => t.tableScope === "dim" && t.references.length === 0
    );

    assert.lengthOf(tables, 2);

    tables.forEach(table => {
      const originalTable = proj.model.tables.find(
        t => t.tableName === table.tableName
      );

      // we imply that surrogate keys were added
      assert.equal(table.fields.length, originalTable.fields.length + 1);
    });
  });
  it("should consider tableScope", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          tableScope: "fact",
          fieldOptions: ["isNKey"],
          unsetOptions: ["isNKey", "isSKey"]
        },
        {
          tableScope: "fact",
          fieldOptions: ["isSKey"],
          unsetOptions: ["isNKey", "isSKey"]
        }
      ])
    );

    const tModel = proj.transformedModel;
    const { tables } = tModel;

    const factTables = tables.filter(t => t.tableScope === "fact");
    const dimTables = tables.filter(t => t.tableScope === "dim");

    assert.isArray(tables);
    assert.lengthOf(tables, 5);

    assert.lengthOf(factTables, 2);
    assert.lengthOf(dimTables, 3);

    factTables.forEach(table => {
      const originalTable = proj.model.tables.find(
        t => t.tableName === table.tableName
      );

      // we imply that surrogate keys were added and both natural and
      // surrogate keys were copied (thus - references*2)
      assert.equal(
        table.fields.length,
        originalTable.fields.length + 1 + originalTable.references.length * 2,
        `tableName: ${table.tableName}`
      );

      table.fields
        .filter(f => f.fieldName.startsWith("dim_n_key_"))
        .forEach(f => {
          assert.isTrue(f.options.dummyOption);
        });
    });

    dimTables.forEach(table => {
      const originalTable = proj.model.tables.find(
        t => t.tableName === table.tableName
      );

      // we imply that surrogate keys were added
      assert.equal(table.fields.length, originalTable.fields.length + 1);
    });

    assert.lengthOf(dimTables[0].fields, 2);

    const specialFactTable = factTables.find(t => t.tableName === "FactTableY");
    const specialField = specialFactTable.fields.find(
      f => f.fieldName === "dim_n_duplicate_key_c_2"
    );

    assert.isObject(specialFactTable);
    assert.isObject(specialField);
    assert.isUndefined(specialField.options);
  });
  it("should throw error if fieldOptions is empty", () => {
    assert.throws(
      () => {
        const proj = LatonaProject.load(
          buildProjObject([
            {
              tableScope: "fact",
              unsetOptions: ["isNKey", "isSKey"]
            }
          ])
        );

        // eslint-disable-next-line no-unused-vars
        const tModel = proj.transformedModel;
      },
      Error,
      errorMessages.fieldOptionsMissing
    );
  });
  it("should throw error if unsetOptions contains non-strings", () => {
    assert.throws(
      () => {
        const proj = LatonaProject.load(
          buildProjObject([
            {
              tableScope: "fact",
              fieldOptions: ["isNKey"],
              unsetOptions: ["isNKey", "isSKey", {}]
            }
          ])
        );

        // eslint-disable-next-line no-unused-vars
        const tModel = proj.transformedModel;
      },
      Error,
      errorMessages.unsetOptionsInvalid
    );
  });
});
