
require.paths.unshift('spec', 'spec/lib', 'lib')
require('jspec')
Check = require('check').Check;

JSpec
  .exec('spec/unit/spec.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures', failuresOnly: true })
  .report()
