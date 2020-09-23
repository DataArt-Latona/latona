/* eslint-disable no-new */
const { assert } = require("chai");
const path = require("path");
const process = require("process");
const { ensureDirSync, readJSONSync, writeJSONSync } = require("fs-extra");
const fs = require("fs");
const { removeSpacesAndLineBreaks, removeDirectory } = require("../utils");
const { LatonaAddon, LatonaProject, AddonModuleReference } = require("../../");
const { Model } = require("../../src/model");
const { logger } = require("../../src/utils/winstonLogger");

const testOutputFolder = "./test/output/latona-project.spec";

const errorMessages = {
  badModelFileName: `"modelFileName" should be non-empty string`,
  cantFindFile: "Can't find file",
  badRefObject: `"reference" should be an object`,
  badModuleName: `"moduleName" should be non-empty string`,
  badOptions: `"options" should be an object if defined`,
  failedLoadModule: "Failed to load module",
  noCreateFunction: "Addon module is expected to export `create` function",
  createdUnexpected: "create hasn't returned",
  createFailed: "Failed to create addon object",
  badProjectFileName: `"projectFileName" should be non-empty string`,
  combinedPathNotExists: "Combined path doesn't exist",
  badProjModel: `"project.model" should be non-empty string`,
  badProjectPath: `"projectPath" should be non-empty string`,
  addonsShouldBeArray: `"project.addons" should be array`,
  failedLoadModel: "Failed to load model from file",
  failedLoadProject: "Failed to load project",
  failedSaveProject: "Failed to save project",
  badAddonModuleReference:
    "addonModuleReference should be an instance of AddonModuleReference",
  badModelTransformFunction:
    "model transformation is expected to be a function",
  renderFailedPreprocessingFailed:
    "Render failed: Error: Pre-processing task failed",
  renderFailedPreprocessingNotFunc:
    "Render failed: Error: Pre-processing task is expected to be a function"
};

// all paths are relative to project root folder as they will be resolved
// against cwd (unless we specify project path explicitly)
const projectTestData = {
  testProjectPath: "./test/mocks/latona-project.spec/",
  testProject: "./test/mocks/latona-project.spec/testProject.json",
  testProject_withLogger:
    "./test/mocks/latona-project.spec/testProject_withLogger.json",
  testProject_bad: "./test/mocks/latona-project.spec/testProject_bad.json",
  testProject_empty: "./test/mocks/latona-project.spec/testProject_empty.json",
  testAddon_01: "./testAddon_01.js",
  testAddon_02: "./testAddon_02.js",
  testAddon_03: "./testAddon_03.js",
  notProject: "./test/mocks/latona-project.spec/notProject.txt",
  // model path is always relative to project path
  testModel: "./model.json",
  testBadModel: "./test/mocks/latona-project.spec/badModel.json"
};

// all paths are relative to project root folder as they will be resolved
// against cwd
const testAddonModules = {
  notAddon: "./test/mocks/latona-project.spec/notAddon_noCreate.js",
  badCreateBadReturn:
    "./test/mocks/latona-project.spec/testAddon_badCreateBadReturn.js",
  badCreateFailing:
    "./test/mocks/latona-project.spec/testAddon_badCreateFailing.js",
  badCreateNoReturn:
    "./test/mocks/latona-project.spec/testAddon_badCreateNoReturn.js",
  testAddonSimple: "./test/mocks/latona-project.spec/testAddon_simple.js",
  testAddonSimpleNoExtension:
    "./test/mocks/latona-project.spec/testAddon_simple"
};

const modelSpecifiedMessage = "Model is specified.";
const paramsMessage = "Param renders correctly!";
const modelWithParamsMessage = `${modelSpecifiedMessage} ${paramsMessage}`;
const preProcContent = `{"modelFileName":"./model.json"}`;

