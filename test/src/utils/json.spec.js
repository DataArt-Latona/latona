const { assert } = require("chai");
const { existsSync } = require("fs");
const { ensureDirSync, readFileSync } = require("fs-extra");

const { removeFile, removeDirectory } = require("../../utils");

const testOutputFolder = "test/output/json.spec";

const removeSpacesAndLineBreaks = string => {
  return string
    .replace(/\s/g, "") // remove all spaces
    .replace(/\r?\n|\r/g, " "); // replace template line breaks with spaces
};

const {
  jsonStringify,
  jsonStringifyAndSave
} = require("../../../src/utils/json");

const testObj = {
  foo: "bar"
};

// circular objects cause errors while trying to `JSON.stringify` them;
// we use such object in order to check `throw error` statement
const circularObject = { name: "Groucho" };
const b = { name: "Harpo", sibling: circularObject };
circularObject.sibling = b;

const testOutputFile = "test/output/json.spec/test.json";

describe("utils/json", () => {
  before(() => {
    ensureDirSync(testOutputFolder);
  });

  after(() => {
    removeDirectory(testOutputFolder);
  });

  describe("#jsonStringify", () => {
    it("should not stringify json and throw an error", () => {
      assert.throws(
        () => jsonStringify(circularObject),
        TypeError,
        "Converting circular structure to JSON"
      );
    });

    it("should return undefined", () => {
      assert.isUndefined(jsonStringify());
    });

    it("should stringify json and return result as a string", () => {
      const result = jsonStringify(testObj, null, 0);

      assert.strictEqual(
        result,
        JSON.stringify(testObj),
        "stringified objects are equal"
      );
    });
  });

  describe("#jsonStringifyAndSave", () => {
    beforeEach(() => {
      removeFile(testOutputFile);
    });

    after(() => {
      removeFile(testOutputFile);
    });

    it("should throw an error when we do not specify output file", () => {
      assert.throws(
        () => jsonStringifyAndSave(),
        Error,
        `"outFilePath" param is required`
      );
    });

    it("should throw an error when we try to convert circular structure to JSON", () => {
      assert.throws(
        () => jsonStringifyAndSave(circularObject, testOutputFile),
        TypeError,
        `Converting circular structure to JSON`
      );
    });

    it("should stringify json and save result in output file", () => {
      jsonStringifyAndSave(testObj, testOutputFile);

      assert.isTrue(existsSync(testOutputFile), "test file saved");
    });

    it("should stringify json and save result content in output file", () => {
      jsonStringifyAndSave(testObj, testOutputFile);

      const result = readFileSync(testOutputFile, "utf8");

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");

      assert.strictEqual(
        formattedResult,
        JSON.stringify(testObj),
        "stringified objects are equal"
      );
    });
  });
});
