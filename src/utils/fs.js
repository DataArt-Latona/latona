/**
 * Utility functions for working with file system.
 * @module latona/extras/fs
 */

const path = require("path");
const { existsSync, statSync, readdirSync } = require("fs");
const { ensureDirSync, emptyDirSync, copySync } = require("fs-extra");
const { validateArray } = require("./validation");

const { logger } = require("./winstonLogger");

/**
 * Creates new directory
 * @param  {string} targetPath A new directory path
 * @param  {boolean} failOnFolderExists Mark to throw
 *   an exception if directory with such path already exists. Default: `false`.
 */
const createDirectory = (targetPath, failOnFolderExists = false) => {
  if (typeof targetPath !== "string") {
    throw new Error(`"targetPath" param is required`);
  }

  logger.info("Create directory", { directory: targetPath });

  if (existsSync(targetPath) && failOnFolderExists) {
    throw new Error(`Directory "${targetPath}" already exists`);
  }

  try {
    ensureDirSync(targetPath);
    logger.info("Directory created", { directory: targetPath });
  } catch (error) {
    const msg = `Failed to create directory: ${error.message}`;
    logger.error(msg);
    throw new Error(msg);
  }
};

/**
 * Empties directory child items but not directory itself
 * @param  {string} targetPath A path to directory to clean
 * @param  {boolean} failOnFolderNotExists Mark to throw
 *   an exception if directory with such path not exists. Default: `false`.
 */
const cleanDirectory = (targetPath, failOnFolderNotExists = false) => {
  if (typeof targetPath !== "string") {
    throw new Error(`"targetPath" param is required`);
  }

  logger.info("Clean directory", { directory: targetPath });

  if (!existsSync(targetPath) && failOnFolderNotExists) {
    throw new Error(`Directory "${targetPath}" does not exist`);
  }

  try {
    emptyDirSync(targetPath);
    logger.info("Directory emptied", { directory: targetPath });
  } catch (error) {
    const msg = `Failed to clean directory: ${error.message}`;
    logger.error(msg);
    throw new Error(msg);
  }
};

/**
 * @param  {string} targetPath Root directory to start recursive search from
 * @param  {RegExp} pattern Search file regexp
 * @param  {boolean} failOnFolderNotExists Mark to throw
 *   an exception if directory with such path not exists. Default: `false`.
 * @return {string[]}
 */
const getDirectoryFilesRecursive = (
  targetPath,
  pattern,
  failOnFolderNotExists = false
) => {
  if (typeof targetPath !== "string") {
    throw new Error(`"targetPath" param is required`);
  }

  logger.info("Get directory files", {
    directory: targetPath,
    pattern: pattern ? pattern.toString() : null
  });

  const pathNotExists = !existsSync(targetPath);
  const pathNotExistsErrorMessage = `Directory "${targetPath}" does not exist`;

  let items = [];

  if (pathNotExists && failOnFolderNotExists) {
    throw new Error(pathNotExistsErrorMessage);
  }

  if (pathNotExists) {
    logger.info("Directory does not exist", { directory: targetPath });
    return items;
  }

  function walk(dirOrFilePath) {
    logger.info("Look for files in path", { path: dirOrFilePath });

    const stat = statSync(dirOrFilePath);

    if (stat.isDirectory()) {
      readdirSync(dirOrFilePath).map(child => {
        return walk(`${dirOrFilePath}/${child}`);
      });
    } else {
      items.push(dirOrFilePath);
    }
  }

  walk(targetPath);

  logger.info("Found files", { items });

  if (pattern) {
    items = items.filter(e => e.match(pattern));
    logger.info("Matching files", { items, pattern: pattern.toString() });
  }

  return items.map(i => path.resolve(i));
};

/**
 * Copies directory content
 * @param  {string} from A directory path to copy from
 * @param  {string} to A final destination to copy to
 */
const copyDirectory = (from, to) => {
  if (typeof from !== "string" || typeof to !== "string") {
    throw new Error(`"from" and "to" params are required`);
  }

  logger.info("Start directory copying", { from, to });

  try {
    copySync(from, to);
    logger.info("Directory copied", { from, to });
  } catch (error) {
    const msg = `Failed to copy directory: ${error.message}`;
    logger.error(msg);
    throw new Error(msg);
  }
};

/**
 * Check if path is relative. All paths that start with `../` or
 *   `./` or `..\` or `.\` will be considered as relative. All others are "not
 *   relative".
 * @param {string} pathName path to check.
 * @returns {boolean}
 */
const checkPathIsRelative = pathName => {
  if (typeof pathName !== "string") {
    throw new Error(`"path" param is required and should be string`);
  }

  return (
    pathName.startsWith("./") ||
    pathName.startsWith("../") ||
    pathName.startsWith(".\\") ||
    pathName.startsWith("..\\")
  );
};

/**
 * Checks if path exists and throws Error if not (only if message provided)
 * @param {string} pathToCheck path to check for existence
 * @param {string} [message] optional error message
 */
const checkPathExistsOrThrow = (pathToCheck, message = undefined) => {
  const checkResult = existsSync(pathToCheck);

  if (!checkResult && message) {
    throw new Error(message);
  }

  return checkResult;
};

/**
 * Combines part paths and checks if the resulting path actually exists. Also
 * checks if the first part (aka base path) exists.
 * @param  {...string} str path parts to join
 * @returns {string}
 */
const joinPathAndCheck = (...pathParts) => {
  const { isArray, isEmptyArray, isArrayOfStrings } = validateArray(pathParts);
  if (!isArray || isEmptyArray || !isArrayOfStrings) {
    throw new Error(`"pathParts" should be an array of strings`);
  }

  if (!existsSync(pathParts[0])) {
    throw new Error(`Base path doesn't exist (${pathParts[0]})`);
  }

  const jointPath = path.join(...pathParts);

  checkPathExistsOrThrow(
    jointPath,
    `Combined path doesn't exist (${jointPath})`
  );

  return jointPath;
};

module.exports = {
  createDirectory,
  cleanDirectory,
  getDirectoryFilesRecursive,
  copyDirectory,
  checkPathIsRelative,
  joinPathAndCheck,
  checkPathExistsOrThrow
};
