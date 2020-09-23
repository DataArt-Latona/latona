/* eslint-disable no-console */
const { assert } = require("chai");
const path = require("path");
const process = require("process");
const {
  ensureDirSync,
  readJSONSync,
  writeJSONSync,
  readFileSync,
  existsSync
} = require("fs-extra");
const fs = require("fs");
const { CommanderError } = require("commander");
const { removeDirectory } = require("../utils");
const cli = require("../../bin/latona-cli");
const { deepClone } = require("../../src/utils/object");

const cliScript = "../../bin/latona-cli.js";
const testOutputFolder = "./test/output/latona-cli.spec";

const jsonFilePaths = {
  modelSample: "./examples/model/sample-model.json",
  modelBlank: "./examples/model/blank-model.json",
  projectSample: "./examples/project/sample-project.json",
  projectBlank: "./examples/project/blank-project.json",
  mockProject: "./test/mocks/latona-cli.spec/testProject_withLogger.json"
};

const addonSamplePath = "./examples/addon/sample-addon.js";

const errorMessages = {
  modelFileExists: /model file .+, use --force to overwrite/,
  modelFileMissing: /Failed to load project: Error: Can't find file .+/,
  projectFileExists: /project file .+ already exists, use --force to overwrite/,
  projectFileMissing: /project file .+ doesn't exist/,
  renderFailed: "Render failed",
  validationFailed: "Validation failed",
  fileExists: /File .+ already exists/
};

function execCli(argv) {
  const stdoutStrings = [];
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stdout.write.bind(process.stdout);

  // hijacking stdout for further output analysis
  process.stdout.write = (chunk, encoding, callback) => {
    if (typeof chunk === "string") {
      stdoutStrings.push(chunk);
    }
  };

  process.stderr.write = (chunk, encoding, callback) => {
    if (typeof chunk === "string") {
      stdoutStrings.push(chunk);
    }
  };

  const arg = ["node", path.resolve(process.cwd(), cliScript)].concat(argv);
  const exitInfo = {};

  try {
    cli(arg, true, ei => {
      throw ei;
    });
  } catch (err) {
    if (err instanceof CommanderError) {
      exitInfo.commanderErr = err;
    } else {
      throw err;
    }
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
    exitInfo.stdoutStrings = stdoutStrings;
  }

  return exitInfo;
}

function getOutFileName(fn) {
  return path.join(testOutputFolder, fn);
}

