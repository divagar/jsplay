var _ = require('lodash');
var R = require('ramda');
var P = require('parsimmon');
var L = require('./logger');

L.heading('Tokenize and Generator AST!');

/* Command line args */
var processArgs = process.argv.slice(2);

/* Between parsers */
var between            = (p1, p2, p3) => { return p1.then(p2).skip(p3) };
var betweenRoundParser = (parser) => { return (between(P.string('('), parser, P.string(')'))) };

/* White space parsers */
var parseOptWspace     = P.optWhitespace;
var skipWspaceParser   = (parser) => { return (between(parseOptWspace, parser, parseOptWspace)) };

/* Letter & Digits parsers */
var parseLetters       = skipWspaceParser(P.letters.map((out) => {return {'type': 'LettersLiteral', 'value': out}}));
var parseDigits        = skipWspaceParser(P.digits.map((out) => {return {'type': 'DigitsLiteral', 'value': out}}));
var parseSymbols       = skipWspaceParser(P.regexp(/[a-zA-Z_-][a-zA-Z0-9_-]*/).map((out) => 
                                                    {return {'type': 'SymbolsLiteral', 'value': out}}));
var parseLettersDigits = skipWspaceParser(P.seqMap(parseLetters, parseDigits, (out1, out2) => out1 + out2));

/* char parser */
var charParser         = (char) => { return P.string(char) };
var commaParser        = skipWspaceParser(charParser(','));



//run
//typical input can be: (fn 7,7) 
processArgs.length ? runParser(expParser, processArgs[0]) : L.error('No input provided !');