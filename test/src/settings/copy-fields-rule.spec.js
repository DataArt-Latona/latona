const { assert } = require("chai");

const { CopyFieldsRule } = require("../../../src/settings/copy-fields-rule");

describe("settings/copy-fields-rule", () => {
  describe("#constructor", () => {
    it('should throw error if "fieldOptions" property is not valid', () => {
      assert.throws(
        () =>
          new CopyFieldsRule({
            fieldOptions: []
          }),
        Error
      );
    });

    it('should throw error if "tableScope" property is not valid', () => {
      assert.throws(
        () =>
          new CopyFieldsRule({
            tableScope: {},
            fieldOptions: ["foo"]
          }),
        Error
      );
    });

    it('should throw error if "unsetOptions" property is not valid', () => {
      assert.throws(
        () =>
          new CopyFieldsRule({
            tableScope: "fake-scope",
            fieldOptions: ["foo"],
            unsetOptions: ["foo", 1]
          }),
        Error
      );
    });

    it('should be an "CopyFieldsRule" object with all specified options', () => {
      const options = {
        tableScope: "raw",
        fieldOptions: ["foo"],
        unsetOptions: ["foo", "bar"]
      };

      const testObj = new CopyFieldsRule(options);

      assert.isObject(testObj);
      assert.deepEqual(testObj, options);
    });
  });
});
