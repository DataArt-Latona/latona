const { assert } = require("chai");

const {
  validateArray,
  validateObject,
  validateTableScope,
  validateFunction,
  validateStringNotEmpty
} = require("../../../src/utils/validation");

const validTableScopesErrorMessage =
  "'tableScope' property must be non-empty string";

describe("utils/validation", () => {
  describe("#validateArray/isArray", () => {
    it("should return false when the value is not specified", () => {
      const { isArray } = validateArray();

      assert.isFalse(isArray, "value is not specified");
    });

    it("should return false when the value is an object", () => {
      const { isArray } = validateArray({});

      assert.isFalse(isArray, "object is not an array");
    });

    it("should return false when the value is a number", () => {
      const { isArray } = validateArray(1);

      assert.isFalse(isArray, "number is not an array");
    });

    it("should return false when the value is a null", () => {
      const { isArray } = validateArray(null);

      assert.isFalse(isArray, "null is not an array");
    });

    it("should return false when the value is a boolean", () => {
      const { isArray } = validateArray(false);

      assert.isFalse(isArray, "boolean is not an array");
    });

    it("should return true when the value is an array", () => {
      const { isArray } = validateArray([]);

      assert.isTrue(isArray, "array is an array");
    });
  });

  describe("#validateArray/isEmptyArray", () => {
    it("should return false when the value is not specified", () => {
      const { isEmptyArray } = validateArray();

      assert.isFalse(isEmptyArray, "value is not specified");
    });

    it("should return false when the value is not an array", () => {
      const { isEmptyArray } = validateArray({});

      assert.isFalse(isEmptyArray, "value is not an array");
    });

    it("should return false when the value is not an empty array", () => {
      const { isEmptyArray } = validateArray([1, 2, 3]);

      assert.isFalse(isEmptyArray, "array is not empty");
    });

    it("should return true when the value is an empty array", () => {
      const { isEmptyArray } = validateArray([]);

      assert.isTrue(isEmptyArray, "array is empty");
    });
  });

  describe("#validateArray/isArrayOfStrings", () => {
    it("should return false when the value is not specified", () => {
      const { isArrayOfStrings } = validateArray();

      assert.isFalse(isArrayOfStrings, "value is not specified");
    });

    it("should return false when the value is not an array", () => {
      const { isArrayOfStrings } = validateArray({});

      assert.isFalse(isArrayOfStrings, "value is not an array");
    });

    it("should return false when the value is not an array of strings", () => {
      const { isArrayOfStrings } = validateArray([1, 2, 3]);

      assert.isFalse(isArrayOfStrings, "value is not an array of strings");
    });

    it("should return true when the value is an array of strings", () => {
      const { isArrayOfStrings } = validateArray(["foo", "bar"]);

      assert.isTrue(isArrayOfStrings, "value is an array of strings");
    });
  });

  describe("#validateObject/isDefined", () => {
    it("should return true if param defined", () => {
      assert.isTrue(validateObject({}).isDefined);
    });
    it("should return false if undefined", () => {
      assert.isFalse(validateObject().isDefined);
      assert.isFalse(validateObject(undefined).isDefined);
    });
  });

  describe("#validateObject/isObject", () => {
    it("should return false when the value is not specified", () => {
      const { isObject } = validateObject();

      assert.isFalse(isObject, "value is not specified");
    });

    it("should return false when the value is an array", () => {
      const { isObject } = validateObject([]);

      assert.isFalse(isObject, "value is an array");
    });

    it("should return false when the value is a number", () => {
      const { isObject } = validateObject(1);

      assert.isFalse(isObject, "value is a number");
    });

    it("should return false when the value is a null", () => {
      const { isObject } = validateObject(null);

      assert.isFalse(isObject, "value is a null");
    });

    it("should return false when the value is a boolean", () => {
      const { isObject } = validateObject(false);

      assert.isFalse(isObject, "value is a boolean");
    });

    it("should return true when the value is an object", () => {
      const { isObject } = validateObject({});

      assert.isTrue(isObject, "value is an object");
    });
  });

  describe("#validateObject/isEmptyObject", () => {
    it("should return false when the value is not specified", () => {
      const { isEmptyObject } = validateObject();

      assert.isFalse(isEmptyObject, "value is not specified");
    });

    it("should return false when the value is not an object", () => {
      const { isEmptyObject } = validateObject([1, 2, 3]);

      assert.isFalse(isEmptyObject, "value is not an object");
    });

    it("should return false when the value is not an empty object", () => {
      const { isEmptyObject } = validateObject({ foo: "bar" });

      assert.isFalse(isEmptyObject, "value is not an empty object");
    });

    it("should return true when the value is an empty object", () => {
      const { isEmptyObject } = validateObject({});

      assert.isTrue(isEmptyObject, "value is an empty object");
    });
  });

  describe("#validateTableScope", () => {
    it("should throw error if value is missing and 'allowEmpty' is set to false", () => {
      assert.throws(
        () => validateTableScope(undefined, false),
        Error,
        validTableScopesErrorMessage
      );
    });

    it("should throw error if value is not a string", () => {
      assert.throws(
        () => validateTableScope({}),
        Error,
        validTableScopesErrorMessage
      );
    });

    it("should throw error if value is not a string", () => {
      assert.throws(
        () => validateTableScope({}),
        Error,
        validTableScopesErrorMessage
      );
    });

    it("should return true if value is a string", () => {
      const result = validateTableScope("dim");

      assert.isTrue(result);
    });
  });

  describe("#validateFunction/isFunction", () => {
    it("should return false if undefined", () => {
      assert.isFalse(validateFunction().isFunction);
    });
    it("should return false if not a function", () => {
      assert.isFalse(validateFunction("foo").isFunction);
      assert.isFalse(validateFunction(123).isFunction);
      assert.isFalse(validateFunction({}).isFunction);
    });
    it("should return true if function", () => {
      assert.isTrue(
        validateFunction(a => {
          return a;
        }).isFunction
      );
    });
  });

  describe("#validateStringNotEmpty", () => {
    it("should return false if string is not defined", () => {
      assert.isFalse(validateStringNotEmpty());
    });
    it("should return false if string is empty", () => {
      assert.isFalse(validateStringNotEmpty(""));
    });
    it("should return true if string is not empty", () => {
      assert.isTrue(validateStringNotEmpty("foo"));
    });
  });
});
