/* eslint-disable no-new */
const { assert } = require("chai");

const {
  LatonaAddon,
  LatonaAddonDependency,
  LatonaMixin
} = require("../../src/latona-addon");

const errorMessages = {
  badName: '"name" should be specified and should be a string',
  badDescription: '"description" should be a string',
  badDepAddonName: '"addonName" should be non-empty string',
  badDepReason: '"reason" should be non-empty string',
  badMixinObject: '"mixin" parameter must be specified and be an object',
  badMixinFilter: '"filter" parameter must be a function',
  badFuncParameter: "parameter must be a function",
  missingProperty: "property must be specified"
};

/**
 * helper functions to simplify testing of add* methods of `LatonaAddon`
 */
const addonAddMethodsAssertHelper = {
  mixin: { foo: "bar" },
  filter: a => {
    return !!a;
  },

  assertFailMixinNotObject: (obj, func) => {
    assert.throws(
      () => {
        obj[func]("", this.filter);
      },
      Error,
      errorMessages.badMixinObject
    );

    assert.throws(
      () => {
        obj[func](undefined, this.filter);
      },
      Error,
      errorMessages.badMixinObject
    );
  },

  assertFailFilterNotFunction: (obj, func) => {
    assert.throws(
      () => {
        obj[func](this.mixin);
      },
      Error,
      errorMessages.badMixinObject
    );

    assert.throws(
      () => {
        obj[func](this.mixin, "foo");
      },
      Error,
      errorMessages.badMixinObject
    );
  },

  assertShouldAddMixinToArray: (obj, func, arr) => {
    obj[func](
      addonAddMethodsAssertHelper.mixin,
      addonAddMethodsAssertHelper.filter
    );
    assert.isArray(arr);
    assert.isNotEmpty(arr);
    assert.lengthOf(arr, 1);
    assert.deepEqual(arr[0].mixin, addonAddMethodsAssertHelper.mixin);
    assert.deepEqual(arr[0].filter, addonAddMethodsAssertHelper.filter);
  },

  assertShouldAdd2ndMixinToArray: (obj, func, arr) => {
    obj[func](
      addonAddMethodsAssertHelper.mixin,
      addonAddMethodsAssertHelper.filter
    );
    obj[func](
      addonAddMethodsAssertHelper.mixin,
      addonAddMethodsAssertHelper.filter
    );
    assert.isArray(arr);
    assert.isNotEmpty(arr);
    assert.lengthOf(arr, 2);
    assert.deepEqual(arr[0].mixin, addonAddMethodsAssertHelper.mixin);
    assert.deepEqual(arr[0].filter, addonAddMethodsAssertHelper.filter);
    assert.deepEqual(arr[1].mixin, addonAddMethodsAssertHelper.mixin);
    assert.deepEqual(arr[1].filter, addonAddMethodsAssertHelper.filter);
  },

  assertShouldReturnLatonaAddon: (obj, func) => {
    const addon = obj[func](
      addonAddMethodsAssertHelper.mixin,
      addonAddMethodsAssertHelper.filter
    );
    assert.instanceOf(addon, LatonaAddon);
  }
};