describe("latona-cli", () => {
  const filesContent = {};

  before(() => {
    Object.entries(jsonFilePaths).forEach(([k, v]) => {
      filesContent[k] = readJSONSync(v);
    });
  });

  beforeEach(() => {
    ensureDirSync(testOutputFolder);
  });

  afterEach(() => {
    removeDirectory(testOutputFolder);
  });

  describe("cli", () => {
    it("should print help if requested", () => {
      let exitInfo;

      assert.doesNotThrow(() => {
        exitInfo = execCli(["-h"]);
      });

      assert.isDefined(exitInfo);
      assert.isDefined(exitInfo.commanderErr);
      assert.equal(exitInfo.commanderErr.exitCode, 0);
      const helpLines = exitInfo.stdoutStrings.filter(s => s.includes("help"));
      assert.lengthOf(helpLines, 2);
    });
    it("should refer to help if wrong command", () => {
      let exitInfo;

      assert.doesNotThrow(() => {
        exitInfo = execCli(["foo"]);
      });

      assert.equal(exitInfo.commanderErr.exitCode, 1);
      assert.isTrue(
        exitInfo.stdoutStrings.some(s => s.includes("latona [command] -h"))
      );
      assert.isTrue(
        exitInfo.stdoutStrings.some(s =>
          s.includes("error: unknown command 'foo'.")
        )
      );
    });
  });
  describe("#doNewModel", () => {
    it("should create sample model by default", () => {
      const mf = getOutFileName("ms.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf]);
      });

      assert.isTrue(existsSync(mf));

      const mfContent = readJSONSync(mf);
      assert.deepEqual(mfContent, filesContent.modelSample);
    });
    it("should create blank model if asked", () => {
      const mf = getOutFileName("mb.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf, "-b"]);
      });

      assert.isTrue(existsSync(mf));

      const mfContent = readJSONSync(mf);
      assert.deepEqual(mfContent, filesContent.modelBlank);
    });
    it("should fail if model file exists (not forced)", () => {
      const mf = getOutFileName("mb.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf]);
      });

      assert.isTrue(existsSync(mf));

      assert.throws(
        () => {
          execCli(["new", "model", "-m", mf]);
        },
        Error,
        errorMessages.modelFileExists
      );
    });
    it("should overwrite model if forced", () => {
      const mf = getOutFileName("m.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf]);
        execCli(["new", "model", "-m", mf, "-b", "-f"]);
      });

      assert.isTrue(existsSync(mf));

      const mfContent = readJSONSync(mf);
      assert.deepEqual(mfContent, filesContent.modelBlank);
    });
  });
  describe("#doNewProject", () => {
    it("should fail if model file doesn't exists", () => {
      const pf = getOutFileName("p0.json");
      assert.throws(
        () => {
          execCli([
            "new",
            "project",
            "-p",
            pf,
            "-m",
            "./non/existing/model.json"
          ]);
        },
        Error,
        errorMessages.modelFileMissing
      );

      assert.isFalse(existsSync(pf));
    });

    it("should create sample project by default", () => {
      const mfRelative = "./model.json";
      const mf = getOutFileName(mfRelative);
      const pf = getOutFileName("p1.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf]);
        execCli(["new", "project", "-p", pf, "-m", mfRelative]);
      });

      assert.isTrue(existsSync(mf));
      assert.isTrue(existsSync(pf));

      const pfContent = readJSONSync(pf);
      assert.deepEqual(pfContent, filesContent.projectSample);
    });
    it("should create blank project if asked", () => {
      const mfRelative = "./model-blank.json";
      const mf = getOutFileName(mfRelative);
      const pf = getOutFileName("p2.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf, "-b"]);
        execCli(["new", "project", "-p", pf, "-m", mfRelative, "-b"]);
      });

      assert.isTrue(existsSync(mf));
      assert.isTrue(existsSync(pf));

      const pfContent = readJSONSync(pf);
      const expectedProjContent = deepClone(filesContent.projectBlank);
      expectedProjContent.model = mfRelative;
      assert.deepEqual(pfContent, expectedProjContent);
    });
    it("should fail if project file exists (not forced)", () => {
      const mfRelative = "./model.json";
      const mf = getOutFileName(mfRelative);
      const pf = getOutFileName("p3.json");

      assert.throws(
        () => {
          execCli(["new", "model", "-m", mf]);
          execCli(["new", "project", "-p", pf, "-m", mfRelative]);
          execCli(["new", "project", "-p", pf, "-m", mfRelative, "-b"]);
        },
        Error,
        errorMessages.projectFileExists
      );

      assert.isTrue(existsSync(mf));
      assert.isTrue(existsSync(pf));

      const pfContent = readJSONSync(pf);
      assert.deepEqual(pfContent, filesContent.projectSample);
    });
    it("should overwrite project if forced", () => {
      const mfRelative = "./m4.json";
      const mf = getOutFileName(mfRelative);
      const pf = getOutFileName("p4.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf]);
        execCli(["new", "project", "-p", pf, "-m", mfRelative]);
        execCli([
          "new",
          "project",
          "-p",
          pf,
          "-m",
          mfRelative,
          "-b",
          "--force"
        ]);
      });

      assert.isTrue(existsSync(mf));
      assert.isTrue(existsSync(pf));

      const pfContent = readJSONSync(pf);
      const expectedProjContent = deepClone(filesContent.projectBlank);
      expectedProjContent.model = mfRelative;
      assert.deepEqual(pfContent, expectedProjContent);
    });
  });
  describe("#doNewAddon", () => {
    it("should fail if addon file exists", () => {
      const af = getOutFileName("foo.js");

      assert.doesNotThrow(() => {
        execCli(["new", "addon", "-a", af]);
      });

      assert.throws(
        () => {
          execCli(["new", "addon", "-a", af]);
        },
        Error,
        errorMessages.fileExists
      );
    });
    it("should create sample addon", () => {
      const af = getOutFileName("foo.js");

      assert.doesNotThrow(() => {
        execCli(["new", "addon", "-a", af]);
      });

      assert.isTrue(existsSync(af));
      const addonContent = readFileSync(af, "utf-8");
      const originalAddonContent = readFileSync(addonSamplePath, "utf-8");
      assert.equal(originalAddonContent, addonContent);
    });
    it("should add .js if file name does not end with .js", () => {
      const af = getOutFileName("bar.js");
      const afNoExt = getOutFileName("bar");

      assert.doesNotThrow(() => {
        execCli(["new", "addon", "-a", afNoExt]);
      });

      assert.isTrue(existsSync(af));
      const addonContent = readFileSync(af, "utf-8");
      const originalAddonContent = readFileSync(addonSamplePath, "utf-8");
      assert.equal(originalAddonContent, addonContent);
    });
  });
  describe("#doRender", () => {
    it("should fail if project file doesn't exists", () => {
      const pf = getOutFileName("p3.json");

      assert.throws(
        () => {
          execCli(["render", "-p", pf]);
        },
        Error,
        errorMessages.projectFileMissing
      );
    });
    it("should fail if rendering fails", () => {
      const mfRelative = "./model.json";
      const mf = getOutFileName(mfRelative);
      const pf = getOutFileName("p3.json");

      assert.throws(
        () => {
          execCli(["new", "model", "-m", mf, "-b"]);
          execCli(["new", "project", "-p", pf, "-m", mfRelative]);
          const modelContent = readJSONSync(mf);
          modelContent.tables = "foo";
          writeJSONSync(mf, modelContent);
          execCli(["render", "-p", pf]);
        },
        Error,
        errorMessages.renderFailed
      );
    });
    it("should load project and execute rendering", () => {
      const pf = jsonFilePaths.mockProject;

      assert.doesNotThrow(() => {
        execCli(["render", "-p", pf]);
      });

      [
        "./tables.txt",
        "./template.txt",
        "./preprocess01.json",
        "./preprocess02.json"
      ].forEach(f => {
        assert.isTrue(existsSync(getOutFileName(f)));
      });

      const tableFieldLines = fs
        .readFileSync(getOutFileName("./tables.txt"), "utf-8")
        .split("\n");

      assert.lengthOf(tableFieldLines, 55);
    });
  });
  describe("#doValidate", () => {
    it("should load project and access transformed model", () => {
      const pf = jsonFilePaths.mockProject;

      let execInfo;

      assert.doesNotThrow(() => {
        execInfo = execCli(["validate", "-p", pf]);
      });

      assert.isDefined(execInfo);
      assert.isDefined(execInfo);
      assert.isTrue(
        execInfo.stdoutStrings.some(s =>
          s.includes("Project seems to be valid")
        )
      );
    });
    it("should fail if project file doesn't exists", () => {
      const pf = getOutFileName("p3.json");

      assert.throws(
        () => {
          execCli(["validate", "-p", pf]);
        },
        Error,
        errorMessages.projectFileMissing
      );
    });
    it("should fail if model file doesn't exists", () => {
      const mfRelative = "./model.json";
      const mf = getOutFileName(mfRelative);
      const pf = getOutFileName("latona.json");

      assert.doesNotThrow(() => {
        execCli(["new", "model", "-m", mf]);
        execCli(["new", "project", "-p", pf, "-m", mfRelative]);
        fs.unlinkSync(mf);
      });

      assert.throws(
        () => {
          execCli(["validate", "-p", pf]);
        },
        Error,
        errorMessages.validationFailed
      );
    });
  });
});
