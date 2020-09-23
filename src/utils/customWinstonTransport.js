/**
 * @fileoverview Logging transport utility
 * @private
 */

const Transport = require('winston-transport');

module.exports = class CustomTransport extends Transport {
  log(info, cb) {
    cb();
  }
};
