const { assert } = require("chai");
const { LatonaProject } = require("../../../index");
const addon = require("../../../src/addons/latona-core-autofields");

const pathToMockModelFile = "./test/mocks/latona-project.spec/model.json";

const errorMessages = {
  fieldTemplatesMissing: "fieldTemplates option should be non-empty array",
  alreadySpecified: "is already specified in",
  keyPrefixPropertyMissing: `"keyPrefix" property is missing for table`,
  noCb: `"addonCreateCb" is expected to be a function`
};

function buildProjObject(templates) {
  return {
    model: pathToMockModelFile,
    addons: [
      {
        moduleName: "latona-core-autofields",
        options: {
          fieldTemplates: templates
        }
      }
    ]
  };
}

describe("latona-core-autofields", () => {
  it("should fail if cb not provided", () => {
    assert.throws(
      () => {
        addon.create();
      },
      Error,
      errorMessages.noCb
    );
  });
  it("should fail if fieldTemplates is missing or empty", () => {
    assert.throws(
      () => {
        LatonaProject.load(buildProjObject(undefined));
      },
      Error,
      errorMessages.fieldTemplatesMissing
    );

    assert.throws(
      () => {
        LatonaProject.load(buildProjObject([]));
      },
      Error,
      errorMessages.fieldTemplatesMissing
    );
  });
  it("should add fields if fieldTemplates are matching table scope and options", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          tableOption: "addDateFields",
          tableScope: "other",
          fieldTemplate: {
            fieldName: "dt_from",
            type: "date"
          }
        },
        {
          tableOption: "addDateFields",
          tableScope: "other",
          fieldTemplate: {
            fieldName: "dt_to",
            type: "date"
          }
        },
        {
          tableOption: "noOption",
          tableScope: "other",
          fieldTemplate: {
            fieldName: "dt_no",
            type: "date"
          }
        }
      ])
    );

    const tModel = proj.transformedModel;
    const tables = tModel.tables.filter(
      t => t.tableScope === "other" && t.options.addDateFields
    );

    assert.lengthOf(tables, 1);
    const table = tables[0];
    assert.lengthOf(table.fields, 4);
    const fieldsFrom = table.fields.filter(
      f => f.fieldName === "dt_from" && f.type === "date"
    );
    assert.isNotEmpty(fieldsFrom);

    const fieldsTo = table.fields.filter(
      f => f.fieldName === "dt_to" && f.type === "date"
    );
    assert.isNotEmpty(fieldsTo);

    const fieldsEmpty = table.fields.filter(f => f.fieldName === "dt_no");
    assert.isEmpty(fieldsEmpty);
  });
  it("should add fields if fieldTemplates are matching table options and scope is not limited (undefined)", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          tableOption: "nonScopeTable",
          fieldTemplate: {
            fieldName: "dt_non_scope",
            type: "date"
          }
        }
      ])
    );

    const tModel = proj.transformedModel;
    const tablesWithOption = tModel.tables.filter(
      t => t.options && t.options.nonScopeTable
    );
    const tablesWithNoOption = tModel.tables.filter(
      t => !t.options || !t.options.nonScopeTable
    );

    assert.lengthOf(tablesWithOption, 2);
    assert.lengthOf(tablesWithNoOption, 2);

    tablesWithOption.forEach(t => {
      const fieldsFiltered = t.fields.filter(
        f => f.fieldName === "dt_non_scope" && f.type === "date"
      );
      assert.lengthOf(fieldsFiltered, 1);
    });

    tablesWithNoOption.forEach(t => {
      const fieldsFiltered = t.fields.filter(
        f => f.fieldName === "dt_non_scope" && f.type === "date"
      );
      assert.isEmpty(fieldsFiltered);
    });
  });
  it("should add fields if fieldTemplates are matching table scope and option is not limited (undefined)", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          tableScope: "fact",
          fieldTemplate: {
            fieldName: "dt_non_option",
            type: "date"
          }
        }
      ])
    );

    const tModel = proj.transformedModel;
    const tablesWithScope = tModel.tables.filter(t => t.tableScope === "fact");
    const tablesWithNoScope = tModel.tables.filter(
      t => t.tableScope !== "fact"
    );

    assert.lengthOf(tablesWithScope, 1);
    assert.lengthOf(tablesWithNoScope, 3);

    tablesWithScope.forEach(t => {
      const fieldsFiltered = t.fields.filter(
        f => f.fieldName === "dt_non_option" && f.type === "date"
      );
      assert.lengthOf(fieldsFiltered, 1);
    });

    tablesWithNoScope.forEach(t => {
      const fieldsFiltered = t.fields.filter(
        f => f.fieldName === "dt_non_option" && f.type === "date"
      );
      assert.isEmpty(fieldsFiltered);
    });
  });
  it("should add fields if fieldTemplates are matching all tables", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          fieldTemplate: {
            fieldName: "dt_all",
            type: "date"
          }
        }
      ])
    );

    const tModel = proj.transformedModel;
    assert.lengthOf(tModel.tables, 4);

    tModel.tables.forEach(t => {
      const fieldsFiltered = t.fields.filter(
        f => f.fieldName === "dt_all" && f.type === "date"
      );
      assert.lengthOf(fieldsFiltered, 1);
    });
  });
  it("should add fields with generated from keyPrefix field name", () => {
    const testFieldName = "dt_key_prefix";

    const proj = LatonaProject.load(
      buildProjObject([
        {
          tableScope: "dim",
          addKeyPrefix: true,
          fieldTemplate: {
            fieldName: testFieldName,
            type: "date"
          }
        }
      ])
    );

    const tModel = proj.transformedModel;
    const dimTables = tModel.tables.filter(t => t.tableScope === "dim");

    assert.lengthOf(dimTables, 2);

    dimTables.forEach(t => {
      const fieldsFiltered = t.fields.filter(
        f =>
          f.fieldName === `${t.keyPrefix}${testFieldName}` && f.type === "date"
      );
      assert.lengthOf(fieldsFiltered, 1);
    });
  });
  it("should throw error if fieldTemplate has addKeyPrefix prop but table does not have keyPrefix", () => {
    const proj = LatonaProject.load(
      buildProjObject([
        {
          addKeyPrefix: true,
          fieldTemplate: {
            fieldName: "dt_all",
            type: "date"
          }
        }
      ])
    );

    assert.throws(
      () => {
        // eslint-disable-next-line no-unused-vars
        const tModel = proj.transformedModel;
      },
      Error,
      errorMessages.keyPrefixPropertyMissing
    );
  });
  it("should throw error if table already contains field with same name as auto generated field", () => {
    assert.throws(
      () => {
        const proj = LatonaProject.load(
          buildProjObject([
            {
              tableOption: "addSurrogateKey",
              tableScope: "dim",
              fieldTemplate: {
                fieldName: "AccountKey"
              }
            }
          ])
        );

        // eslint-disable-next-line no-unused-vars
        const m = proj.transformedModel;
      },
      Error,
      errorMessages.alreadySpecified
    );
  });
});
