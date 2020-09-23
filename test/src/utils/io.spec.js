const { assert } = require("chai");
const { ensureDirSync, writeFileSync } = require("fs-extra");

const { removeFile, removeDirectory } = require("../../utils");

const {
  stripBom,
  readTxtFile,
  readJSONFile
} = require("../../../src/utils/io");

const testOutputFolder = "test/output/io.spec";

const textFileWithBOM = "test/output/io.spec/text-file-with-BOM.txt";
const jsonFileWithBOM = "test/output/io.spec/json-file-with-BOM.json";

const stripBomErrorMessage = `"content" param is required and must be a string or a Buffer`;
const readTxtFileErrorMessage = `"filePath" param is required`;

const testTextFileContent = `Hello, world!`;
const testJSONFileObject = { hello: "world" };

const BOM = `\uFEFF`;
const bufferWithBOM = Buffer.from(`${BOM}${testTextFileContent}`);

const createFileWithBOM = (
  filePath,
  content,
  options = { encoding: "utf8" }
) => {
  writeFileSync(filePath, `${BOM}${content}`, options);
};

describe("utils/io", () => {
  before(() => {
    ensureDirSync(testOutputFolder);
  });

  after(() => {
    removeDirectory(testOutputFolder);
  });

  describe("#stripBom", () => {
    it("should strip BOM when value is a string", () => {
      const string = bufferWithBOM.toString("utf8");
      const result = stripBom(string);

      assert.isString(result, "result is a string");
      assert.strictEqual(result, "Hello, world!");

      // existence of BOM can be checked only with buffers 'cause
      // coercion to string doesn't show BOM bytes
      assert.notDeepEqual(Buffer.from(result), bufferWithBOM);
    });

    it("should strip BOM when value is a Buffer", () => {
      const result = stripBom(bufferWithBOM);

      assert.isString(result, "result is a string");
      assert.strictEqual(result, "Hello, world!");

      // existence of BOM can be checked only with buffers 'cause
      // coercion to string doesn't show BOM bytes
      assert.notDeepEqual(Buffer.from(result), bufferWithBOM);
    });

    it("should throw an error when value is an array", () => {
      assert.throws(() => stripBom([]), Error, stripBomErrorMessage);
    });

    it("should throw an error when value is an object", () => {
      assert.throws(() => stripBom({}), Error, stripBomErrorMessage);
    });

    it("should throw an error when value is null", () => {
      assert.throws(() => stripBom(null), Error, stripBomErrorMessage);
    });

    it("should throw an error when value is missing", () => {
      assert.throws(() => stripBom(), Error, stripBomErrorMessage);
    });
  });

  describe("#readTxtFile", () => {
    before(() => {
      // create text file with BOM
      createFileWithBOM(textFileWithBOM, testTextFileContent);
    });

    after(() => {
      // remove text file with BOM
      removeFile(textFileWithBOM);
    });

    it("should throw an error when value is missing", () => {
      assert.throws(() => readTxtFile(), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is null", () => {
      assert.throws(() => readTxtFile(null), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is an array", () => {
      assert.throws(() => readTxtFile([]), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is an object", () => {
      assert.throws(() => readTxtFile({}), Error, readTxtFileErrorMessage);
    });

    it("should read text file and return result as a string", () => {
      const result = readTxtFile(textFileWithBOM);

      assert.isString(result, "result is a string");
      assert.strictEqual(result, "Hello, world!");
    });

    it("should throw an error when value is a path that does not exist", () => {
      assert.throws(() => readTxtFile("/path/that/not/exists.json"), Error);
    });

    it("should read text file and return result as a string without BOM", () => {
      const result = readTxtFile(textFileWithBOM);

      assert.isString(result, "result is a string");

      // existence of BOM can be checked only with buffers 'cause
      // coercion to string doesn't show BOM bytes
      assert.notDeepEqual(Buffer.from(result), bufferWithBOM);
    });
  });

  describe("#readJSONFile", () => {
    before(() => {
      // create json file with BOM
      createFileWithBOM(
        jsonFileWithBOM,
        JSON.stringify(testJSONFileObject, null, 2)
      );
    });

    after(() => {
      // remove json file with BOM
      removeFile(jsonFileWithBOM);
    });
    it("should throw an error when value is missing", () => {
      assert.throws(() => readJSONFile(), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is null", () => {
      assert.throws(() => readJSONFile(null), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is an array", () => {
      assert.throws(() => readJSONFile([]), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is an object", () => {
      assert.throws(() => readJSONFile({}), Error, readTxtFileErrorMessage);
    });

    it("should throw an error when value is a path that does not exist", () => {
      assert.throws(() => readJSONFile("/path/that/not/exists.json"), Error);
    });

    it("should read text file and return result as a plain JS object", () => {
      const result = readJSONFile(jsonFileWithBOM);

      assert.deepEqual(result, testJSONFileObject);
    });
  });
});
