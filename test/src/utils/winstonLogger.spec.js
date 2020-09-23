const { assert } = require('chai');

const { logger } = require('../../../src/utils/winstonLogger');

describe('utils/winstonLogger', () => {
  describe('#constructor', () => {
    it('should be an object with "logger" field', () => {
      assert.deepEqual(logger, { logger: null });
    });
  });

  describe('#init', () => {
    it('should init logger instance', () => {
      logger.init();

      const { logger: loggerInstance } = logger;

      assert.isObject(loggerInstance);
      assert.strictEqual(loggerInstance.level, 'info');
      assert.isTrue(loggerInstance.exitOnError);
      assert.lengthOf(loggerInstance.transports, 2);
    });
  });

  describe('#initWithOptions', () => {
    it('should init logger instance with options', () => {
      logger.init({
        runtimeLogsFilePath: './logs/runtime.log',
        exceptionsLogsFilePath: './logs/exceptions.log',
        disableLogToConsole: true
      });

      const { logger: loggerInstance } = logger;

      assert.isObject(loggerInstance);
      assert.strictEqual(loggerInstance.level, 'info');
      assert.isTrue(loggerInstance.exitOnError);
      assert.lengthOf(loggerInstance.transports, 3);
    });
  });

  describe('#addTransport', () => {
    it('should throw error if logger transport is unknown', () => {
      assert.throws(
        () => {
          logger.addTransport('unknown');
        },
        Error,
        'Unknown logger transport'
      );
    });

    it('should add logger transport', () => {
      logger.init();

      const { logger: loggerInstance } = logger;

      logger.addTransport('Console');

      assert.isObject(loggerInstance);
      assert.strictEqual(loggerInstance.level, 'info');
      assert.isTrue(loggerInstance.exitOnError);
      assert.lengthOf(loggerInstance.transports, 3);
    });
  });

  describe('#info', () => {
    it('should not throw error when we call "info" method', () => {
      logger.init({
        disableLogToConsole: true
      });

      assert.doesNotThrow(() => logger.info());
    });
  });

  describe('#error', () => {
    it('should not throw error when we call "error" method', () => {
      logger.init({
        disableLogToConsole: true
      });

      assert.doesNotThrow(() => logger.error());
    });
  });
});
