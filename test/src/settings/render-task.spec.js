const { assert } = require('chai');

const { RenderTask } = require('../../../src/settings/render-task');

const templateErrorMessage = `"template" property must be specified and be a string`;
const itemsBuilderErrorMessage = `"itemsBuilder" property must be specified and be a function`;

describe('settings/render-task', () => {
  describe('#constructor', () => {
    it('should throw error if value is missing', () => {
      assert.throws(() => new RenderTask(), Error, templateErrorMessage);
    });

    it('should throw error if "template" property is invalid', () => {
      assert.throws(
        () =>
          new RenderTask({
            template: {},
            itemsBuilder: () => {}
          }),
        Error,
        templateErrorMessage
      );
    });

    it('should throw error if "itemsBuilder" property is invalid', () => {
      assert.throws(
        () =>
          new RenderTask({
            template: './path/to/template',
            itemsBuilder: 'is not a function'
          }),
        Error,
        itemsBuilderErrorMessage
      );
    });

    it('should be an "RenderTask" object with all specified options', () => {
      const options = {
        template: './path/to/template',
        itemsBuilder: () => {},
        additional: 'option'
      };

      const renderTask = new RenderTask(options);

      assert.isObject(renderTask);
      assert.deepEqual(renderTask, options);
    });
  });

  describe('#validateTemplate', () => {
    it('should throw error if value is missing', () => {
      assert.throws(
        () => RenderTask.prototype.validateTemplate.call(RenderTask),
        Error,
        templateErrorMessage
      );
    });

    it('should throw error if value is null', () => {
      assert.throws(
        () => RenderTask.prototype.validateTemplate.call(RenderTask, null),
        Error,
        templateErrorMessage
      );
    });

    it('should throw error if value is a number', () => {
      assert.throws(
        () => RenderTask.prototype.validateTemplate.call(RenderTask, 1),
        Error,
        templateErrorMessage
      );
    });

    it('should return "true" if value is a string', () => {
      const result = RenderTask.prototype.validateTemplate.call(
        RenderTask,
        './templates/docs/table-list.mustache'
      );

      assert.isTrue(result);
    });
  });

  describe('#validateItemsBuilder', () => {
    it('should throw error if value is missing', () => {
      assert.throws(
        () => RenderTask.prototype.validateItemsBuilder.call(RenderTask),
        Error,
        itemsBuilderErrorMessage
      );
    });

    it('should throw error if value is null', () => {
      assert.throws(
        () => RenderTask.prototype.validateItemsBuilder.call(RenderTask, null),
        Error,
        itemsBuilderErrorMessage
      );
    });

    it('should throw error if value is a number', () => {
      assert.throws(
        () => RenderTask.prototype.validateItemsBuilder.call(RenderTask, 1),
        Error,
        itemsBuilderErrorMessage
      );
    });

    it('should return "true" if value is a function', () => {
      const fn = () => {};
      const result = RenderTask.prototype.validateItemsBuilder.call(
        RenderTask,
        fn
      );

      assert.isTrue(result);
    });
  });
});
