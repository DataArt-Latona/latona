const { assert } = require("chai");
const { ensureDir } = require("fs-extra");

const { removeSpacesAndLineBreaks, removeDirectory } = require("./utils");

const { extras } = require("../");
const { logger } = require("../src/utils/winstonLogger");

const testOutputFolder = "./test/output/latona.spec";

const modelSpecifiedMessage = "Model is specified.";
const paramsMessage = "Param renders correctly!";
const modelWithParamsMessage = `${modelSpecifiedMessage} ${paramsMessage}`;

describe("latona extras", () => {
  before(async () => {
    await ensureDir(testOutputFolder);
  });
  beforeEach(() => {
    logger.destroy();
  });
  after(async () => {
    logger.destroy();
    await removeDirectory(testOutputFolder);
  });

  describe("#renderTemplate", () => {
    it("should render specified template", async () => {
      const pathToTemplate = "./test/mocks/latona.spec/template.mustache";
      const model = { dataSet: { paramsMessage } };

      const result = await extras.renderTemplate(pathToTemplate, model);

      const formattedResult = removeSpacesAndLineBreaks(result);

      assert.isString(formattedResult);
      assert.strictEqual(formattedResult, modelWithParamsMessage);
    });
  });
});
