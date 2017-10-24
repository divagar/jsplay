var _      = require('lodash');
var R      = require('ramda');
var Either = require('ramda-fantasy').Either;
var fs     = require('fs');
var M      = require('mustache');

var log = (x) => { console.log(x) };

//map example
var double = (x) => { return x + 1 };
var input = [1, 2, 3, 4, 5]
var out = R.map(double, input);
log(out);

//reduce example
var reduce_ = function (bf, acc, container) {
  for (var index = 0; index < container.length; index++)
    acc = bf(acc, container[index]);
  return acc;
}

var add = (acc, x) => { return acc + x };
var out = reduce_(add, 0, input);
log(out);

//recursion example
var rInput = R.reduce(add, 0, input);
var recu = (x) => {
  log(x);
  if (x != 0) recu(x - 1);
}
recu(rInput);


//test example
var str = "aabbcda";
var strArr = str.split('');
var out = (searchChar, strArr) => {
  var res = [];
  for (var i = 0; i < strArr.length; i++) {
    if (searchChar == strArr[i]) 
      res.push(searchChar);
  }
  return res;
}
log(out('a', str));
log(out('b', str));
log(out('d', str));



//Mustache - external template
var mIn = { 'add': 'def add(a,b):\n\tprint a+b\n\nadd(10,7)' }
var mOut;
var mRender = (callback) => {
  fs.readFile('template.mst', function (err, data) {
    if (err) throw log(err);
    mOut = M.render(data.toString(), mIn);
    callback();
  });
}
var mGeneratePy = () => {
  fs.writeFile('out/myOut.py', mOut, function (err) {
    if (err) return log(err);
    log('Py file is written successfully!');
  });
}
//Run mustache
mRender(mGeneratePy);
