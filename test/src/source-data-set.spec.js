const { assert } = require('chai');

const { SourceDataSet } = require('../../src/source-data-set');

const validateDataSetNameErrorMessage = `"dataSetName" property must be specified and be a string`;
const validateOptionsErrorMessage = `"options" property must be an object`;
const validateSchemaErrorMessage = `"schema" property must be an array`;

const validateSchemaFieldErrorMessages = {
  field: `"field" must be an object`,
  fieldName: `"fieldName" property must be specified and be a string`,
  type: `"type" property must be specified and be a string`,
  options: `"options" property must be an object`
};

describe('source-data-set', () => {
  describe('#constructor', () => {
    it('should create source data set instance with all specified options', () => {
      const options = {
        dataSetName: 'publicDataSet',
        options: {
          baseURL: 'https://www.alphavantage.co'
        },
        schema: [
          {
            fieldName: 'string',
            type: 'string',
            options: {}
          }
        ]
      };

      const sourceDataSet = new SourceDataSet(options);

      assert.isObject(sourceDataSet);
      assert.deepInclude(sourceDataSet, options);
    });
  });

  describe('#validateDataSetName', () => {
    it('should throw error if value is missing', () => {
      assert.throws(
        () => SourceDataSet.prototype.validateDataSetName(),
        Error,
        validateDataSetNameErrorMessage
      );
    });

    it('should throw error if value is not a string', () => {
      assert.throws(
        () => SourceDataSet.prototype.validateDataSetName({}),
        Error,
        validateDataSetNameErrorMessage
      );
    });

    it('should return true if value is a string', () => {
      const result = SourceDataSet.prototype.validateDataSetName(
        'publicDataSet'
      );

      assert.isTrue(result);
    });
  });

  describe('#validateOptions', () => {
    it('should throw error if value is not an object', () => {
      assert.throws(
        () => SourceDataSet.prototype.validateOptions([]),
        Error,
        validateOptionsErrorMessage
      );
    });

    it('should return true if value is an object', () => {
      const result = SourceDataSet.prototype.validateOptions({});

      assert.isTrue(result);
    });

    it('should return true if value is missing', () => {
      const result = SourceDataSet.prototype.validateOptions();

      assert.isTrue(result);
    });
  });

  describe('#validateSchema', () => {
    it('should throw error if value is not an object', () => {
      assert.throws(
        () => SourceDataSet.prototype.validateSchema({}),
        Error,
        validateSchemaErrorMessage
      );
    });

    it('should return true if value is missing', () => {
      const result = SourceDataSet.prototype.validateSchema();

      assert.isTrue(result);
    });

    it('should return true if value is an empty array', () => {
      const result = SourceDataSet.prototype.validateSchema([]);

      assert.isTrue(result);
    });

    it('should return undefined if value is an array of valid schema fields', () => {
      const result = SourceDataSet.prototype.validateSchema([
        {
          fieldName: 'string',
          type: 'string',
          options: {}
        }
      ]);

      assert.isUndefined(result);
    });
  });

  describe('#validateSchemaField', () => {
    it('should throw error if value is missing', () => {
      assert.throws(
        () => SourceDataSet.prototype.validateSchemaField(),
        Error,
        validateSchemaFieldErrorMessages.field
      );
    });

    it('should throw error if value is not an object', () => {
      assert.throws(
        () => SourceDataSet.prototype.validateSchemaField([]),
        Error,
        validateSchemaFieldErrorMessages.field
      );
    });

    it('should throw error if fieldName property is missing', () => {
      assert.throws(
        () =>
          SourceDataSet.prototype.validateSchemaField({
            type: 'string',
            options: {}
          }),
        Error,
        validateSchemaFieldErrorMessages.fieldName
      );
    });

    it('should throw error if fieldName property is not a string', () => {
      assert.throws(
        () =>
          SourceDataSet.prototype.validateSchemaField({
            fieldName: 1
          }),
        Error,
        validateSchemaFieldErrorMessages.fieldName
      );
    });

    it('should throw error if type property is missing', () => {
      assert.throws(
        () =>
          SourceDataSet.prototype.validateSchemaField({
            fieldName: 'string',
            options: {}
          }),
        Error,
        validateSchemaFieldErrorMessages.type
      );
    });

    it('should throw error if type property is not a string', () => {
      assert.throws(
        () =>
          SourceDataSet.prototype.validateSchemaField({
            fieldName: 'string',
            type: 1
          }),
        Error,
        validateSchemaFieldErrorMessages.type
      );
    });

    it('should throw error if options property is specified but not an object', () => {
      assert.throws(
        () =>
          SourceDataSet.prototype.validateSchemaField({
            fieldName: 'string',
            type: 'string',
            options: []
          }),
        Error,
        validateSchemaFieldErrorMessages.options
      );
    });

    it('should return true if all field properties are valid', () => {
      const result = SourceDataSet.prototype.validateSchemaField({
        fieldName: 'string',
        type: 'string',
        options: {}
      });

      assert.isTrue(result);
    });
  });
});
