const { assert } = require("chai");
const { outputFileSync, ensureDirSync } = require("fs-extra");
const { removeDirectory, directoryIsEmpty } = require("../../utils");
const addon = require("../../../src/addons/latona-core-clean-folders");
const latona = require("../../../index");

const { LatonaProject, LatonaAddon } = latona;

const testOutputFolder = "./test/output/latona-core-clean-folders.spec";
const pathToMockModelFile = "./test/mocks/latona-project.spec/model.json";

const folderNames = {
  f1: `${testOutputFolder}/folder_01`,
  f2: `${testOutputFolder}/folder_02`,
  fNotExists: `${testOutputFolder}/never_exists`
};

const fileNames = ["foo.txt", "bar.txt", "123-456.txt"];

const testContent = "foo bar";

const errorMessages = {
  noFoldersToClean: "'foldersToClean' is expected to be an array of strings",
  noCb: `"addonCreateCb" is expected to be a function`
};

function buildProjObject(folders) {
  return {
    model: pathToMockModelFile,
    addons: [
      {
        moduleName: "latona-core-clean-folders",
        options: {
          foldersToClean: folders
        }
      }
    ]
  };
}

function loadRenderAndCheckClean(foldersToClean, foldersToCheck) {
  const proj = LatonaProject.load(buildProjObject(foldersToClean));

  assert.instanceOf(proj, LatonaProject);

  assert.doesNotThrow(() => {
    proj.render();
  });

  foldersToCheck.forEach(folder => {
    assert.isTrue(directoryIsEmpty(folder));
  });
}

describe("latona-core-clean-folders", () => {
  beforeEach(() => {
    ensureDirSync(folderNames.f1);
    ensureDirSync(folderNames.f2);
    fileNames.forEach(fn => {
      outputFileSync(
        `${folderNames.f1}/${fn}`,
        `${folderNames.f1}/${fn}: ${testContent}`
      );
      outputFileSync(
        `${folderNames.f2}/${fn}`,
        `${folderNames.f1}/${fn}: ${testContent}`
      );
    });
  });

  afterEach(() => {
    removeDirectory(testOutputFolder);
  });

  it("addon create fails if no folders provided", () => {
    assert.throws(
      () => {
        addon.create();
      },
      Error,
      errorMessages.noCb
    );

    assert.throws(
      () => {
        addon.create(undefined, LatonaAddon.create);
      },
      Error,
      errorMessages.noFoldersToClean
    );

    assert.throws(
      () => {
        addon.create(
          {
            foldersToClean: []
          },
          LatonaAddon.create
        );
      },
      Error,
      errorMessages.noFoldersToClean
    );
    assert.throws(
      () => {
        addon.create(
          {
            foldersToClean: [folderNames.f1, {}]
          },
          LatonaAddon.create
        );
      },
      Error,
      errorMessages.noFoldersToClean
    );
  });
  it("addon create returns addon", () => {
    assert.doesNotThrow(() => {
      addon.create(
        {
          foldersToClean: [
            folderNames.f1,
            folderNames.f2,
            folderNames.fNotExists
          ]
        },
        LatonaAddon.create
      );
    });
  });
  it("project load fails if no folders provided", () => {
    assert.throws(
      () => {
        LatonaProject.load(buildProjObject());
      },
      Error,
      errorMessages.noFoldersToClean
    );
  });
  it("render fails if folder list is empty", () => {
    assert.throws(
      () => {
        LatonaProject.load(buildProjObject([]));
      },
      Error,
      errorMessages.noFoldersToClean
    );
  });
  it("project load success when folders provided", () => {
    const proj = LatonaProject.load(
      buildProjObject([folderNames.f1, folderNames.f2, folderNames.fNotExists])
    );

    assert.instanceOf(proj, LatonaProject);
  });
  it("render success if the only folder does not exists", () => {
    loadRenderAndCheckClean([folderNames.fNotExists], []);
  });
  it("render success if one of many folders does not exists", () => {
    loadRenderAndCheckClean(
      [folderNames.f1, folderNames.f2, folderNames.fNotExists],
      [folderNames.f1, folderNames.f2]
    );
  });
  it("render cleans one folder specified", () => {
    loadRenderAndCheckClean([folderNames.f1], [folderNames.f1]);

    assert.isFalse(directoryIsEmpty(folderNames.f2));
  });
  it("render cleans multiple folders specified", () => {
    loadRenderAndCheckClean(
      [folderNames.f1, folderNames.f2],
      [folderNames.f1, folderNames.f2]
    );
  });
});
