const { assert } = require("chai");

const { Field } = require("../../src/field");

const validateFieldNameErrorMessage = '"fieldName" property must be specified';
const validateOptionsErrorMessage = "Options must be an Object";

describe("field", () => {
  describe("#constructor", () => {
    it("should create field instance with all specified options", () => {
      const options = {
        fieldName: "CustomerField",
        external: "property"
      };

      const table = new Field(options);

      assert.isObject(table);
      assert.deepInclude(table, options);
    });
  });

  describe("#validateFieldName", () => {
    it("should throw error if value is missing", () => {
      assert.throws(
        () => Field.prototype.validateFieldName(),
        Error,
        validateFieldNameErrorMessage
      );
    });

    it("should throw error if value is not a string", () => {
      assert.throws(
        () => Field.prototype.validateFieldName({}),
        Error,
        validateFieldNameErrorMessage
      );
    });

    it("should return true if value is a string", () => {
      const result = Field.prototype.validateFieldName("CustomerField");

      assert.isTrue(result);
    });
  });

  describe("#validateOptions", () => {
    it("should throw error if value is missing", () => {
      assert.throws(
        () => Field.prototype.validateOptions(),
        Error,
        validateOptionsErrorMessage
      );
    });

    it("should throw error if value is not an object", () => {
      assert.throws(
        () => Field.prototype.validateOptions([]),
        Error,
        validateOptionsErrorMessage
      );
    });

    it("should return true if value is an object", () => {
      const result = Field.prototype.validateOptions({});

      assert.isTrue(result);
    });
  });
});
