const { assert } = require("chai");
const { existsSync } = require("fs");
const { resolve, sep } = require("path");
const { outputFileSync, ensureDirSync } = require("fs-extra");

const {
  createDirectory,
  cleanDirectory,
  getDirectoryFilesRecursive,
  copyDirectory,
  checkPathIsRelative,
  checkPathExistsOrThrow,
  joinPathAndCheck
} = require("../../../src/utils/fs");

const { removeDirectory, directoryIsEmpty } = require("../../utils");

const testOutputFolder = "test/output/fs.spec";

const directoryToCreate = `${testOutputFolder}/created-directory`;
const directoryToClean = `${testOutputFolder}/directory-to-clean`;
const directoryToCopyFrom = `${testOutputFolder}/directory-to-copy-from`;
const directoryToCopyTo = `${testOutputFolder}/directory-to-copy-to`;
const directoryToGetFiles = `${testOutputFolder}/directory-to-get-files`;
const fakeDirectory = `${testOutputFolder}/fake-directory`;

const impossiblePath = "NotDrive://some.path";

const testFile = {
  name: "test",
  ext: "txt",
  content: "Hello, world!"
};

const errorMessages = {
  copyDirectoryErrorMessage: `"from" and "to" params are required`,
  pathParamRequired: `"path" param is required and should be string`,
  shouldBeArrayOfStrings: "should be an array of strings",
  basePathNotExists: "Base path doesn't exist",
  combinedPathNotExists: "Combined path doesn't exist",
  failedToCreateDirectory: "Failed to create directory:",
  failedToCleanDirectory: "Failed to clean directory:",
  failedToCopyDirectory: "Failed to copy directory:"
};