describe("latona-project", () => {
  describe("#constructor", () => {
    it("should fail if modelFileName is not a string", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = new LatonaProject(
            { foo: "bar" },
            projectTestData.testProjectPath
          );
        },
        Error,
        errorMessages.badModelFileName
      );
    });
    it("should fail if file doesn't exist", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = new LatonaProject(
            "./model/file/does/not/exist.json",
            projectTestData.testProjectPath
          );
        },
        Error,
        errorMessages.cantFindFile
      );
    });
    it("should fail if projectPath is not provided", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = new LatonaProject(projectTestData.testProject);
        },
        Error,
        errorMessages.badProjectPath
      );
    });
    it("should copy file name to properties", () => {
      const proj = new LatonaProject(
        projectTestData.testProject,
        process.cwd()
      );
      const projBad = new LatonaProject(
        projectTestData.testProject_bad,
        process.cwd()
      );

      assert.equal(proj.modelFileName, projectTestData.testProject);
      assert.equal(projBad.modelFileName, projectTestData.testProject_bad);
    });
    it("should create an empty array property for addon references", () => {
      const proj = new LatonaProject(
        projectTestData.testModel,
        projectTestData.testProjectPath
      );

      assert.isArray(proj.addonModuleReferences);
      assert.isEmpty(proj.addonModuleReferences);
    });
  });
  describe("#load", () => {
    it("should fail if model file name is not a string", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.load({ model: { foo: "bar" } });
        },
        Error,
        errorMessages.badProjModel
      );
    });
    it("should fail if model file doesn't exist", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.load({
            model: "./model/file/does/not/exist.json",
            addons: []
          });
        },
        Error,
        errorMessages.cantFindFile
      );
    });
    it("should fail if addons is not array", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.load({
            model: projectTestData.testModel
          });
        },
        Error,
        errorMessages.addonsShouldBeArray
      );
    });
    it("should fail if addon references is invalid", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.load(
            {
              model: projectTestData.testModel,
              addons: [
                {
                  moduleName: "foobar"
                }
              ]
            },
            projectTestData.testProjectPath
          );
        },
        Error,
        errorMessages.failedLoadModule
      );
    });
    it("should return LatonaProject", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_01,
              options: {}
            },
            {
              moduleName: projectTestData.testAddon_02,
              options: {}
            }
          ]
        },
        projectTestData.testProjectPath
      );

      assert.instanceOf(proj, LatonaProject);
      assert.equal(proj.modelFileName, projectTestData.testModel);
      assert.isArray(proj.addonModuleReferences);
      assert.lengthOf(proj.addonModuleReferences, 2);
      assert.isObject(proj.addonModuleReferences[0]);
      assert.equal(
        proj.addonModuleReferences[0].moduleName,
        projectTestData.testAddon_01
      );
      assert.isObject(proj.addonModuleReferences[0].options);
      assert.isObject(proj.addonModuleReferences[1]);
      assert.equal(
        proj.addonModuleReferences[1].moduleName,
        projectTestData.testAddon_02
      );
      assert.isObject(proj.addonModuleReferences[1].options);
    });
  });
  describe("#loadFromFile", () => {
    it("should fail if projectFileName is not a string", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.loadFromFile({ foo: "bar" });
        },
        Error,
        errorMessages.badProjectFileName
      );
    });
    it("should fail if file doesn't exist", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.loadFromFile(
            "./project/file/does/not/exist.json"
          );
        },
        Error,
        errorMessages.cantFindFile
      );
    });
    it("should fail if file doesn't contain latona project json", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.loadFromFile(projectTestData.notProject);
        },
        Error,
        errorMessages.failedLoadProject
      );
    });
    it("should fail if project file is empty", () => {
      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const proj = LatonaProject.loadFromFile(
            projectTestData.testProject_empty
          );
        },
        Error,
        errorMessages.failedLoadProject
      );
    });
    it("should return LatonaProject", () => {
      const proj = LatonaProject.loadFromFile(projectTestData.testProject);

      assert.instanceOf(proj, LatonaProject);
      assert.equal(proj.modelFileName, projectTestData.testModel);
      assert.isArray(proj.addonModuleReferences);
      assert.lengthOf(proj.addonModuleReferences, 2);
      assert.isObject(proj.model);
    });
  });
  describe("#saveToFile", () => {
    before(() => {
      ensureDirSync(testOutputFolder);
    });

    after(() => {
      removeDirectory(testOutputFolder);
    });

    it("should fail if file cannot be created", () => {
      assert.throws(
        () => {
          const proj = LatonaProject.loadFromFile(projectTestData.testProject);
          proj.saveToFile("Drive:/not/existing/path/project.json");
        },
        Error,
        errorMessages.failedSaveProject
      );
    });
    it("should create file with project JSON", () => {
      const targetFile = `${testOutputFolder}/testProj.json`;
      const proj = LatonaProject.loadFromFile(projectTestData.testProject);
      proj.saveToFile(targetFile);

      const originalJson = readJSONSync(projectTestData.testProject);
      const targetJson = readJSONSync(targetFile);

      assert.deepEqual(targetJson, originalJson);
    });
    it("should overwrite file if it exists", () => {
      const targetFile = `${testOutputFolder}/testProj_overwritten.json`;
      writeJSONSync(targetFile, { foo: "bar" });

      assert.isTrue(fs.existsSync(targetFile));

      const proj = LatonaProject.loadFromFile(projectTestData.testProject);
      proj.saveToFile(targetFile);

      const originalJson = readJSONSync(projectTestData.testProject);
      const targetJson = readJSONSync(targetFile);

      assert.deepEqual(targetJson, originalJson);
    });
  });
  describe("#addAddon", () => {
    it("should fail if addon reference is not LatonaAddonReference", () => {
      const proj = new LatonaProject(
        projectTestData.testModel,
        projectTestData.testProjectPath
      );

      assert.throws(
        () => {
          proj.addAddon("foo");
        },
        Error,
        errorMessages.badAddonModuleReference
      );
      assert.throws(
        () => {
          proj.addAddon({ foo: "bar" });
        },
        Error,
        errorMessages.badAddonModuleReference
      );
    });
    it("adds addon module reference to property", () => {
      const proj = new LatonaProject(
        projectTestData.testModel,
        projectTestData.testProjectPath
      );
      const addonRef = new AddonModuleReference(
        {
          moduleName: testAddonModules.testAddonSimple
        },
        process.cwd()
      );

      proj.addAddon(addonRef);

      assert.isArray(proj.addonModuleReferences);
      assert.lengthOf(proj.addonModuleReferences, 1);
      assert.equal(
        proj.addonModuleReferences[0].moduleName,
        testAddonModules.testAddonSimple
      );
    });
  });
  describe("#model", () => {
    it("should fail if model file can't be read", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: []
        },
        projectTestData.testProjectPath
      );

      proj.modelFileName = `${testOutputFolder}/proj/does/not/exists.json`;

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const m = proj.model;
        },
        Error,
        errorMessages.failedLoadModel
      );
    });
    it("should fail if file doesn't contain compatible object", () => {
      const proj = LatonaProject.load({
        model: projectTestData.testBadModel,
        addons: []
      });

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const m = proj.model;
        },
        Error,
        errorMessages.failedLoadModel
      );
    });
    it("should return an instance of Model", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: []
        },
        projectTestData.testProjectPath
      );

      assert.isUndefined(proj.getModelInternal);
      const m = proj.model;
      assert.instanceOf(m, Model);
      assert.isFunction(proj.getModelInternal);

      // 2nd call - internal function exists
      const m2 = proj.model;
      assert.instanceOf(m2, Model);
    });
  });

  describe("#transformedModel", () => {
    it("should fail if original model is unavailable", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: []
        },
        projectTestData.testProjectPath
      );

      proj.modelFileName = `${testOutputFolder}/proj/does/not/exists.json`;

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const m = proj.transformedModel;
        },
        Error,
        errorMessages.failedLoadModel
      );
    });
    it("should fail if 'end' model transform is not a function", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_01
            }
          ]
        },
        projectTestData.testProjectPath
      );

      // simulating broken project
      assert.isArray(proj.addonModuleReferences);
      assert.lengthOf(proj.addonModuleReferences, 1);
      const addonObj = proj.addonModuleReferences[0].getAddonObject();
      addonObj.endModelTransformations[0] = { foo: "bar" };

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const m = proj.transformedModel;
        },
        Error,
        errorMessages.badModelTransformFunction
      );
    });
    it("should fail if 'start' model transform is not a function", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_01
            }
          ]
        },
        projectTestData.testProjectPath
      );

      // simulating broken project
      assert.isArray(proj.addonModuleReferences);
      assert.lengthOf(proj.addonModuleReferences, 1);
      const addonObj = proj.addonModuleReferences[0].getAddonObject();
      addonObj.startModelTransformations[0] = { foo: "bar" };

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          const m = proj.transformedModel;
        },
        Error,
        errorMessages.badModelTransformFunction
      );
    });
    it("transformed model should have model transformation applied", () => {
      const proj = LatonaProject.loadFromFile(projectTestData.testProject);
      const trModel = proj.transformedModel;
      assert.equal(trModel.transformFlag01, "set");
      assert.equal(trModel.transformFlag02, "set");
      assert.equal(trModel.transformFlag, "02");
    });
    it("should return a properly transformed instance of Model", () => {
      const proj = LatonaProject.loadFromFile(projectTestData.testProject);
      const trModel = proj.transformedModel;

      const assertTableInternals = t => {
        assert.isArray(t.fields);
        assert.isNotEmpty(t.fields);

        // any table should have mixin introduced by second addon
        assert.isFunction(t.alwaysTrue);
        assert.isTrue(t.alwaysTrue());

        // field-level mixins
        t.fields.forEach(f => {
          assert.isFunction(f.testIsPublic);

          // field-level filter for mixin
          if (f.options && f.options.isPublic) {
            assert.isTrue(f.testIsPublic());
          } else {
            assert.isFalse(f.testIsPublic());
          }

          // table-level filter for mixin
          if (t.tableScope === "dim") {
            assert.isFunction(f.testIsPublic02);
          } else {
            assert.isUndefined(f.testIsPublic02);
          }
        });
      };

      assert.instanceOf(trModel, Model);
      assert.isArray(trModel.tables);
      assert.isArray(trModel.sourceDataSets);
      assert.isNotEmpty(trModel.tables);
      assert.isNotEmpty(trModel.sourceDataSets);
      assert.lengthOf(trModel.tables, 5); // 4 in model + 1 in testAddon_01
      assert.lengthOf(trModel.sourceDataSets, 2);
      assert.isFunction(trModel.testDimTables);
      assert.isFunction(trModel.testFactTables);
      assert.lengthOf(trModel.testDimTables(), 2);
      assert.lengthOf(trModel.testFactTables(), 1);
      trModel.tables
        .filter(t => t.tableScope === "dim")
        .forEach(t => {
          assert.isFunction(t.testIsDim);
          assert.isFunction(t.testIsFact);
          assert.isTrue(t.testIsDim());
          assert.isFalse(t.testIsFact());
          assert.isUndefined(t.testIsDim02);
          assertTableInternals(t);
        });
      trModel.tables
        .filter(t => t.tableScope === "fact")
        .forEach(t => {
          assert.isFunction(t.testIsDim);
          assert.isFunction(t.testIsFact);
          assert.isFalse(t.testIsDim());
          assert.isTrue(t.testIsFact());

          if (t.tableName === "FactTable") {
            assert.isFunction(t.testIsDim02);
            assert.isFunction(t.testIsFact02);
            assert.isFalse(t.testIsDim02());
            // Next line is testing the use of non-default options
            assert.isFalse(t.testIsFact02());
          }

          assertTableInternals(t);
        });
      trModel.tables
        .filter(t => t.tableScope === "other" || t.tableScope === "addon")
        .forEach(t => {
          assert.isUndefined(t.testIsDim);
          assert.isUndefined(t.testIsFact);
          assertTableInternals(t);
        });
      trModel.sourceDataSets.forEach(ds => {
        if (ds.isPublic) {
          assert.isUndefined(
            ds.isPrivate,
            `expected isPrivate to be "undefined" for ds ${ds.dataSetName}`
          );
        } else {
          assert.isFunction(ds.isPrivate);
        }

        // fully exclusive filter
        assert.isUndefined(ds.isPrivate02);
      });
      assert.isFunction(trModel.testDimTables02);
      assert.isFunction(trModel.testFactTables02);

      // model transform can access project functions
      assert.isFunction(trModel.getProjectPath);
      assert.isString(trModel.getProjectPath());
      assert.equal(trModel.getProjectPath(), proj.getResolvedProjectPath());
    });
  });

  describe("#render", () => {
    before(() => {
      removeDirectory(testOutputFolder);
      ensureDirSync(testOutputFolder);
    });

    after(() => {
      removeDirectory(testOutputFolder);
    });

    it("should execute pre-processing and render tasks", () => {
      const readFileAndValidate = (fileName, content) => {
        const res = fs.readFileSync(fileName, { encoding: "utf8" });
        assert.isString(res);
        const formattedResult = removeSpacesAndLineBreaks(res);
        assert.isString(formattedResult);
        assert.strictEqual(formattedResult, content);
      };

      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_01
            }
          ],
          logger: {
            disableLogToConsole: true
          }
        },
        projectTestData.testProjectPath
      );

      assert.doesNotThrow(() => proj.render());

      readFileAndValidate(
        `${testOutputFolder}/template01.html`,
        modelWithParamsMessage
      );
      readFileAndValidate(
        `${testOutputFolder}/template02.html`,
        modelWithParamsMessage
      );
      readFileAndValidate(
        `${testOutputFolder}/preprocess01.json`,
        preProcContent
      );
      readFileAndValidate(
        `${testOutputFolder}/preprocess02.json`,
        preProcContent
      );
    });
    it("should fail if pre-processing fails", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_02
            }
          ],
          logger: {
            disableLogToConsole: true
          }
        },
        projectTestData.testProjectPath
      );

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          proj.render();
        },
        Error,
        errorMessages.renderFailedPreprocessingFailed
      );
    });
    it("should fail if pre-processing task is not a func", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_02
            }
          ],
          logger: {
            disableLogToConsole: true
          }
        },
        projectTestData.testProjectPath
      );

      const addon = proj.addonModuleReferences[0].getAddonObject();
      addon.preprocessingTasks[0] = { foo: "bar" };

      assert.throws(
        () => {
          // eslint-disable-next-line no-unused-vars
          proj.render();
        },
        Error,
        errorMessages.renderFailedPreprocessingNotFunc
      );
    });
    it("should render if no tasks", () => {
      const proj = LatonaProject.load(
        {
          model: projectTestData.testModel,
          addons: [
            {
              moduleName: projectTestData.testAddon_03
            }
          ],
          logger: {
            disableLogToConsole: true
          }
        },
        projectTestData.testProjectPath
      );

      assert.doesNotThrow(() => {
        proj.render();
      });
    });
  });

  describe("#logging", () => {
    beforeEach(() => {
      logger.destroy();
    });

    after(() => {
      logger.destroy();
    });

    it("should setup logger (constructor)", () => {
      // eslint-disable-next-line no-unused-vars
      const proj = new LatonaProject(
        projectTestData.testModel,
        projectTestData.testProjectPath,
        {
          disableLogToConsole: true
        }
      );
      assert.notDeepEqual(logger, { logger: null });
    });

    it("should setup logger (load from file)", () => {
      // eslint-disable-next-line no-unused-vars
      const proj = LatonaProject.loadFromFile(
        projectTestData.testProject_withLogger
      );
      assert.notDeepEqual(logger, { logger: null });
    });

    it("should not setup logger if settings are missing (constructor)", () => {
      // eslint-disable-next-line no-unused-vars
      const proj = new LatonaProject(
        projectTestData.testModel,
        projectTestData.testProjectPath
      );
      assert.deepEqual(logger, { logger: null });
    });

    it("should not setup logger if settings are missing (load from file)", () => {
      // eslint-disable-next-line no-unused-vars
      const proj = LatonaProject.loadFromFile(projectTestData.testProject);
      assert.deepEqual(logger, { logger: null });
    });
  });
});

