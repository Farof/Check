"use strict";

(function Check_closure(exports) {
  
  Array.isArray = function (obj) {
    return obj && typeof obj === 'object' && typeof obj.splice === 'function';
  };
  
  
  
  var Validator = function (r, or) {
    var
    i, ln,
    rule, neg = false, type, isArray;
    
    this.rules = [];
    this.or = or || false;
    
    for (i = 0, ln = r.length; i < ln; i += 1) {
      rule = r[i];
      type = typeof rule;
      if (type === 'string') {
        if (rule[0] === '!') {
          neg = true;
          rule = rule.substring(1);
        }
        if (rules[rule]) {
          this.rules.push(rules[rule].getPromise(neg));
        } else {
          throw new Error('undefined rule: ' + rule);
        }
      } else if (Array.isArray(rule)) {
        this.rules.push(new Validator(rule, true));
      } else if (type === 'object') {
        for (var key in rule) {
          if (key[0] === '!') {
            neg = true;
            key = key.substring(1);
          }
          if (rules[key]) {
            this.rules.push(rules[key].getPromise(neg, rule[(neg ? '!' : '') + key])); 
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
        isValid = !self.or,
        errors = [],
        current = 0,
        remains = nbRules,
        
        handleAsync = function (err, result) {
          isValid = self.or ? (isValid || result) : (isValid && result);
          remains -= 1;
          if (remains === 0) {
            return handleEnd();
          }
        },
        
        handleEnd = function () {
          if (!isValid && self.or) {
            var error = new Error('OR failed');
            error.orMsg = errors;
            throw error;
          }
          if (callback) {
            return callback(null, isValid);
          }
          return isValid;
        };
        
        while (current < nbRules) {
          try {
            rules[current](value, handleAsync);
          } catch (e) {
            if (self.or) {
              errors.push(e);
            } else {
              throw e;
            }
          }
          current += 1;
        }
        
        return handleEnd();
      };
    }
  }
  
  
  var Rule = function (name, test, msg, negMsg) {
    this.name = name;
    this.test = test;
    this.msg = msg;
    this.negMsg = negMsg;
  };
  
  Rule.prototype = {
    constructor: Rule,
    
    getPromise: function (negation, params) {
      params = params ? (Array.isArray(params) ? params : [params]) : [];
      
      var
      
      self = this,
      
      ctx = {
        assert: assert,
        params: params
      },
      
      throwError = function (value) {
        var errorMsg, error;
        
        if ((!negation && self.msg) || (negation && self.negMsg)) {
          errorMsg = negation ? self.negMsg : self.msg;
          errorMsg = errorMsg.replace('{val}', value)
                              .replace('{type:val}', typeof value)
                              .replace('{join:val}', Array.isArray(value) ? value.join(', ') : '')
                              .replace('{join:param}', params.join(', '))
                              .replace('{not}', (negation ? 'not ' : ''));
                              
          for (var i = 0, ln = params.length; i < ln; i += 1) {
            errorMsg = errorMsg.replace('{' + i + '}', params[i])
                    .replace('{type:' + i + '}', typeof params[i]);
          }
        } else {
          errorMsg = 'Validation did not pass rule "' + self.name + '"';
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
          
          if ((result && !negation) || (!result && negation)) {
            return callback(null, true);
          }
          throwError(value);
        },
        
        isValid = self.test.call(ctx, value, handleAsync);

        if(typeof isValid !== 'undefined') { 
          if ((isValid && !negation) || (!isValid && negation)) {
            resultHandled = true;
            return callback(null, true);
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
  
  
  var rules = Check.rules = {
    
  };
  
  
  Check.addRule = function (name, test, msg, negationMessage) {
    rules[name] = new Rule(name, test, msg, negationMessage);
    return this;
  };
  
  
  Check.addRule('defined', function (value) {
    return this.assert.defined(value);
  }, 'Expected "{val}" to be defined', 'Expected {val} to be undefined or null');
  
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
  }, 'Expected [{type:val} {val}] to be of type: {join:param}', 'Expected [{type:val} {val}] to not be of type: {join:param}');
  
  Check.addRule('gt', function (val) {
    return this.assert.greaterThan(val, this.params[0]);
  }, 'Expected {val} to be greater than {0}', 'Expected {val} to be at most {0}');
  
  Check.addRule('lt', function (val) {
    return this.assert.lessThan(val, this.params[0]);
  }, 'Expected {val} to be less than {0}', 'Expected {val} at least {0}');
  
  Check.addRule('al', function (val) {
    return this.assert.atLeast(val, this.params[0]);
  }, 'Expected {val} to be at least {0}', 'Expected {val} to be less than {0}');
  
  Check.addRule('am', function (val) {
    return this.assert.atMost(val, this.params[0]);
  }, 'Expected {val} to be at most {0}', 'Expected {val} to be greater than {0}');
  
  Check.addRule('positiv', function (val) {
    return this.assert.atLeast(val, 0);
  }, 'Expected {val} to be positiv', 'Expected {val} to be negativ');
  
  Check.addRule('negativ', function (val) {
    return this.assert.atMost(val, 0);
  }, 'Expected {val} to be negativ', 'Expected {val} to be positiv');
  
  Check.addRule('notZero', function (val) {
    return !this.assert.equal(val, 0);
  }, 'Expected {val} to not be zero', 'Expected {val} to be 0');
  
  Check.addRule('between', function (val) {
    return this.assert.atLeast(val, this.params[0]) && 
            this.assert.atMost(val, this.params[1]);
  }, 'Expected {val} to be between {0} and {1}', 'Expected {val} not to be between {0} and {1}');
  
  Check.addRule('is', function (val) {
    return this.assert.equal(val, this.params[0]);
  }, 'Expected [{type:val} {val}] to be [{type:0} {0}]', 'Expected [{type:val} {val}] to be different than [{type:0} {0}]');
  
  Check.addRule('valid', function () {
    return true;
  }, '{val} is valid', '{val} is invalid');
  
  Check.addRule('invalid', function () {
    return false;
  }, '{val} is invalid', '{val} is valid');
  
  Check.addRule('has', function (val) {
    return this.assert.atLeast(val.indexOf(this.params[0]), 0);
  }, 'Expected [{join:val}] to contain [{type:0} {0}]', 'Expected [{join:val}] to not contain [{type:0} {0}]');
  
  Check.addRule('in', function (val) {
    return this.assert.atLeast(this.params.indexOf(val), 0);
  }, 'Expected [{type:val} {val}] to be in [{join:param}]', 'Expected [{type:val} {val}] to not be in [{join:param}]');
  
  
}(typeof exports === 'undefined' ? window : exports));
