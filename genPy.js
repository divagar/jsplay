var P  = require('parsimmon');
var L  = require('./logger');
var fs = require('fs');
var M  = require('mustache');
var wStream = fs.createWriteStream('myOut.py');

L.heading('Parser and Generator !');

/* Command line args */
var processArgs = process.argv.slice(2);

/* Between parsers */
var between            = (p1, p2, p3) => { return p1.then(p2).skip(p3) };
var betweenRoundParser = (parser) => { return (between(P.string('('), parser, P.string(')'))) };

/* White space parsers */
var parseOptWspace     = P.optWhitespace;
var skipWspaceParser   = (parser) => { return (between(parseOptWspace, parser, parseOptWspace)) };

/* Letter & Digits parsers */
var parseLetters       = skipWspaceParser(P.letters);
var parseDigits        = skipWspaceParser(P.digits);
var parseSymbols       = skipWspaceParser(P.regexp(/[a-zA-Z_-][a-zA-Z0-9_-]*/));
var parseLettersDigits = skipWspaceParser(P.seqMap(parseLetters, parseDigits, (out1, out2) => out1 + out2));

/* char parser */
var charParser         = (char) => { return P.string(char) };
var commaParser        = skipWspaceParser(charParser(','));

/* helper fns */
var runParser = (parser, input) => {
    L.log('Input  : ' + input);
    output = parser.parse(input);
    if (output.status) {
        parseSuccess(output);
        out = generatePy(output.value);
        //generate py code via mustache template
        var mIn = {'add': out}
        mRender(mGeneratePy, mIn);
    }
    else
        parseFailure(output);
    return output;
}
var parseSuccess = (output) => {
    L.success('Parse is successful.');
}
var parseFailure = (output) => {
    L.error('Parse is unsuccessful.');
    L.log('Output : expecting ' + output.expected);
}

var generatePy = (out) => {
    var ret;
    ret = '\n'+ 'def ' + out[0] + '(' + out[1] + out[2] + out[3] + '):';
    ret += '\n\t'+ 'print '+ out[1] +'+'+ out[3];
    ret += '\n\n'+ 'add(15, 10)';
    //wStream.write(ret);
    //wStream.end(() => L.log('Py file is written successfully!'));
    return ret;
}

//Mustache - external template
var mOut;
var mRender = (callback, mIn) => {
  fs.readFile('template.mst', function (err, data) {
    if (err) throw L.error(err);
    mOut = M.render(data.toString(), mIn);
    callback();
  });
}
var mGeneratePy = () => {
  fs.writeFile('myOut.py', mOut, function (err) {
    if (err) return log(err);
    L.log('Py file is written successfully!');
  });
}

/* examples */
L.info('Parse exp (add a,b)');
var parseExp = P.seqMap(
    parseSymbols,
    parseSymbols,
    commaParser,
    parseSymbols,
    (out1, out2, out3, out4) =>
        [out1, out2, out3, out4]
);
var expParser = skipWspaceParser(betweenRoundParser(parseExp));
//runParser(expParser, '(add a,b)');
//runParser(expParser, '(fn1 arg1,arg2)');
//runParser(expParser, ' (      double          x  ,       y )');
processArgs.length ? runParser(expParser, processArgs[0]) : L.error('No input provided !');