const addonRefConstructorAssertHelper = (ref, msg) => {
  assert.throws(
    () => {
      // eslint-disable-next-line no-unused-vars
      const addonRef = new AddonModuleReference(ref, process.cwd());
    },
    Error,
    msg
  );
};

describe("addon-module-reference", () => {
  describe("#constructor", () => {
    describe("negative", () => {
      it("should fail if ref is not an object", () => {
        addonRefConstructorAssertHelper(undefined, errorMessages.badRefObject);
      });
      it("should fail if module name is not a string", () => {
        addonRefConstructorAssertHelper(
          { moduleName: 123 },
          errorMessages.badModuleName
        );
        addonRefConstructorAssertHelper(
          {
            moduleName: { foo: "bar" }
          },
          errorMessages.badModuleName
        );
      });
      it("should fail if options is defined and not an object", () => {
        addonRefConstructorAssertHelper(
          {
            moduleName: testAddonModules.testAddonSimple,
            options: "foo"
          },
          errorMessages.badOptions
        );
      });
      it("should fail if relative path doesn't exist", () => {
        addonRefConstructorAssertHelper(
          {
            moduleName: "../this_module_does_not_exist_ever"
          },
          errorMessages.combinedPathNotExists
        );
        addonRefConstructorAssertHelper(
          {
            moduleName: "./this_module_does_not_exist_ever"
          },
          errorMessages.combinedPathNotExists
        );
      });
      it("should fail if module cannot be loaded", () => {
        addonRefConstructorAssertHelper(
          {
            moduleName: "this_module_does_not_exist_ever"
          },
          errorMessages.failedLoadModule
        );
      });
      it("should fail if module doesn't export a `create` function", () => {
        addonRefConstructorAssertHelper(
          {
            moduleName: testAddonModules.notAddon
          },
          errorMessages.noCreateFunction
        );
      });
      it("should fail if module function doesn't return LatonaAddon object", () => {
        addonRefConstructorAssertHelper(
          {
            moduleName: testAddonModules.badCreateBadReturn
          },
          errorMessages.createdUnexpected
        );
        addonRefConstructorAssertHelper(
          {
            moduleName: testAddonModules.badCreateNoReturn
          },
          errorMessages.createdUnexpected
        );
      });
      it("should fail if module's `create` function fails", () => {
        addonRefConstructorAssertHelper(
          {
            moduleName: testAddonModules.badCreateFailing
          },
          errorMessages.createFailed
        );
      });
      it("should fail if projectPath is not provided", () => {
        assert.throws(
          () => {
            // eslint-disable-next-line no-unused-vars
            const addonRef = new AddonModuleReference({
              moduleName: testAddonModules.testAddonSimple
            });
          },
          Error,
          errorMessages.badProjectPath
        );
      });
    });

    describe("positive", () => {
      let addonRefRelative;
      let addonRefRelativeNoExtension;
      let addonRefAbsolute;

      const addonTypeRelative = "relative";
      const addonTypeAbsolute = "absolute";
      const addonPathAbsolute = path.join(
        process.cwd(),
        testAddonModules.testAddonSimple
      );

      before("create addon refs", () => {
        addonRefRelative = new AddonModuleReference(
          {
            moduleName: testAddonModules.testAddonSimple,
            options: {
              addonType: addonTypeRelative
            }
          },
          process.cwd()
        );

        addonRefRelativeNoExtension = new AddonModuleReference(
          {
            moduleName: testAddonModules.testAddonSimpleNoExtension,
            options: {
              addonType: addonTypeRelative
            }
          },
          process.cwd()
        );

        addonRefAbsolute = new AddonModuleReference(
          {
            moduleName: addonPathAbsolute,
            options: {
              addonType: addonTypeAbsolute
            }
          },
          process.cwd()
        );
      });

      it("should copy module name to properties", () => {
        assert.equal(
          addonRefRelative.moduleName,
          testAddonModules.testAddonSimple
        );

        assert.equal(
          addonRefRelativeNoExtension.moduleName,
          testAddonModules.testAddonSimpleNoExtension
        );

        assert.equal(addonRefAbsolute.moduleName, addonPathAbsolute);
      });
      it("should copy options to properties", () => {
        assert.equal(addonRefRelative.options.addonType, addonTypeRelative);
        assert.equal(addonRefAbsolute.options.addonType, addonTypeAbsolute);
      });
    });
  });
  describe("#getAddonObject", () => {
    it("should return LatonaAddon object", () => {
      const addonRefRelative = new AddonModuleReference(
        {
          moduleName: testAddonModules.testAddonSimple,
          options: {
            addonType: "foo bar"
          }
        },
        process.cwd()
      );

      assert.instanceOf(addonRefRelative.getAddonObject(), LatonaAddon);
    });
  });
});