describe("latona-addon", () => {
  describe("#constructor", () => {
    it("should fail if name is not defined", () => {
      assert.throws(
        () => {
          new LatonaAddon();
        },
        Error,
        errorMessages.badName
      );
    });

    it("should fail if name is not a string", () => {
      assert.throws(
        () => {
          new LatonaAddon({ foo: "bar" });
        },
        Error,
        errorMessages.badName
      );
    });

    it("should fail if description is not a string", () => {
      assert.throws(
        () => {
          new LatonaAddon("foo", { foo: "bar" });
        },
        Error,
        errorMessages.badDescription
      );
    });

    it("should copy name to properties", () => {
      const name = "my_foo_name";
      const addon = new LatonaAddon(name);
      assert.equal(addon.name, name);
    });

    it("should copy description to properties", () => {
      const name = "my_foo_name";
      const description = "my_bar_description";
      const addon = new LatonaAddon(name, description);
      assert.equal(addon.description, description);
    });
    it("description should be an empty string if not provided", () => {
      const name = "my_foo_name";
      const description = undefined;
      const addon = new LatonaAddon(name, description);
      assert.equal(addon.description, "");
    });
    it("should init array properties", () => {
      const propertyNames = [
        "dependencies",
        "preprocessingTasks",
        "renderTasks",
        "tableMixins",
        "fieldMixins",
        "modelMixins",
        "sourceDataSetMixins",
        "startModelTransformations",
        "endModelTransformations"
      ];

      const name = "my_foo_name";
      const description = undefined;
      const addon = new LatonaAddon(name, description);

      propertyNames.forEach(property => {
        assert.isDefined(addon[property]);
        assert.isArray(addon[property]);
        assert.isEmpty(addon[property]);
      });
    });
  });
  describe(".create", () => {
    it("should use empty string for description by default", () => {
      const addon = LatonaAddon.create("foo");
      assert.equal(addon.name, "foo");
      assert.equal(addon.description, "");
    });
  });
  describe("collection methods", () => {
    let addon;

    beforeEach("create addon object", () => {
      addon = new LatonaAddon("addon", "description");
    });

    describe("#addDependency", () => {
      it("should fail if addon name is empty", () => {
        assert.throws(
          () => {
            addon.addDependency("", "foo");
          },
          Error,
          errorMessages.badDepAddonName
        );

        assert.throws(
          () => {
            addon.addDependency(undefined, "foo");
          },
          Error,
          errorMessages.badDepAddonName
        );
      });
      it("should fail if reason name is empty", () => {
        assert.throws(
          () => {
            addon.addDependency("foo", "");
          },
          Error,
          errorMessages.badDepReason
        );

        assert.throws(
          () => {
            addon.addDependency("foo", undefined);
          },
          Error,
          errorMessages.badDepReason
        );
      });
      it("should add dependency to list", () => {
        addon.addDependency("foo", "bar");
        assert.isDefined(addon.dependencies);
        assert.isNotEmpty(addon.dependencies);
        assert.equal(addon.dependencies.length, 1);
        assert.strictEqual(addon.dependencies[0].addonName, "foo");
      });
      it("should add 2nd dependency to list if addon name is same", () => {
        addon.addDependency("foo", "bar");
        addon.addDependency("foo", "bar");
        assert.equal(addon.dependencies.length, 2);
        assert.strictEqual(addon.dependencies[1].addonName, "foo");
      });
      it("should return addon object", () => {
        const addon2 = addon.addDependency("foo", "bar");
        assert.instanceOf(addon2, LatonaAddon);
      });
    });
    describe("#addPreprocessingTask", () => {
      it("should fail if func is not a function", () => {
        assert.throws(
          () => {
            addon.addPreprocessingTask();
          },
          Error,
          errorMessages.badFuncParameter
        );

        assert.throws(
          () => {
            addon.addPreprocessingTask("foo");
          },
          Error,
          errorMessages.badFuncParameter
        );
      });
      it("should add func to list", () => {
        const func = () => {
          return "foo";
        };
        addon.addPreprocessingTask(func);
        assert.isDefined(addon.preprocessingTasks);
        assert.isArray(addon.preprocessingTasks);
        assert.isNotEmpty(addon.preprocessingTasks);
        assert.lengthOf(addon.preprocessingTasks, 1);
        assert.deepEqual(addon.preprocessingTasks[0], func);
      });
      it("should add 2nd func to list if func is same", () => {
        const func = () => {
          return "foo";
        };
        const func3 = () => {
          return "bar";
        };
        addon.addPreprocessingTask(func);
        addon.addPreprocessingTask(func);
        addon.addPreprocessingTask(func3);
        assert.lengthOf(addon.preprocessingTasks, 3);
        assert.deepEqual(addon.preprocessingTasks[0], func);
        assert.deepEqual(addon.preprocessingTasks[1], func);
        assert.deepEqual(addon.preprocessingTasks[2], func3);
      });
      it("should return addon object", () => {
        const func = () => {
          return "foo";
        };
        const addon2 = addon.addPreprocessingTask(func);
        assert.instanceOf(addon2, LatonaAddon);
      });
    });
    describe("#addRenderTask", () => {
      const renderTask = {
        template: "/foo/bar",
        itemsBuilder: () => {
          return [];
        }
      };

      it("should fail if render task object is invalid", () => {
        assert.throws(
          () => {
            addon.addRenderTask({});
          },
          Error,
          errorMessages.missingProperty
        );

        assert.throws(
          () => {
            addon.addRenderTask({ template: "/foo/bar" });
          },
          Error,
          errorMessages.missingProperty
        );

        assert.throws(
          () => {
            addon.addRenderTask({ template: "/foo/bar", itemsBuilder: "foo" });
          },
          Error,
          errorMessages.missingProperty
        );
      });
      it("should add render task to list", () => {
        addon.addRenderTask(renderTask);
        assert.isDefined(addon.renderTasks);
        assert.isNotEmpty(addon.renderTasks);
        assert.lengthOf(addon.renderTasks, 1);
        assert.deepEqual(addon.renderTasks[0], renderTask);
      });
      it("should add 2nd render task to list is task is same", () => {
        addon.addRenderTask(renderTask);
        addon.addRenderTask(renderTask);
        assert.lengthOf(addon.renderTasks, 2);
        assert.deepEqual(addon.renderTasks[0], renderTask);
        assert.deepEqual(addon.renderTasks[1], renderTask);
      });
      it("should return addon object", () => {
        const addon2 = addon.addRenderTask(renderTask);
        assert.instanceOf(addon2, LatonaAddon);
      });
    });
    describe("#addTableMixin", () => {
      it("should fail if mixin is not an object", () => {
        addonAddMethodsAssertHelper.assertFailMixinNotObject(
          addon,
          "addTableMixin"
        );
      });
      it("should fail if filter is provided, but not a function", () => {
        addonAddMethodsAssertHelper.assertFailFilterNotFunction(
          addon,
          "addTableMixin"
        );
      });
      it("should add mixin to list", () => {
        addonAddMethodsAssertHelper.assertShouldAddMixinToArray(
          addon,
          "addTableMixin",
          addon.tableMixins
        );
      });
      it("should add 2nd mixin to list if mixin is same", () => {
        addonAddMethodsAssertHelper.assertShouldAdd2ndMixinToArray(
          addon,
          "addTableMixin",
          addon.tableMixins
        );
      });
      it("should return addon object", () => {
        addonAddMethodsAssertHelper.assertShouldReturnLatonaAddon(
          addon,
          "addTableMixin"
        );
      });
    });
    describe("#addFieldMixin", () => {
      it("should fail if mixin is not an object", () => {
        addonAddMethodsAssertHelper.assertFailMixinNotObject(
          addon,
          "addFieldMixin"
        );
      });
      it("should fail if filter is provided, but not a function", () => {
        addonAddMethodsAssertHelper.assertFailFilterNotFunction(
          addon,
          "addFieldMixin"
        );
      });
      it("should add mixin to list", () => {
        addonAddMethodsAssertHelper.assertShouldAddMixinToArray(
          addon,
          "addFieldMixin",
          addon.fieldMixins
        );
      });
      it("should add 2nd mixin to list if mixin is same", () => {
        addonAddMethodsAssertHelper.assertShouldAdd2ndMixinToArray(
          addon,
          "addFieldMixin",
          addon.fieldMixins
        );
      });
      it("should return addon object", () => {
        addonAddMethodsAssertHelper.assertShouldReturnLatonaAddon(
          addon,
          "addFieldMixin"
        );
      });
    });
    describe("#addModelMixin", () => {
      it("should fail if mixin is not an object", () => {
        addonAddMethodsAssertHelper.assertFailMixinNotObject(
          addon,
          "addModelMixin"
        );
      });
      it("should fail if filter is provided, but not a function", () => {
        addonAddMethodsAssertHelper.assertFailFilterNotFunction(
          addon,
          "addModelMixin"
        );
      });
      it("should add mixin to list", () => {
        addonAddMethodsAssertHelper.assertShouldAddMixinToArray(
          addon,
          "addModelMixin",
          addon.modelMixins
        );
      });
      it("should add 2nd mixin to list if mixin is same", () => {
        addonAddMethodsAssertHelper.assertShouldAdd2ndMixinToArray(
          addon,
          "addModelMixin",
          addon.modelMixins
        );
      });
      it("should return addon object", () => {
        addonAddMethodsAssertHelper.assertShouldReturnLatonaAddon(
          addon,
          "addModelMixin"
        );
      });
    });
    describe("#addSourceDataSetMixin", () => {
      it("should fail if mixin is not an object", () => {
        addonAddMethodsAssertHelper.assertFailMixinNotObject(
          addon,
          "addSourceDataSetMixin"
        );
      });
      it("should fail if filter is provided, but not a function", () => {
        addonAddMethodsAssertHelper.assertFailFilterNotFunction(
          addon,
          "addSourceDataSetMixin"
        );
      });
      it("should add mixin to list", () => {
        addonAddMethodsAssertHelper.assertShouldAddMixinToArray(
          addon,
          "addSourceDataSetMixin",
          addon.sourceDataSetMixins
        );
      });
      it("should add 2nd mixin to list if mixin is same", () => {
        addonAddMethodsAssertHelper.assertShouldAdd2ndMixinToArray(
          addon,
          "addSourceDataSetMixin",
          addon.sourceDataSetMixins
        );
      });
      it("should return addon object", () => {
        addonAddMethodsAssertHelper.assertShouldReturnLatonaAddon(
          addon,
          "addSourceDataSetMixin"
        );
      });
    });
    describe("#addModelTransformation", () => {
      it("should fail if func is not a function", () => {
        assert.throws(
          () => {
            addon.addModelTransformation();
          },
          Error,
          errorMessages.badFuncParameter
        );

        assert.throws(
          () => {
            addon.addModelTransformation({});
          },
          Error,
          errorMessages.badFuncParameter
        );
      });
      it("should add func to end-list by default", () => {
        const func = () => {
          return "foo";
        };
        addon.addModelTransformation(func);
        assert.isDefined(addon.endModelTransformations);
        assert.isArray(addon.endModelTransformations);
        assert.isNotEmpty(addon.endModelTransformations);
        assert.lengthOf(addon.endModelTransformations, 1);
        assert.deepEqual(addon.endModelTransformations[0], func);
      });
      it("should add func to start-list only if set", () => {
        const func = () => {
          return "foo";
        };
        addon.addModelTransformation(func, {
          runOnStart: true,
          runOnEnd: false
        });
        assert.isDefined(addon.startModelTransformations);
        assert.isArray(addon.startModelTransformations);
        assert.isNotEmpty(addon.startModelTransformations);
        assert.lengthOf(addon.startModelTransformations, 1);
        assert.deepEqual(addon.startModelTransformations[0], func);
        assert.isDefined(addon.endModelTransformations);
        assert.isArray(addon.endModelTransformations);
        assert.lengthOf(addon.endModelTransformations, 0);
      });
      it("should add func to both lists if set", () => {
        const func = () => {
          return "foo";
        };
        addon.addModelTransformation(func, {
          runOnStart: true,
          runOnEnd: true
        });
        assert.isDefined(addon.startModelTransformations);
        assert.isArray(addon.startModelTransformations);
        assert.isNotEmpty(addon.startModelTransformations);
        assert.lengthOf(addon.startModelTransformations, 1);
        assert.deepEqual(addon.startModelTransformations[0], func);
        assert.isDefined(addon.endModelTransformations);
        assert.isArray(addon.endModelTransformations);
        assert.isNotEmpty(addon.endModelTransformations);
        assert.lengthOf(addon.endModelTransformations, 1);
        assert.deepEqual(addon.endModelTransformations[0], func);
      });
      it("should add 2nd func to list if func is same", () => {
        const func = () => {
          return "foo";
        };
        const func3 = () => {
          return "bar";
        };
        addon.addModelTransformation(func);
        addon.addModelTransformation(func);
        addon.addModelTransformation(func3);
        assert.lengthOf(addon.endModelTransformations, 3);
        assert.deepEqual(addon.endModelTransformations[0], func);
        assert.deepEqual(addon.endModelTransformations[1], func);
        assert.deepEqual(addon.endModelTransformations[2], func3);
      });
      it("should return addon object", () => {
        const func = () => {
          return "foo";
        };
        const addon2 = addon.addModelTransformation(func);
        assert.instanceOf(addon2, LatonaAddon);
      });
    });
  });
});

