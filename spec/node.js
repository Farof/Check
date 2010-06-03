
require.paths.unshift('spec', '/Users/farof/.gem/ruby/1.8/gems/jspec-4.3.1/lib', 'lib')
require('jspec')
Check = require('check').Check;

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
