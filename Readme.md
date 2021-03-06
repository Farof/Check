
# Check

Check is a lightweight easy to use, easy to customize, validation micro-framework for javascript

## Quick how-to

### Create validator

	// Will test if validated data is defined, of type 'number', not negativ and is between 7 and 77
	var validate = Check.build('defined', {type: 'number'}, '!negativ', {between: [7, 77]});

### Validate data

	try {
		validate(42);
		// code if data was validated
	} catch(e) {
		// code if validation failed
	}

### Create and use custom rule

	Check.addRule('isMajor', function(val) {
		// asserts the validated value is at least a later defined number
		return this.assert.atLeast(val, this.params[0]);
	}, 'Expected {val} to be at least {0}');
	
	// Majority is set to 18, corresponds to this.params[0] in the previous function
	var validate = Check.build({isMajor: 18});
	
	try {
		validate(10);
	} catch(e) {
		alert(e.message) // "Expected 10 to be at least 18"
	}

### Asynchronous validation

	// The rule must not return any value if validation is asynchronous
	Chack.addRule('usernameAvailable', function(username, callback) {
		MockRequest( {
			// request params
			success: function(availability) {
				callback(null, availability);
			}
		})
	});
	
	var validate = Check.build({type: 'string'}, 'usernameAvailable');
	
	try {
		validate('Farof', function() {
			// code if validation succeeded
			// display message saying username is ok
		})
	} catch(e) {
		// code if validation failed
	}

### Custom error message

	Check.rules.defined.msg = 'Field must be filled';


## Documentation

### Built-in rules

*	defined

	value must not be null or undefined
		
* is: data

	tests strict equality (===)
		
* type: String || [String, ...]

	typeof tested value must be one of the types specified
		
* gt: Number

	value must be greater than specified number
		
* lt: Number

	value must be less than specified number
		
* al: Number

	value must be at least specified number
		
* am: Number

	value must be at most specified number

* positiv

	value must be at least 0

* negativ

	value must be at most 0 (0 is both positiv and negativ)

* notZero

	value is different from 0
		
* between: [Number, Number]

	value must be between the two specified numbers, numbers included (between(10, 20) validates 10 and 20)

* valid

	rule always validate

* invalid

	rule always throw error

* has: data

	value must be an array that includes the specified data

* in: array

	value must be in specified array

* length: Number

	value length must be specified number

* lengthAtLeast: Number

	value length must be at least specified number

* lengthAtMost: Number

	value length must be at most specified number

* longerThan: Number

	value length must be more than specified number

* shorterThan: Number

	value length must be less than specified number

* lengthBetween: [Number, Number]

	value length must be between specified numbers


#### NOT operator

You can apply a NOT operator by prefixing the rule with a exclamation mark: !

	var validate = Check.build('!invalid', {'!is': 42});
	
	try {
		validate(nb);
		// if nb is not the number 42
	} catch(e) {
		// if nb === 42
	}


#### OR operator

The validator can performs an OR operation when it detects an array as argument

	var validate = Check.build([
		{is: 42}, 
		{between: [20, 30]}
	]);
	
	try {
		validate(nb);
		// if nb is 42 OR nb is between 20 and 30 
	} catch (e) {
		// everything else
	}

### Built-in assertions

* equal(a, b)

	a === b

* defined(a)

	a !== null && a !== undefined
		
* type(a, someType)

	typeof a === someType
		
* greaterThan(a, b)

	a > b
		
* lessThan(a, b)

	a < b
		
* atLeast(a, b)

	a >= b
		
* atMost(a, b)

	a <= b


### Custom rules

	Check.addRule('someName', function(val) {
		return this.someAssertions(val);
	}, 'Custom error message with special params like {val} or {0}', 'Negation error message with special parameters')

Look at the "Quick how-to" and how the built-in rules are created to fully understand. Really, it's dead simple.  
A negation error message must be given if you want proper reporting in these case.
Rules support asynchronous validation.


### Custom error message

	Check.rules.defined.msg = 'Field must be filled';
	Check.rules.defined.negMsg = 'custom negation message'
	
	var validate = Check.build('defined');
	
	try {
		validate(null);
	} catch(e) {
		alert(e.message); // 'Field must be filled'
	}

Note: At the moment, message customization affects all validator. That is, between two change of the message. You can change the message, validate, then restore it to default or something else.  
Let me know if error message customization "by validator" is something you need, I'll maybe add the feature.


## Supported plateforms (v0.3.*)

* Firefox: 3.6, Minefield
* Safari: 4
* Opera: 10
* node

The following are untested:

* Chrome (jspec fails due to a chrome bug but Check should work)
* Internet Explorer: 7, 8, 9 (should work) (won't bother supporting ie6, glad if it works anyway)


## Todo

* better error reporting for OR operator
* Suggest anything ?

## License 

(The MIT License)

Copyright (c) 2010 Mathieu Merdy &lt;gfarof@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.