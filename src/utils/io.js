/**
 * @fileoverview Utility for working with i/o.
 * @private
 */

const { readFileSync } = require("fs");
const { readJsonSync } = require("fs-extra");

const { logger } = require("./winstonLogger");

/**
 * Removes BOM from content
 * @param  {string | !Buffer} content
 * @return {string}
 * @private
 */
const stripBom = content => {
  if (typeof content !== "string" && !Buffer.isBuffer(content)) {
    throw new Error(
      `"content" param is required and must be a string or a Buffer`
    );
  }

  let result = content;

  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) {
    result = content.toString("utf8");
  }

  result = result.replace(/^\uFEFF/, "");

  return result;
};

/**
 * Reads text file
 * @param  {string} filePath A path to file to read
 * @param  {!Object} options
 * @see https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
 *
 * @return {string} A content of file without BOM
 * @private
 */
const readTxtFile = (filePath, options = { encoding: "utf8" }) => {
  if (typeof filePath !== "string") {
    throw new Error(`"filePath" param is required`);
  }

  logger.info("Start reading text file", { file: filePath });

  try {
    const result = readFileSync(filePath, options);

    logger.info("Text file successfully read", { file: filePath });

    return stripBom(result);
  } catch (error) {
    throw error;
  }
};

/**
 * Reads JSON file
 * @see https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/readJson.md
 * @param  {string} filePath A path to JSON file to read
 * @return {string} A content of JSON file
 * @private
 */
const readJSONFile = filePath => {
  if (typeof filePath !== "string") {
    throw new Error(`"filePath" param is required`);
  }

  logger.info("Start reading JSON file", { file: filePath });

  try {
    const content = readJsonSync(filePath);

    logger.info("JSON file successfully read", { file: filePath });

    return content;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  readTxtFile,
  readJSONFile,
  stripBom
};