const assertAddonDependencyConstructorFailure = (addonName, reason, msg) => {
  assert.throws(
    () => {
      new LatonaAddonDependency(addonName, reason);
    },
    Error,
    msg
  );
};

describe("latona-addon-dependency", () => {
  describe("#constructor", () => {
    it("should fail if addon name is not provided or empty", () => {
      assertAddonDependencyConstructorFailure(
        undefined,
        undefined,
        errorMessages.badDepAddonName
      );

      assertAddonDependencyConstructorFailure(
        undefined,
        "foo",
        errorMessages.badDepAddonName
      );

      assertAddonDependencyConstructorFailure(
        "",
        "foo",
        errorMessages.badDepAddonName
      );
    });

    it("should fail if reason is not provided or empty", () => {
      assertAddonDependencyConstructorFailure(
        "foo",
        undefined,
        errorMessages.badDepReason
      );

      assertAddonDependencyConstructorFailure(
        "foo",
        "",
        errorMessages.badDepReason
      );
    });
    it("should copy addon name and reason to properties", () => {
      const depFields = {
        addonName: "foo",
        reason: "bar"
      };

      const dep = new LatonaAddonDependency(
        depFields.addonName,
        depFields.reason
      );

      assert.strictEqual(dep.addonName, depFields.addonName);
      assert.strictEqual(dep.reason, depFields.reason);
    });
  });
});

