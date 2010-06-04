
# Check

Check is an easy to use, easy to customize, validation micro-framework for javascript

## Quick how-to

### Create validator

	var validate = Check.build(function() {
		// Will test if validated data is defined, of type 'number', and is between 7 and 77
		this.defined().type('number').between(7, 77);
	});

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
		return this.assert.atLeast(val, this.args[0]);
	}, 'Expected {val} to be at least {0}');
	
	var validator = Check.build(function() {
		this.isMajor(18); // Majority is set to 18, corresponds to this.args[0] in the previous function
	});
	
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
	
	var validate = Check.build(function() {
		this.type('string').usernameAvailable();
	});
	
	try {
		validate('Farof', function() {
			// code if validation succeeded
			// display message saying username is ok
		})
	} catch(e) {
		// code if validation failed
	}

## Documentation

### Built-in rules

*	defined()

	value must not be null or undefined
		
* is(data)

	tests strict equality (===)
		
* type(String || [String, ...])

	typeof tested value must be one of the types specified
		
* gt(Number)

	value must be greater than specified number
		
* lt(Number)

	value must be less than specified number
		
* al(Number)

	value must be at least specified number
		
* am(Number)

	value must be at most specified number
		
* between(Number, Number)

	value must be between the two specified numbers, numbers included (between(10, 20) validates 10 and 20)

* valid()

	rule always validate

* invalid()

	rule always throw error



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
	}, 'Custom error message with special params like {val} or {0}')

Look at the "Quick how-to" and how the built-in rules are created to fully understand. Really, it's dead simple.  
Rules support asynchronous validation.


## Supported plateforms

* Firefox: 3.5, 3.6, Minefield
* Safari: 4
* Opera: 10

The following are untested:

* Chrome (jspec fails but Check should work)
* Internet Explorer
* node (jspec says 0 tests are executed...)


## Todo

* Custom built-in error message

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