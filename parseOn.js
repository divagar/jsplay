var _ = require('lodash');
var R = require('ramda');
var P = require('parsimmon');
var L = require('./logger');

L.heading('Howdy Parsimmon !');

L.info('Letters :');
var parseLetters = P.letters;
L.log(parseLetters.parse(''));

L.info('Digits :');
var parseDigits = P.digits;
L.log(parseDigits.parse('123'));

L.info('Symbols :');
var parseSymbols = P.regexp(/[a-zA-Z_-][a-zA-Z0-9_-]*/);
L.log(parseSymbols.parse('p14'));

L.info('Contain :');
var parseContain = P.regexp(/^(.*?(\berror|Error\b)[^$]*)$/);
L.log(parseContain.parse('sdgsdg errrdsgsdgError'));

L.info('Letters & Digits :');
var parseLettersDigits = P.seqMap(parseLetters, parseDigits, (out1, out2) => out1 + out2);
L.log(parseLettersDigits.parse('abc123'));

L.info('Whitespace :');
var parseWspace = P.whitespace;
L.log(parseWspace.parse('   '));

L.info('Opt Whitespace :');
var parseOptWspace = P.optWhitespace;
L.log(parseOptWspace.parse('   '));


var between = (p1, p2, p3) => {
    return p1.then(p2).skip(p3);
}
L.info('Letter between parser :');
var betweenRoundParser = (parser) => { return ( between(P.string('('), parser, P.string(')')) ) };
var betweenLetterP     = betweenRoundParser(parseLetters);
L.log(betweenLetterP.parse('(diva)'));

L.info('Skip whitespace parser :');
var skipWspaceParser  = (parser) => { return ( between(parseOptWspace, parser, parseOptWspace) ) };
var skipWspaceLetterP = skipWspaceParser(parseLetters);
L.log(skipWspaceLetterP.parse(' diva  '));

L.info('Parse ex (a+b) :');
var parseEx = P.seq(P.letter, P.string('+'), P.letter);
var exParser = betweenRoundParser(parseEx);
L.log(exParser.parse('(c+a)'));
L.log(exParser.parse('(a+b)'));

L.info('Parse ex (add a,b) -> def add(a, b): :');
var parseEx = P.seqMap(
                skipWspaceParser(parseLettersDigits),
                skipWspaceParser(parseLettersDigits),
                skipWspaceParser(P.string(',')),
                skipWspaceParser(parseLettersDigits),
                (out1, out2, out3, out4) =>
                    'def ' + out1 + '(' + out2 + out3 + out4 + '):'
                );
var exParser = skipWspaceParser(betweenRoundParser(parseEx));
L.log(exParser.parse('(add a,b)'));
L.log(exParser.parse('(fn1 arg1,arg2)'));
L.log(exParser.parse(' (      double          x ,       y )'));


L.nl();