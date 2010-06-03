describe "validator.js"
	describe "-> defined"		
		before
			v = Check.build(function() {
				this.defined();
			});
		end
	
		it "should return true on defined"
			v(0).should.be_true 
			v('').should.be_true 
			v({}).should.be_true 
		end
	
		it "should throw errors on null and undefined"
			-{  v(null)  }.should.throw_error 'Expected "null" to be defined'
			-{  v(function(){}())  }.should.throw_error 'Expected "undefined" to be defined'
		end
	end
	
	describe "-> type"
		describe "-> simple"
			before
				v = Check.build(function() {
					this.type("string");
				});
			end
			
			it "should return true if ok"
				v("plop").should.be_true 
			end
			
			it "should throw error if false"
				-{ v(3) }.should.throw_error 'Expected [number 3] to be of type: string'
			end
		end
		
		describe "-> multiple"
			before
				v = Check.build(function() {
					this.type(["string", "number"]);
				})
			end
			
			it "should return true if ok"
				v(3).should.be_true 
				v("3").should.be_true 
			end
			
			it "should throw error if false"
				-{ v({}) }.should.throw_error 'Expected [object [object Object]] to be of type: string, number'
			end
		end
	end
	
	describe "-> range"
		describe "-> greater than"
			before
				v = Check.build(function() {
					this.gt(3);
				})
			end
			
			it "should return true if ok"
				v(5).should.be_true 
			end
			
			it "should throw error if false"
				-{ v(2) }.should.throw_error 'Expected 2 to be greater than 3'
			end
		end
		
		describe "-> less than"
			before
				v = Check.build(function() {
					this.lt(5)
				});
			end
			
			it "should return true if ok"
				v(3).should.be_true 
			end
			
			it "should throw error if false"
				-{ v(6) }.should.throw_error 'Expected 6 to be less than 5'
			end
		end
		
		describe "-> at least"
			before
				v = Check.build(function() {
					this.al(5);
				});
			end
			
			it "should return true if ok"
				v(5).should.be_true 
			end
			
			it "should throw error if false"
				-{ v(4) }.should.throw_error 'Expected 4 to be at least 5'
			end
		end
		
		describe "-> at most"
			before
				v = Check.build(function() {
					this.am(5);
				});
			end
			
			it "should return true if ok"
				v(5).should.be_true 
			end
			
			it "should throw error if false"
				-{ v(6) }.should.throw_error 'Expected 6 to be at most 5'
			end
		end
		
		describe "-> between"
			before
				v = Check.build(function() {
					this.between(4, 7);
				});
			end
			
			it "should return true if ok"
				v(4).should.be_true 
				v(6).should.be_true 
				v(7).should.be_true 
			end
			
			it "should throw error if false"
				-{ v(3) }.should.throw_error 'Expected 3 to be between 4 and 7'
				-{ v(8) }.should.throw_error 'Expected 8 to be between 4 and 7'
			end
		end
	end
	
	describe "-> equality"
		before
			v = Check.build(function() {
				this.is(5)
			});
		end
		
		it "should return true if ok"
			v(5).should.be_true 
		end
		
		it "should throw error if false"
			-{ v('5') }.should.throw_error "Expected [string 5] to be [number 5]"
		end
	end
	
	describe "-> custom rule"
		before
			Check.addRule("isMajor", function(val) { 
				return this.assert.atLeast(val, this.params[0]);
			}, 'Expected {val} to be at least {0}');
			
			v = Check.build(function() {
				this.isMajor(18);
			});
		end
		
		it "should return true if ok"
			v(18).should.be_true 
		end
		
		it "should throw error if false"
			-{ v(10) }.should.throw_error 'Expected 10 to be at least 18'
		end
	end
	
	describe "-> valid"
		before
			v = Check.build(function() {
				this.valid();
			});
		end
		
		it "should always be true"
			v(false).should.be_true 
			v(true).should.be_true 
			v('plop').should.be_true 
			v(null).should.be_true 
		end
	end
	
	describe "-> invalid"
		before
			v = Check.build(function() {
				this.invalid();
			});
		end
		
		it "should always throw error"
			-{ v(true) }.should.throw_error 
			-{ v('plop') }.should.throw_error 
		end
	end
end