describe("utils/fs", () => {
  before(() => {
    ensureDirSync(testOutputFolder);
  });

  after(() => {
    removeDirectory(testOutputFolder);
  });

  describe("#createDirectory", () => {
    afterEach(() => {
      removeDirectory(directoryToCreate);
    });

    it("should throw an error when value is missing", () => {
      assert.throws(
        () => createDirectory(),
        Error,
        `"targetPath" param is required`
      );
    });

    it("should create directory", () => {
      createDirectory(directoryToCreate);

      assert.isTrue(existsSync(directoryToCreate), "directory created");
    });

    it("should create directory if it already exists", () => {
      createDirectory(directoryToCreate);
      createDirectory(directoryToCreate);

      assert.isTrue(existsSync(directoryToCreate), "directory created");
    });

    it("should not throw error if directory already exists", () => {
      createDirectory(directoryToCreate);

      assert.doesNotThrow(
        () => createDirectory(directoryToCreate, false),
        Error
      );
    });

    it("should throw error if directory already exists", () => {
      createDirectory(directoryToCreate);

      assert.throws(
        () => createDirectory(directoryToCreate, true),
        Error,
        `Directory "${directoryToCreate}" already exists`
      );
    });

    it("should throw error if directory cannot be created", () => {
      assert.throws(
        () => createDirectory(impossiblePath),
        Error,
        errorMessages.failedToCreateDirectory
      );
    });
  });

  describe("#cleanDirectory", () => {
    beforeEach(() => {
      const { name, content, ext } = testFile;
      outputFileSync(`${directoryToClean}/${name}.${ext}`, content);
    });

    afterEach(() => {
      removeDirectory(directoryToClean);
      removeDirectory(fakeDirectory);
    });

    it("should throw an error when value is missing", () => {
      assert.throws(
        () => cleanDirectory(),
        Error,
        `"targetPath" param is required`
      );
    });

    it("should not throw error if directory does not exist", () => {
      assert.doesNotThrow(() => cleanDirectory(fakeDirectory, false), Error);
    });

    it("should throw error if directory does not exist", () => {
      assert.throws(
        () => cleanDirectory(fakeDirectory, true),
        Error,
        `Directory "${fakeDirectory}" does not exist`
      );
    });

    it("should throw error if directory cannot be cleaned", () => {
      assert.throws(
        () => cleanDirectory(impossiblePath, false),
        Error,
        errorMessages.failedToCleanDirectory
      );
    });

    it("should clean directory", () => {
      cleanDirectory(directoryToClean);

      assert.isTrue(directoryIsEmpty(directoryToClean), "directory cleaned");
    });
  });

  describe("#getDirectoryFilesRecursive", () => {
    afterEach(() => {
      cleanDirectory(directoryToGetFiles);
    });

    it("should throw an error when value is missing", () => {
      assert.throws(
        () => getDirectoryFilesRecursive(),
        Error,
        `"targetPath" param is required`
      );
    });

    it("should throw error if directory does not exist", () => {
      assert.throws(
        () => getDirectoryFilesRecursive(fakeDirectory, null, true),
        Error,
        `Directory "${fakeDirectory}" does not exist`
      );
    });

    it("should not throw error if directory does not exist", () => {
      assert.doesNotThrow(
        () => getDirectoryFilesRecursive(fakeDirectory, null, false),
        Error
      );
    });

    it("should return an empty array if directory does not exist", () => {
      const result = getDirectoryFilesRecursive(fakeDirectory);

      assert.isArray(result);
      assert.isEmpty(result);
    });

    it("should return an array of matching files", () => {
      const { name, content, ext } = testFile;

      // file that has another extension
      // it should not exist in results
      const notMatchingTestFile = `${directoryToGetFiles}/${name}.log`;

      const matchingTestFile = `${directoryToGetFiles}/${name}.${ext}`;
      const matchingTestFileCopy = `${directoryToGetFiles}/${name}_1.${ext}`;
      const matchingTestFileCopy2 = `${directoryToGetFiles}/${name}_2.${ext}`;

      // create files
      outputFileSync(notMatchingTestFile, content);

      outputFileSync(matchingTestFile, content);
      outputFileSync(matchingTestFileCopy, content);
      outputFileSync(matchingTestFileCopy2, content);

      const result = getDirectoryFilesRecursive(
        directoryToGetFiles,
        new RegExp(`${directoryToGetFiles}/.+.${ext}$`, "g")
      );

      assert.isArray(result);
      assert.lengthOf(result, 3, "array has length of 3");

      assert.notInclude(
        result,
        resolve(notMatchingTestFile),
        "result does not include not matching test file"
      );

      assert.include(
        result,
        resolve(matchingTestFile),
        "result includes test file"
      );

      assert.include(
        result,
        resolve(matchingTestFileCopy),
        "result includes test file copy"
      );

      assert.include(
        result,
        resolve(matchingTestFileCopy2),
        "result includes test file copy 2"
      );
    });

    it("should return array of all files when pattern not provided", () => {
      const { name, content, ext } = testFile;

      // create files with different patterns
      const notMatchingTestFile = `${directoryToGetFiles}/${name}.log`;
      const matchingTestFile = `${directoryToGetFiles}/${name}.${ext}`;
      outputFileSync(notMatchingTestFile, content);
      outputFileSync(matchingTestFile, content);

      const result = getDirectoryFilesRecursive(directoryToGetFiles);
      assert.isArray(result);
      assert.lengthOf(result, 2);

      assert.include(result, resolve(notMatchingTestFile));
      assert.include(result, resolve(matchingTestFile));
    });
  });

  describe("#copyDirectory", () => {
    it("should throw an error when value is missing", () => {
      assert.throws(
        () => copyDirectory(),
        Error,
        errorMessages.copyDirectoryErrorMessage
      );
    });

    it('should throw an error when "from" param is missing', () => {
      assert.throws(
        () => copyDirectory(null, fakeDirectory),
        Error,
        errorMessages.copyDirectoryErrorMessage
      );
    });

    it('should throw an error when "to" param is missing', () => {
      assert.throws(
        () => copyDirectory(fakeDirectory, null),
        Error,
        errorMessages.copyDirectoryErrorMessage
      );
    });

    it('should throw an error when "from" or "to" are impossible', () => {
      assert.throws(
        () => copyDirectory(fakeDirectory, impossiblePath),
        Error,
        errorMessages.failedToCopyDirectory
      );

      assert.throws(
        () => copyDirectory(impossiblePath, fakeDirectory),
        Error,
        errorMessages.failedToCopyDirectory
      );
    });

    it("should copy files from source to destination directory", () => {
      const { name, content, ext } = testFile;

      const testFilePath = `${directoryToCopyFrom}/${name}.${ext}`;
      const testFileInSubDirPath = `${directoryToCopyFrom}/sub-dir/${name}.${ext}`;

      outputFileSync(testFilePath, content);
      outputFileSync(testFileInSubDirPath, content);

      copyDirectory(directoryToCopyFrom, directoryToCopyTo);

      assert.isTrue(existsSync(testFilePath), "test file copied");
      assert.isTrue(
        existsSync(testFileInSubDirPath),
        "test file in sub. dir. copied"
      );
    });
  });

  describe("#checkPathIsRelative", () => {
    it("should fail if pathName is not provided or not a string", () => {
      assert.throws(
        () => {
          checkPathIsRelative();
        },
        Error,
        errorMessages.pathParamRequired
      );

      assert.throws(
        () => {
          checkPathIsRelative({ foo: "bar" });
        },
        Error,
        errorMessages.pathParamRequired
      );

      assert.throws(
        () => {
          checkPathIsRelative(123);
        },
        Error,
        errorMessages.pathParamRequired
      );
    });
    it("should return true if path starts with ../ or ./", () => {
      const testStrings = [
        "../../foo/bar",
        "../foo/bar",
        "./foo/bar",
        "./../foo/bar",
        "..\\..\\foo\\bar",
        "..\\foo\\bar",
        ".\\foo\\bar",
        ".\\..\\foo\\bar"
      ];

      testStrings.forEach(testString => {
        assert.isTrue(checkPathIsRelative(testString), `str: "${testString}"`);
      });
    });
    it("should return false if path doesn't start with ../ or ./", () => {
      const testStrings = [
        "/foo/bar",
        "\\host.domain.com.foo",
        "c:\\foo",
        "foo\\bar",
        "foo/bar/"
      ];

      testStrings.forEach(testString => {
        assert.isFalse(checkPathIsRelative(testString), `str: "${testString}"`);
      });
    });
  });

  describe("#checkPathExistsOrThrow", () => {
    it("returns false if path doesn't exist and no message provided", () => {
      const res = checkPathExistsOrThrow(impossiblePath);
      assert.isFalse(res);
    });
    it("fails if path doesn't exist and message is provided", () => {
      const msg = "path is impossible";
      assert.throws(
        () => {
          checkPathExistsOrThrow(impossiblePath, msg);
        },
        Error,
        msg
      );
    });
    it("returns true if path exists", () => {
      const res = checkPathExistsOrThrow(testOutputFolder);
      assert.isTrue(res);
    });
  });

  describe("#joinPathAndCheck", () => {
    it("should fail if path parts are not strings or not provided", () => {
      assert.throws(
        () => {
          joinPathAndCheck();
        },
        Error,
        errorMessages.shouldBeArrayOfStrings
      );
      assert.throws(
        () => {
          joinPathAndCheck(1, "foo");
        },
        Error,
        errorMessages.shouldBeArrayOfStrings
      );
      assert.throws(
        () => {
          joinPathAndCheck("foo", { foo: "bar" });
        },
        Error,
        errorMessages.shouldBeArrayOfStrings
      );
    });
    it("should fail if base path doesn't exist", () => {
      assert.throws(
        () => {
          joinPathAndCheck("/foo", "bar");
        },
        Error,
        errorMessages.basePathNotExists
      );
      assert.throws(
        () => {
          joinPathAndCheck("C:\\foo", "\\bar");
        },
        Error,
        errorMessages.basePathNotExists
      );
    });
    it("should fail if combined path doesn't exist", () => {
      assert.throws(
        () => {
          joinPathAndCheck("../", "absolutely_not_existing/long/folder_name");
        },
        Error,
        errorMessages.combinedPathNotExists
      );
    });
    it("should return combined relative path", () => {
      // valid paths should be relative to the project root folder as fs
      // uses cwd to resolve relative paths
      // see - https://nodejs.org/api/fs.html#fs_file_paths
      const testCases = [
        { pathParts: [".", "src", "utils"], result: `src${sep}utils` },
        { pathParts: ["./test", "utils"], result: `test${sep}utils` },
        { pathParts: ["./test", "../src", "utils"], result: `src${sep}utils` }
      ];

      testCases.forEach(testCase => {
        assert.equal(joinPathAndCheck(...testCase.pathParts), testCase.result);
      });
    });
    it("should return combined absolute path", () => {
      const parentDir = joinPathAndCheck(__dirname, "..");
      assert.isTrue(__dirname.startsWith(parentDir) && __dirname !== parentDir);
    });
  });
});
