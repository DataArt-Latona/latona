const { existsSync, unlinkSync, readdirSync } = require("fs");

const { removeSync } = require("fs-extra");

const removeFile = filePath => {
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
    } catch (error) {
      throw error;
    }
  }
};

const removeDirectory = filePath => {
  if (existsSync(filePath)) {
    try {
      removeSync(filePath);
    } catch (error) {
      throw error;
    }
  }
};

const directoryIsEmpty = dirPath => {
  try {
    const files = readdirSync(dirPath);

    return files.length === 0;
  } catch (error) {
    throw error;
  }
};

const removeSpacesAndLineBreaks = string => {
  return string
    .trim() // remove all spaces
    .replace(/\r?\n|\r/g, " "); // replace template line breaks with spaces
};

module.exports = {
  removeFile,
  removeDirectory,
  directoryIsEmpty,
  removeSpacesAndLineBreaks
};
