"use strict";

(function Check_closure(exports) {
  
  Array.isArray = function (obj) {
    return typeof obj === 'object' && typeof obj.splice === 'function';
  };
  
  
  
  var Validator = function (r) {
    var
    i, ln,
    rule, type, isArray;
    
    this.rules = [];
    
    for (i = 0, ln = r.length; i < ln; i += 1) {
      rule = r[i];
      type = typeof rule;
      if (type === 'string') {
        if (rules[rule]) {
          this.rules.push(rules[rule].getPromise());
        } else {
          throw new Error('undefined rule: ' + rule);
        }
      } else if (Array.isArray(rule)) {
        
      } else if (type === 'object') {
        for (var key in rule) {
          if(rules[key]) {
            this.rules.push(rules[key].getPromise(rule[key])); 
          } else {
            throw new Error('undefined rule: ' + key);
          }
        }
      }
    }
    
    return this.getPromise();
  };
  
  Validator.prototype = {
    constructor: Validator,
    
    getPromise: function () {
      var
      self = this,
      rules = this.rules,
      nbRules = rules.length;
      
      return function (value, callback) {
        
        var
        isValid = true,
        current = 0,
        remains = nbRules,
        
        handleAsync = function (err, result) {
          isValid = isValid && result;
          remains -= 1;
          if (callback && remains === 0) {
            callback(null, isValid)
          }
        };
        
        while (current < nbRules) {
          rules[current](value, handleAsync);
          current += 1;
        }
        
        return isValid;
      };
    }
  }
  
  
  var Rule = function (name, test, msg) {
    this.name = name;
    this.test = test;
    this.msg = msg;
  };
  
  Rule.prototype = {
    constructor: Rule,
    
    getPromise: function (params) {
      params = params ? (Array.isArray(params) ? params : [params]) : [];
      
      var
      
      self = this,
      
      ctx = {
        assert: assert,
        params: params
      },
      
      throwError = function (value) {
        var
        errorMsg = self.msg.replace('{val}', value)
                            .replace('{type:val}', typeof value)
                            .replace('{join}', params.join(', ')),
        error;
        for (var i = 0, ln = params.length; i < ln; i += 1) {
          errorMsg = errorMsg.replace('{' + i + '}', params[i])
                  .replace('{type:' + i + '}', typeof params[i]);
        }
        error = new Error(errorMsg);
        error.testedValue = value;
        error.rule = self.name;
        throw error;
      };
      
      
      return function (value, callback) {
        var
        
        resultHandled = false,
        
        handleAsync = function (err, result) {
          if (resultHandled) {
            return;
          }
          resultHandled = true;
          
          if (result) {
            return callback(null, result);
          }
          throwError(value);
        },
        
        isValid = self.test.call(ctx, value, handleAsync);

        if(typeof isValid !== 'undefined') { 
          if (isValid) {
            resultHandled = true;
            return callback(null, isValid);
          } 
          throwError(value);
        }
      }
    }
  };
  
  
  var Check = exports.Check = function () {
    
  };
  
  
  Check.build = function () {
    var
    
    args = Array.prototype.slice.apply(arguments),
    
    validator = new Validator(args);
    
    return validator;
  };
  
  
  var assert = {
    equal: function assert_equal(a, b) {
      return a === b;
    },
    
    greaterThan: function assert_greaterThan(a, b) {
      return a > b;
    },
    
    lessThan: function assert_lessThan(a, b) {
      return a < b;
    },
    
    atLeast: function assert_atLeast(a, b) {
      return a >= b;
    },
    
    atMost: function assert_atMost(a, b) {
      return a <= b;
    },
    
    defined: (function assert_defined_closure() {
      var undef = (function () {}());
      return function assert_defined(a) {
        return a !== null && a !== undef;
      };
    }()),
    
    type: function assert_type(val, type) {
      return typeof val === type;
    }
  };
  
  
  var rules = {
    
  };
  
  
  Check.addRule = function (name, test, msg) {
    rules[name] = new Rule(name, test, msg);
    return this;
  };
  
  
  Check.addRule('defined', function (value) {
    return this.assert.defined(value);
  }, 'Expected "{val}" to be defined');
  
  Check.addRule('type', function (value) {
    var types = this.params,
        self = this,
        i, ln;
    
    for (i = 0, ln = types.length; i < ln; i += 1) {
      if (self.assert.type(value, types[i])) {
        return true;
      }
    }
    return false;
  }, 'Expected [{type:val} {val}] to be of type: {join}');
  
  Check.addRule('gt', function (val) {
    return this.assert.greaterThan(val, this.params[0]);
  }, 'Expected {val} to be greater than {0}');
  
  Check.addRule('lt', function (val) {
    return this.assert.lessThan(val, this.params[0]);
  }, 'Expected {val} to be less than {0}');
  
  Check.addRule('al', function (val) {
    return this.assert.atLeast(val, this.params[0]);
  }, 'Expected {val} to be at least {0}');
  
  Check.addRule('am', function (val) {
    return this.assert.atMost(val, this.params[0]);
  }, 'Expected {val} to be at most {0}');
  
  Check.addRule('positiv', function (val) {
    return this.assert.atLeast(val, 0);
  }, 'Expected {val} to be positiv');
  
  Check.addRule('negativ', function (val) {
    return this.assert.atMost(val, 0);
  }, 'Expected {val} to be negativ');
  
  Check.addRule('notZero', function (val) {
    return !this.assert.equal(val, 0);
  }, 'Expected {val} to not be zero');
  
  Check.addRule('between', function (val) {
    return this.assert.atLeast(val, this.params[0]) && 
            this.assert.atMost(val, this.params[1]);
  }, 'Expected {val} to be between {0} and {1}');
  
  Check.addRule('is', function (val) {
    return this.assert.equal(val, this.params[0]);
  }, 'Expected [{type:val} {val}] to be [{type:0} {0}]');
  
  Check.addRule('valid', function () {
    return true;
  });
  
  Check.addRule('invalid', function () {
    return false;
  });
  
  
}(typeof exports === 'undefined' ? window : exports));
