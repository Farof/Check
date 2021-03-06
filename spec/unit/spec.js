describe "validator.js"
  describe "-> defined"   
    before
      v = Check.build('defined');
    end
    
    after
      delete v;
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
        v = Check.build({type: 'string'});
      end
      
      after
        delete v;
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
        v = Check.build({type: ['string', 'number']})
      end
      
      after
        delete v;
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
        v = Check.build({gt: 3})
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
        v = Check.build({lt: 5});
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
        v = Check.build({al: 5});
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
        v = Check.build({am: 5});
      end
      
      it "should return true if ok"
        v(5).should.be_true 
      end
      
      it "should throw error if false"
        -{ v(6) }.should.throw_error 'Expected 6 to be at most 5'
      end
    end
    
    describe "-> positiv"
      before
        v = Check.build('positiv');
      end
      
      it "should return true if ok"
        v(0).should.be_true 
      end
      
      it "should throw error if false"
        -{ v(-1) }.should.throw_error 'Expected -1 to be positiv'
      end
    end
    
    describe "-> negativ"
      before
        v = Check.build('negativ');
      end
      
      it "should return true of ok"
        v(0).should.be_true
      end
      
      it "should throw error if false"
        -{ v(1) }.should.throw_error 'Expected 1 to be negativ'
      end
    end
    
    describe "-> notZero"
      before
        v = Check.build('notZero')
      end
      
      it "should return true if ok"
        v(4).should.be_true 
      end
      
      it "should throw error if false"
        -{ v(0) }.should.throw_error 'Expected 0 to not be zero'
      end
    end
    
    describe "-> between"
      before
        v = Check.build({between: [4, 7]});
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
      v = Check.build({is: 5});
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
      
      v = Check.build({isMajor: 18});
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
      v = Check.build('valid');
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
      v = Check.build('invalid');
    end
    
    it "should always throw error"
      -{ v(true) }.should.throw_error 
      -{ v('plop') }.should.throw_error 
    end
  end
  
  describe "-> has"
    before
      v = Check.build({has: 42});
    end
    
    it "should return true if ok"
      v([20, 42, 100]).should.be_true 
    end
    
    it "should throw error when false"
      -{ v([20, 100]) }.should.throw_error 'Expected [20, 100] to contain [number 42]'
    end
  end
  
  describe "-> in"
    before
      v = Check.build({'in': [1, 3, 5, 7]})
    end
    
    it "should return true if ok"
      v(5).should.be_true
    end
    
    it "should throw error if false"
      -{ v(2) }.should.throw_error 'Expected [number 2] to be in [1, 3, 5, 7]'
    end
  end
  
  describe "-> length rules"
    describe "-> length"
      before
        v = Check.build({length: 5});
      end
    
      it "should return true if ok"
        v('farof').should.be_true 
        v([1, 2, 3, 4, 5]).should.be_true 
      end
    
      it "should throw error if false"
        -{ v('Bob') }.should.throw_error 'Expected [Bob] to have a length of 5'
        -{ v([1, 2]) }.should.throw_error 'Expected [1, 2] to have a length of 5'
      end
    end
    
    describe "-> lengthAtLeast"
      before
        v = Check.build({lengthAtLeast: 3});
      end
      
      it "should return true if ok"
        v('Bob').should.be_true 
        v([1, 2, 3]).should.be_true 
      end
      
      it "should throw error if false"
        -{ v('Yo') }.should.throw_error 'Expected [Yo] length to be at least 3'
        -{ v([1, 2]) }.should.throw_error 'Expected [1, 2] length to be at least 3'
      end
    end
    
    describe "-> lengthAtMost"
      before
        v = Check.build({lengthAtMost: 3});
      end
      
      it "should return true if ok"
        v('Bob').should.be_true 
        v([1, 2, 3]).should.be_true 
      end
      
      it "should throw error if false"
        -{ v('Farof') }.should.throw_error 'Expected [Farof] length to be at most 3'
        -{ v([1, 2, 3, 4]) }.should.throw_error 'Expected [1, 2, 3, 4] length to be at most 3'
      end
    end
    
    describe "-> longerThan"
      before
        v = Check.build({longerThan: 3});
      end
      
      it "should return true if ok"
        v('Farof').should.be_true 
        v([1, 2, 3, 4]).should.be_true 
      end
      
      it "should throw error if false"
        -{ v('Bob') }.should.throw_error 'Expected [Bob] to be longer than 3'
        -{ v([1, 2, 3]) }.should.throw_error 'Expected [1, 2, 3] to be longer than 3'
      end
    end
    
    describe "-> shorterThan"
      before
        v = Check.build({shorterThan: 3});
      end
      
      it "should return true if ok"
        v('Yo').should.be_true 
        v([1, 2]).should.be_true 
      end
      
      it "should throw error if false"
        -{ v('Bob') }.should.throw_error 'Expected [Bob] to be shorter than 3'
        -{ v([1, 2, 3]) }.should.throw_error 'Expected [1, 2, 3] to be shorter than 3'
      end
    end
    
    describe "lengthBetween"
      before
        v = Check.build({lengthBetween: [3, 5]});
      end
      
      it "should return true of ok"
        v('Farof').should.be_true 
      end
      
      it "should throw error if false"
        -{ v('Yo') }.should.throw_error 'Expected [Yo] length to be between 3 and 5'
        -{ v('javascript') }.should.throw_error 'Expected [javascript] length to be between 3 and 5'
      end
    end
  end
  
  describe "-> Rule message customization"
    it "should be accessible"
      Check.should.have_prop "rules"
      Check.rules.defined.should.have_prop "msg"
    end
    
    it "should be customizable"
      var previous = Check.rules.defined.errorMsg;
      Check.rules.defined.msg = "Customized error message!"
      var v = Check.build('defined');
      
      -{ v(null) }.should.throw_error "Customized error message!"
      Check.rules.defined.msg = previous;
    end
  end
  
  describe "-> async validation"
    before
      v = Check.build('defined');
    end
    
    it "should validate asynchrone"
      mark = false;
      v(5, function() { mark = true; })
      mark.should.be_true 
    end
    
    it "should throw error asynchrone"
      mark = false;
      try {
        v(null, function() { mark = false; })
      } catch(e) {
        mark = true;
      }
      mark.should.be_true 
    end
  end
  
  describe "-> async rule validation"
    before
      Check.addRule("asyncReady", function(val, callback) {
        callback(null, this.assert.equal(val, 42));
      });
      
      v = Check.build('asyncReady');
    end
    
    it "should validate async rule"
      mark = false;
      v(42, function() { mark = true; })
      mark.should.be_true 
    end
    
    it "should throw async"
      mark = false;
      try {
        v(10, function() { mark = false; })
      } catch(e) {
        mark = true;
      }
      mark.should.be_true 
    end
  end
  
  describe "-> operators"
    describe "-> NOT"
      before
        v = Check.build('!invalid', {'!type': 'number'});
      end
      
      it "should return true if ok"
        v(null).should.be_true 
      end
      
      it "should throw error if false"
        -{ v(5) }.should.throw_error 'Expected [number 5] to not be of type: number'
      end
      
      describe "-> async"
        before
          v = Check.build('!asyncReady');
        end
        
        it "should return true if ok"
          mark = false;
          v(40, function () { mark = true; })
          mark.should.be_true 
        end
        
        it "should throw error"
          mark = false;
          -{ v(42, function () { mark = true; }) }.should.throw_error 
          mark.should.be_false 
        end
      end
    end
    
    describe "-> OR"
      before
        v = Check.build([{is: 42}, {between: [20, 30]}]);
      end
      
      it "should return true if ok"
        v(42).should.be_true
        v(25).should.be_true 
      end
      
      it "should throw error if false"
        -{ v(37) }.should.throw_error
      end
    end
  end
end