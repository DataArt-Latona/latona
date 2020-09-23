const { assert } = require("chai");
const { existsSync } = require("fs");
const { ensureDirSync, readFileSync } = require("fs-extra");

const { render, renderAndSave } = require("../../../src/utils/template");

const { removeFile, removeDirectory } = require("../../utils");

const testOutputFolder = "test/output/template.spec";

const testInputFile = "test/mocks/template.spec/template.mustache";
const testOutputFile = "test/output/template.spec/template.txt";
const testPartialPath = "test/mocks/template.spec/partial.mustache";

const modelNotSpecifiedMessage = "Model is not specified.";
const modelSpecifiedMessage = "Model is specified.";
const paramsMessage = "Param renders correctly!";
const partialMessage = "Partial renders correctly!";

const renderErrorMessage = `"filePath" param is required`;

const modelWithParamsMessage = `${modelSpecifiedMessage} ${paramsMessage}`;
const modelWithParamsAndPartialsMessage = `${modelWithParamsMessage} ${partialMessage}`;

const removeSpacesAndLineBreaks = string => {
  return string
    .trim() // remove spaces
    .replace(/\r?\n|\r/g, " "); // replace template line breaks with spaces
};

describe("utils/template", () => {
  before(() => {
    ensureDirSync(testOutputFolder);
  });

  after(() => {
    removeDirectory(testOutputFolder);
  });

  describe("#render", () => {
    it("should not render *.mustache template and throw an error", () => {
      assert.throws(() => render(), Error, renderErrorMessage);
    });

    it("should render *.mustache template without model param and return result as a string", () => {
      const result = render(testInputFile);

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");
      assert.strictEqual(formattedResult, modelNotSpecifiedMessage);
    });

    it("should render *.mustache template with model param and return result as a string", () => {
      const model = { dataSet: { paramsMessage } };

      const result = render(testInputFile, model);

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");
      assert.strictEqual(formattedResult, modelWithParamsMessage);
    });

    it("should render *.mustache template with model and partial params and return result as a string", () => {
      const model = { dataSet: { paramsMessage, partialMessage } };

      const partials = {
        partial: "{{partialMessage}}"
      };

      const result = render(testInputFile, model, partials);

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");
      assert.strictEqual(formattedResult, modelWithParamsAndPartialsMessage);
    });
  });

  describe("#renderAndSave", () => {
    beforeEach(() => {
      removeFile(testOutputFile);
    });

    after(() => {
      removeFile(testOutputFile);
    });

    it("should not render and should not save *.mustache template and throw an error", () => {
      assert.throws(() => renderAndSave(), Error, renderErrorMessage);
    });

    it("should render *.mustache template without model param and save result in output file", () => {
      renderAndSave(testInputFile, {}, [], testOutputFile);

      assert.isTrue(existsSync(testOutputFile), "test file saved");
    });

    it("should render *.mustache template without model param and save result content in output file", () => {
      renderAndSave(testInputFile, {}, [], testOutputFile);

      const result = readFileSync(testOutputFile, "utf8");

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");
      assert.strictEqual(formattedResult, modelNotSpecifiedMessage);
    });

    it("should render *.mustache template with model param and save result content in output file", () => {
      const model = { dataSet: { paramsMessage } };

      renderAndSave(testInputFile, model, [], testOutputFile);

      const result = readFileSync(testOutputFile, "utf8");

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");
      assert.strictEqual(formattedResult, modelWithParamsMessage);
    });

    it("should render *.mustache template with model and partial params and save result content in output file", () => {
      const model = { dataSet: { paramsMessage } };

      const partials = [
        {
          name: "partial",
          path: testPartialPath
        }
      ];

      renderAndSave(testInputFile, model, partials, testOutputFile);

      const result = readFileSync(testOutputFile, "utf8");

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(result, "result is a string");
      assert.strictEqual(formattedResult, modelWithParamsAndPartialsMessage);
    });
  });
});
