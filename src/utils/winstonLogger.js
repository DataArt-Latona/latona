/**
 * @fileoverview Utility for logging app working steps and errors.
 * Uses 'winston' lib
 * @see https://www.npmjs.com/package/winston
 * @private
 */

const { createLogger, transports, format } = require('winston');
const CustomWinstonTransport = require('./customWinstonTransport');

const { combine, timestamp, prettyPrint, simple } = format;

/**
 * @const {number} correlationId An unique identifier for every
 * app working session.
 * @private
 */
const correlationId = Date.now();

/**
 * Logger class. Creates winston logger object.
 * @see https://www.npmjs.com/package/winston#logging
 * @private
 */
class Logger {
  constructor() {
    this.logger = null;
  }

  init(options = {}) {
    const {
      runtimeLogsFilePath,
      exceptionsLogsFilePath,
      disableLogToConsole
    } = options;

    this.logger = createLogger({
      format: combine(timestamp(), prettyPrint()),
      defaultMeta: { correlationId },
      transports: [new CustomWinstonTransport()]
    });

    if (runtimeLogsFilePath) {
      this.addTransport('File', {
        filename: runtimeLogsFilePath
      });
    }

    if (exceptionsLogsFilePath) {
      this.addTransport('File', {
        filename: exceptionsLogsFilePath,
        level: 'error',
        handleExceptions: true
      });
    }

    if (!disableLogToConsole) {
      this.addTransport('Console', {
        format: simple()
      });
    }
  }

  addTransport(className, options) {
    const TransportConstructor = transports[className];

    if (!TransportConstructor) {
      throw new Error(`Unknown logger transport`);
    }

    this.logger.add(new TransportConstructor(options));
  }

  info(...args) {
    const { logger } = this;

    if (logger) {
      logger.info(...args);
    }
  }

  error(...args) {
    const { logger } = this;

    if (logger) {
      logger.error(...args);
    }
  }

  destroy() {
    const { logger } = this;

    if (logger) {
      logger.clear();

      this.logger = null;
    }
  }
}

const logger = new Logger();

module.exports = { logger };
