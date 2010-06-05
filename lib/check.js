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
	rulesBuilder = Check.rules = {},
	
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
		
		defined: (function () {
			var undef = (function () {}());
			return function (a) {
				return a !== null && a !== undef;
			};
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
		var rule = rulesBuilder[name] = function () {
			var params = Array.prototype.slice.apply(arguments);
			
			// refresh errorMsg in case it was customized
			errorMsg = rulesBuilder[name].errorMsg;
			
			this.rules.push(function (val, callback) {
				var
				
				resultHandled = false,
				
				throwError = function () {
					var msg, e, i, ln, join;
					
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
					e.rule = rulesBuilder[name];
					throw e;
				},

				handleResult = function (err, result) {
					if (resultHandled) {
						return;
					}
					resultHandled = true;
					
					if (result) {
						callback(null, true);
					} else {
						throwError();
					}
				},
				
				ret = func.call({params: params, assert: assert}, val, handleResult);
				
				
				// If ret is undefined, rule is async and taken care of
				if (typeof ret !== 'undefined') {
					if (ret) {
						callback(null, true);
					} else {
						throwError();
					}
				}
				
			});
			
			// return this for rule chainability
			return this;
		};
		
		rule.errorMsg = errorMsg;
		rule.name = name;
		
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
		var rules = rulesBuilder.rules,
				nbRules = rules.length;
		
		delete rulesBuilder.rules;
		
		return function (value, callback) {
			var 
			isValid = true,
			
			current = 0,
			remains = nbRules,
			
			next = function (err, result) {
				isValid = isValid && result;
				remains -= 1;
				if (remains === 0 && callback) {
					callback(null, isValid);
				}
			};
			
			while (current < nbRules) {
				rules[current](value, next);
				current += 1;
			}
			
			return isValid;
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
				self = this,
				i, ln;
		if (typeof types === 'string') {
			types = this.params[0] = [types];
		}
		
		for(i = 0, ln = types.length; i < ln; i += 1) {
			if(self.assert.type(val, types[i])) {
				return true;
			}
		}
		
		return false;
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
	
	Check.addRule('valid', function () {
		return true;
	});
	
	Check.addRule('invalid', function () {
		return false;
	});
	
	
}(typeof exports === 'undefined' ? window : exports));
