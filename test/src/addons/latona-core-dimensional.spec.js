const { assert } = require("chai");
const { LatonaProject } = require("../../../index");
const addon = require("../../../src/addons/latona-core-dimensional");

const pathToMockModelFile =
  "./test/mocks/latona-core-dimensional.spec/model.json";

const errorMessages = {
  invalidSetting: "setting is expected to be non-empty string",
  noCb: `"addonCreateCb" is expected to be a function`
};

const addonTestOptions = {
  tableScopeValueDim: "dimension",
  fieldOptionNaturalKey: "isNatKey",
  fieldOptionSurrogateKey: "isSurKey",
  fieldOptionVersionKey: "isVerKey"
};

function buildProjObject(addonOptions) {
  return {
    model: pathToMockModelFile,
    addons: [
      {
        moduleName: "latona-core-dimensional",
        options: addonOptions
      }
    ]
  };
}

describe("latona-core-dimensional", () => {
  describe("#create", () => {
    it("should fail if cb not provided", () => {
      assert.throws(
        () => {
          addon.create();
        },
        Error,
        errorMessages.noCb
      );
    });
    it("should fail if option is not a string", () => {
      assert.throws(
        () => {
          LatonaProject.load(buildProjObject({ tableScopeValueDim: {} }));
        },
        Error,
        errorMessages.invalidSetting
      );
    });
    it("should fail if option is empty string", () => {
      assert.throws(
        () => {
          LatonaProject.load(buildProjObject({ tableScopeValueDim: "" }));
        },
        Error,
        errorMessages.invalidSetting
      );
    });
    it("should use defaults if options not set", () => {
      const proj = LatonaProject.load({
        model: pathToMockModelFile,
        addons: [
          {
            moduleName: "latona-core-dimensional"
          }
        ]
      });

      const tModel = proj.transformedModel;

      assert.lengthOf(tModel.dimensionTables(), 0, "dim"); // test model uses non-default option
      assert.lengthOf(tModel.rawTables(), 2, "raw");
      assert.lengthOf(tModel.factTables(), 1, "fact");
      assert.lengthOf(tModel.otherTables(), 1, "other");
      assert.lengthOf(tModel.tables, 5, "all");
    });
  });

  describe("mixins", () => {
    const optionList = [
      {
        option: addonTestOptions.fieldOptionNaturalKey,
        method: "naturalKeyFields",
        flagMethod: "isNaturalKey",
        expectedLen: 1
      },
      {
        option: addonTestOptions.fieldOptionSurrogateKey,
        method: "surrogateKeyFields",
        flagMethod: "isSurrogateKey",
        expectedLen: 1
      },
      {
        option: addonTestOptions.fieldOptionVersionKey,
        method: "versionKeyFields",
        flagMethod: "isVersionKey",
        expectedLen: 1
      },
      {
        option: "isPublic",
        method: "publicFields",
        flagMethod: "isPublic",
        expectedLen: 4
      },
      {
        option: "isIndex",
        method: "indexFields",
        flagMethod: "isIndexField",
        expectedLen: 1
      },
      {
        option: "isPersistent",
        method: "persistentFields",
        flagMethod: "isPersistentField",
        expectedLen: 2
      },
      {
        option: "isVersioned",
        method: "versionedFields",
        flagMethod: "isVersionedField",
        expectedLen: 1
      }
    ];

    let tModel;
    let table;

    before(() => {
      const proj = LatonaProject.load(buildProjObject(addonTestOptions));
      tModel = proj.transformedModel;
      table = tModel.tables.find(
        t => t.tableScope === addonTestOptions.tableScopeValueDim
      );
    });

    function assertArray(arr, expectedLen, validator, msg) {
      assert.isArray(arr, msg);
      assert.lengthOf(arr, expectedLen, msg);
      arr.forEach(element => {
        assert.isTrue(validator(element), msg);
      });
    }

    function assertArrayWithLast(arr, expectedLen, validator, msg) {
      assertArray(arr, expectedLen, validator, msg);
      assert.isTrue(arr[arr.length - 1].isLast, msg);
    }

    function assertFlagMethodByOption(
      arr,
      expectedLen,
      optionName,
      methodName
    ) {
      assertArray(
        arr.filter(el => !!el.options && el.options[optionName]),
        expectedLen,
        el => el[methodName](),
        `assertFlagMethodByOption: ${optionName}/${methodName} (positive)`
      );
      assertArray(
        arr.filter(el => !el.options || !el.options[optionName]),
        arr.length - expectedLen,
        el => !el[methodName](),
        `assertFlagMethodByOption: ${optionName}/${methodName} (positive)`
      );
    }

    function assertTableFlagMethodByScope(tableScope, expectedLen, methodName) {
      assertArray(
        tModel.tables.filter(t => t.tableScope === tableScope),
        expectedLen,
        el => el[methodName](),
        `assertTableFlagMethod: ${tableScope}/${methodName} (positive)`
      );
      assertArray(
        tModel.tables.filter(t => t.tableScope !== tableScope),
        tModel.tables.length - expectedLen,
        el => !el[methodName](),
        `assertTableFlagMethod: ${tableScope}/${methodName} (negative)`
      );
    }

    describe("field mixin", () => {
      it("flag methods should be relevant to options", () => {
        optionList.forEach(item => {
          assertFlagMethodByOption(
            table.fields,
            item.expectedLen,
            item.option,
            item.flagMethod
          );
        });
      });
    });

    describe("table mixin", () => {
      describe("#isDimension", () => {
        it("value should correspond to table scope", () => {
          assertTableFlagMethodByScope(
            addonTestOptions.tableScopeValueDim,
            1,
            "isDimension"
          );
        });
      });
      describe("#isFact", () => {
        it("should return true if tableScope matches", () => {
          assertTableFlagMethodByScope("fact", 1, "isFact");
        });
      });
      describe("#isRaw", () => {
        it("should return value relevant to tableScope", () => {
          assertTableFlagMethodByScope("raw", 2, "isRaw");
        });
      });
      describe("#isOther", () => {
        it("should return value relevant to tableScope", () => {
          assertTableFlagMethodByScope("other", 1, "isOther");
        });
      });
      describe("#isInternal", () => {
        it("should return value relevant to option", () => {
          assertFlagMethodByOption(
            tModel.tables,
            3,
            "isInternal",
            "isInternal"
          );
        });
      });

      describe("field getters", () => {
        it("should return empty array if no match", () => {
          const emptyTable = tModel.tables.find(t => t.fields.length === 0);
          optionList.forEach(item => {
            assertArray(
              emptyTable[item.method](),
              0,
              () => true,
              `(empty) option/method: ${item.option}/${item.method}`
            );
          });
        });
        it("should return array of fields with relevant option", () => {
          optionList.forEach(item => {
            assertArrayWithLast(
              table[item.method](),
              item.expectedLen,
              el => !!el.options && !!el.options[item.option],
              `option/method: ${item.option}/${item.method}`
            );
          });
        });
        it("non-persistent - should return array of fields with relevant option", () => {
          assertArrayWithLast(
            table.nonPersistentFields(),
            3,
            el => !el.options || !el.options.isPersistent,
            `nonPersistent`
          );
        });
        it("persistent unversioned - should return array of fields with relevant option", () => {
          assertArrayWithLast(
            table.persistentUnversionedFields(),
            1,
            el =>
              !!el.options &&
              el.options.isPersistent &&
              !el.options.isVersioned,
            `persistentUnversioned`
          );
        });
      });
    });

    describe("model mixin", () => {
      describe("#publicTables", () => {
        it("should return array of tables that have no isInternal option", () => {
          assertArray(
            tModel.publicTables(),
            2,
            el => !el.isInternal(),
            "public"
          );
        });
      });
      describe("#internalTables", () => {
        it("should return array of tables that have isInternal option", () => {
          assertArray(
            tModel.internalTables(),
            3,
            el => el.isInternal(),
            "internal"
          );
        });
      });
      describe("table getters", () => {
        it("should return array of tables with relevant tableScope", () => {
          assertArray(
            tModel.dimensionTables(),
            1,
            el => el.tableScope === addonTestOptions.tableScopeValueDim,
            "dimension"
          );
          assertArray(
            tModel.factTables(),
            1,
            el => el.tableScope === "fact",
            "fact"
          );
          assertArray(
            tModel.rawTables(),
            2,
            el => el.tableScope === "raw",
            "raw"
          );
          assertArray(
            tModel.otherTables(),
            1,
            el => el.tableScope === "other",
            "other"
          );
        });
      });
    });
  });
});
