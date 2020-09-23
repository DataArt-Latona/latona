const { assert } = require('chai');
const Transport = require('winston-transport');

const CustomWinstonTransport = require('../../../src/utils/customWinstonTransport');

describe('utils/customWinstonTransport', () => {
  describe('#constructor', () => {
    it('should be a Winston Transport instance', () => {
      const customWinstonTransport = new CustomWinstonTransport();

      assert.isTrue(customWinstonTransport instanceof Transport);
    });
  });

  describe('#log', () => {
    it('should throw error if "cb" param is not a function', () => {
      const customWinstonTransport = new CustomWinstonTransport();

      assert.throws(() => customWinstonTransport.log());
    });

    it('should have a "log" method', () => {
      const customWinstonTransport = new CustomWinstonTransport();

      assert.doesNotThrow(() => customWinstonTransport.log('info', () => {}));
    });
  });
});
