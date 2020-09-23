const { assert } = require("chai");

const {
  AutoFieldTemplate
} = require("../../../src/settings/auto-field-template");

describe("settings/auto-field-template", () => {
  describe("#constructor", () => {
    it("should be an object without any fields", () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      assert.isObject(autoFieldTemplate);
      assert.isEmpty(autoFieldTemplate);
    });

    it('should throw error if "tableOption" property is not valid', () => {
      assert.throws(
        () =>
          new AutoFieldTemplate({
            tableOption: []
          }),
        Error
      );
    });

    it('should throw error if "tableScope" property is not valid', () => {
      assert.throws(
        () =>
          new AutoFieldTemplate({
            tableScope: {}
          }),
        Error
      );
    });

    it('should throw error if "fieldTemplate" property is not valid', () => {
      assert.throws(
        () =>
          new AutoFieldTemplate({
            fieldTemplate: {
              fake: "template"
            }
          }),
        Error
      );
    });

    it('should be an "AutoFieldTemplate" object with all specified options', () => {
      const options = {
        tableOption: "addSurrogateKey",
        tableScope: "dim",
        addKeyPrefix: true,
        fieldTemplate: {
          fieldName: "_dim_key",
          sqlType: "uniqueidentifier",
          someOtherType: "string",
          options: {
            isPersistent: true,
            isPublic: true,
            isSKey: true
          }
        }
      };

      const autoFieldTemplate = new AutoFieldTemplate(options);

      assert.isObject(autoFieldTemplate);
      assert.deepEqual(autoFieldTemplate, options);
    });
  });

  describe("#validateTableOption", () => {
    it('should return "true" if value is missing', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      const isValid = autoFieldTemplate.validateTableOption();

      assert.isTrue(isValid);
    });

    it("should throw error if value is not a string", () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      assert.throws(
        () => autoFieldTemplate.validateTableOption(1),
        Error,
        `"tableOption" property must be specified and be a string`
      );
    });

    it('should return "true" if value is a string', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      const isValid = autoFieldTemplate.validateTableOption("addSurrogateKey");

      assert.isTrue(isValid);
    });
  });

  describe("#validateTableScope", () => {
    it('should return "true" if value is missing', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      const isValid = autoFieldTemplate.validateTableScope();

      assert.isTrue(isValid);
    });

    it("should throw error if value is not a string", () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      assert.throws(() => autoFieldTemplate.validateTableScope(1), Error);
    });

    it('should return "true" if value is a string and is one of valid table scopes', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      const boundValidateTableScope = autoFieldTemplate.validateTableScope.bind(
        null,
        "dim"
      );

      assert.isTrue(boundValidateTableScope());
      assert.doesNotThrow(boundValidateTableScope, Error);
    });
  });

  describe("#validateFieldTemplate", () => {
    it('should return "true" if value is missing', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      const isValid = autoFieldTemplate.validateFieldTemplate();

      assert.isTrue(isValid);
    });

    it("should throw error if value is not an object", () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      assert.throws(
        () => autoFieldTemplate.validateFieldTemplate(["fake", "array"]),
        Error
      );
    });

    it('should throw error "fieldName" property is missing', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      assert.throws(
        () =>
          autoFieldTemplate.validateFieldTemplate({
            sqlType: "uniqueidentifier",
            options: {
              isPersistent: true,
              isPublic: true,
              isSKey: true
            }
          }),
        Error
      );
    });

    it('should return "true" if value is an object and "fieldName" property is specified', () => {
      const autoFieldTemplate = new AutoFieldTemplate();

      const isValid = autoFieldTemplate.validateFieldTemplate({
        fieldName: "_dim_key"
      });

      assert.isTrue(isValid);
    });
  });
});
