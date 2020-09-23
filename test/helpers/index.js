const { assert } = require('chai');

const assertThrowsErrorAsync = async (fn, errorType, errorMessage) => {
  let f = () => {};

  try {
    await fn();
  } catch (error) {
    f = () => {
      throw error;
    };
  } finally {
    assert.throws(f, errorType, errorMessage);
  }
};

const assertDoesNotThrowErrorAsync = async (fn, errorType, errorMessage) => {
  let f = () => {};

  try {
    await fn();
  } catch (error) {
    f = () => {
      throw error;
    };
  } finally {
    assert.doesNotThrow(f, errorType, errorMessage);
  }
};

module.exports = {
  assertThrowsErrorAsync,
  assertDoesNotThrowErrorAsync
};