const assertAddonMixinConstructorFailure = (mixin, filter, msg) => {
  assert.throws(
    () => {
      new LatonaMixin(mixin, filter);
    },
    Error,
    msg
  );
};

const assertAddonMixinMixinPropertySet = filter => {
  const mixinObj = {
    foo: "bar"
  };

  const mixin = new LatonaMixin(mixinObj, filter);

  assert.isObject(mixin);
  assert.isDefined(mixin.mixin);
  assert.isNotEmpty(mixin.mixin);
  assert.strictEqual(mixin.mixin.foo, mixinObj.foo);
};

describe("latona-mixin", () => {
  describe("#constructor", () => {
    it("should fail if mixin object is undefined or not an object", () => {
      assertAddonMixinConstructorFailure(
        undefined,
        undefined,
        errorMessages.badMixinObject
      );

      assertAddonMixinConstructorFailure(
        "foo",
        undefined,
        errorMessages.badMixinObject
      );

      assertAddonMixinConstructorFailure(
        123,
        undefined,
        errorMessages.badMixinObject
      );
    });
    it("should fail if filter is not a function", () => {
      assertAddonMixinConstructorFailure(
        {},
        "foo",
        errorMessages.badMixinFilter
      );

      assertAddonMixinConstructorFailure({}, 123, errorMessages.badMixinFilter);

      assertAddonMixinConstructorFailure({}, {}, errorMessages.badMixinFilter);
    });
    it("should set mixin property if filter is not provided", () => {
      assertAddonMixinMixinPropertySet(undefined);
    });
    it("should set mixin property if filter is provided", () => {
      assertAddonMixinMixinPropertySet(() => {
        return true;
      });
    });
    it("should set filter property", () => {
      const filterFunc = () => {
        return true;
      };

      const mixin = new LatonaMixin({ foo: "bar" }, filterFunc);

      assert.isDefined(mixin);
      assert.isDefined(mixin.filter);
      assert.isFunction(mixin.filter);
      assert.equal(mixin.filter, filterFunc);
    });
    it("hasFilter should be true if filter provided ", () => {
      const filterFunc = () => {
        return true;
      };
      const mixin = new LatonaMixin({ foo: "bar" }, filterFunc);
      assert.equal(mixin.hasFilter, true);
    });
    it("hasFilter should be false if filter not provided ", () => {
      const mixin = new LatonaMixin({ foo: "bar" });
      assert.equal(mixin.hasFilter, false);
    });
  });
});
