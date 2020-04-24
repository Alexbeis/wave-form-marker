var Benchmark = require('benchmark');

var suite = new Benchmark.Suite('Essentia Benchamarking');

// add tests
suite.add('RegExp#test', function() {
    /o/.test('Hello World!');
  })
  .add('String#indexOf', function() {
    'Hello World!'.indexOf('o') > -1;
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log(this);
  })
  // run async
  .run({ 'async': true });
