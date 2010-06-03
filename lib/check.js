"use strict";

(function (exports) {
	
	var 
	
	/**
	 *	Main helper
	 */
	Check = exports.Check = {},
	
	/**
	 *	Contains the validation rules.
	 *	The validation rules are built later
	 */
	rulesBuilder = {},
	
	/**
	 *	Simple assertion helpers
	 */
	assert = {
		equal: function (a, b) {
			return a === b;
		},
		
		greaterThan: function (a, b) {
			return a > b;
		},
		
		lessThan: function (a, b) {
			return a < b;
		},
		
		atLeast: function (a, b) {
			return a >= b;
		},
		
		atMost: function (a, b) {
			return a <= b;
		},
		
		defined: (function() {
			var undef = function(){}();
			return function (a) {
				return a !== null && a !== undef;
			}
		}()),
		
		type: function (val, type) {
			return typeof val === type;
		}
	};
	
	
	
	/**
	 *	Validator rule creator
	 *
	 *	The name of the rule will be the function called when building a validator.
	 *	If you create a rule named "isMajor", you will then access it via "this.isMajor()" in validator builder
	 *
	 *	The second parameter, a function, returns a bolean describing if the value passes the rule.
	 *	The function receives 1 argument which is the value to be tested.
	 *
	 *	It as also access to two helpers :
	 *
	 *		this.assert	->	object containing simple assertions method. eg: assert.equal, assert.type, ...
	 *		this.params	->	array of arguments given to the rule when building the validator
	 *
	 *	Last parameter is a personalized error message that will appear when the rule fails to validate
	 *	It can contains several magic value that will be replaced by used value at runtime.
	 *		{val}					-> tested value
	 *		{type:val}		-> type of the tested value
	 *		{join:val}		-> if value is an array, value.join(', ')
	 *		{0}						-> first argument given to the rule when building the validator
	 *		{type:0}			-> ...
	 *		{join:0}			-> ...
	 *		{1}						-> etc...
	 *
	 *	For full comprehension, see super-easy rule creation below
	 *
	 *
	 * @param {string} name
	 * @param {function} func
	 * @param {string} errorMsg
	 * @return Check
	 */
	Check.addRule = function (name, func, errorMsg) {
		rulesBuilder[name] = function (majority) {
			var params = Array.prototype.slice.apply(arguments);
			
			this.rules.push(function (val) {
				var ret = func.call({params: params, assert: assert}, val),
						msg, e, i, ln, join;
				
				// If the function given in params returns true (assertions validated)
				if (ret) {
					return true;
				}
				
				// else build and throw error (rule violated)
				if (errorMsg) {
					msg = errorMsg.concat();
					msg = msg.replace('{val}', val, 'g')
										.replace('{type:val}', typeof val, 'g')
										.replace('{join:val}', function () {
											return val.join(', ');
										}, 'g');
					
					join = function () {
						return params[i].join(', ');
					};
					for (i = 0, ln = params.length; i < ln; i += 1) {
						msg = msg.replace('{' + i + '}', params[i], 'g')
											.replace('{type:' + i + '}', typeof params[i], 'g')
											.replace('{join:' + i + '}', join, 'g');
					}
				} else {
					msg = 'Validation did not pass rule "' + name + '"';
				}
				
				e = new Error(msg);
				e.val = val;
				e.params = params;
				throw e;
			});
			
			// return this for rule chainability
			return this;
		};
		
		return Check;
	};
	
	/**
	 *	Builds a validator (collection of rules)
	 *
	 *	The function given in argument must apply a collection of rules
	 *	Example : validator that verify the value is a number between 7 and 77
	 *
	 *		var v = Check.build(function() {
	 *			this.type('number').between(7, 77);
	 *		});
	 *
	 *	Then use the validator :
	 *
	 *		try {
	 *			v(age);
	 *			// code if validation succeeded
	 *		} catch(e) {
	 *			// code if validation failed
	 *		}
	 *
	 *
	 *	The function returns a validator function.
	 *
	 * @param {function} func
	 * @return {function}
	 */
	Check.build = function (func) {
		rulesBuilder.rules = [];
		
		func.call(rulesBuilder);
		var rules = rulesBuilder.rules;
		
		delete rulesBuilder.rules;
		
		return function (value) {
			return rules.every(function (rule) {
				return rule(value);
			});
		};
	};
	
	
	
	/**
	 *	Default rules creation
	 */
	
	Check.addRule('defined', function (val) {
		return this.assert.defined(val);
	}, 'Expected "{val}" to be defined');
	
	Check.addRule('type', function (val) {
		var types = this.params[0],
				self = this;
		if (typeof types === 'string') {
			types = this.params[0] = [types];
		}
		
		return types.some(function (type) {
			return self.assert.type(val, type);
		});
	}, 'Expected [{type:val} {val}] to be of type: {join:0}');
	
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
	
	Check.addRule('between', function (val) {
		return this.assert.atLeast(val, this.params[0]) && 
						this.assert.atMost(val, this.params[1]);
	}, 'Expected {val} to be between {0} and {1}');
	
	Check.addRule('is', function (val) {
		return this.assert.equal(val, this.params[0]);
	}, 'Expected [{type:val} {val}] to be [{type:0} {0}]');
	
	Check.addRule('valid', function() {
		return true;
	});
	
	Check.addRule('invalid', function() {
		return false;
	});
	
	
}(typeof exports === 'undefined' ? window : exports));
