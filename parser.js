var _ = require('lodash');
var R = require('ramda');
var Either = require('ramda-fantasy').Either;

var log = (x) => { console.log(x) };

//simple parser
var parser = (searchChar, input) => {
    if (_.startsWith(input, searchChar))
        return { 'parsed': [searchChar], 'remaining': input.substring(searchChar.length) }
    else
        return { 'remaining': input }
}
log("simple parser");
log(parser('a', 'abc'));
log(parser('a', 'xyz'));

//curred parser
var parser1 = (searchChar) => {
    var fn = (input) => {
        if (_.startsWith(input, searchChar))
            return { 'parsed': [searchChar], 'remaining': input.substring(searchChar.length) }
        else
            return { 'remaining': input }
    }
    return fn;
}
log("\ncurred parser");
log(parser1('a')('abc'))
log(parser1('a')('xyz'))

//ramda curred parser
var parser2 = R.curry((searchChar, input) => {
    if (_.startsWith(input, searchChar))
        return { 'parsed': [searchChar], 'remaining': input.substring(searchChar.length) }
    else
        return { 'remaining': input }
});
log("\nramda curred parser");
log(parser2('a')('abc'))
log(parser2('a')('xyz'))


//either monad + ramda curred parser
var parser3 = R.curry((searchChar, input) => {
    if (_.startsWith(input, searchChar))
        return Either.Right({ 'parsed': [searchChar], 'remaining': input.substring(searchChar.length) })
    else
        return Either.Left({ 'remaining': input })
});
log("\neither monad + ramda curred parser");
log(parser3('a')('abc'))
log(parser3('a')('xyz'))

//create a parser monad
var Parser = function (m) {
    this.__value = m;
}
ParserOf = (f) => { return new Parser(f); }
ParserExtract = (m) => { return m.__value; }
ParserRun = (m, x) => { return ParserExtract(m)(x) }

//parser monad + either monad + ramda curred parser
var parser4 = (searchChar) => {
    var fn = (input) => {
        if (_.startsWith(input, searchChar))
            return Either.Right({ 'parsed': [searchChar], 'remaining': input.substring(searchChar.length) })
        else
            return Either.Left({ 'remaining': input })
    }
    return ParserOf(fn);
}
log("\nparser monad + either monad + ramda curred parser");
var parserA = parser4('a');
var parserB = parser4('b');
log(ParserRun(parserA, 'abc'));
log(ParserRun(parserA, 'xyz'));


//orElseParser Parser
var orParser = (p1, p2) => {
    var fn = (input) => {
        var out = ParserRun(p1, input);
        if (Either.isRight(out))
            return out;
        else
            return ParserRun(p2, input);
    }
    return ParserOf(fn);
}
log("\norElse parser");
var parserAB = orParser(parserA, parserB);
log(ParserRun(parserAB, 'ad'));
log(ParserRun(parserAB, 'bd'));
log(ParserRun(parserAB, 'cd'));

// andParser
var andParser = (p1, p2) => {
    var fn = (input) => {
        var out = ParserRun(p1, input);
        if (Either.isLeft(out))
            return out;
        else {
            var outParsed = out.value.parsed;
            var outRemaining = out.value.remaining;
            var outTwo = ParserRun(p2, outRemaining);
            if (Either.isRight(outTwo)) {
                var outTwoParsed = outParsed.concat(outTwo.value.parsed)
                var outTwoRemaining = outTwo.value.remaining;
                return Either.Right({ 'parsed': outTwoParsed, 'remaining': outTwoRemaining });
            }
            else
                return Either.Left({ 'remaining': input })
        }
    }
    return ParserOf(fn);
}
log("\nand parser");
var parserAB = andParser(parserA, parserB);
log(ParserRun(parserAB, 'abc'));
log(ParserRun(parserAB, 'dbc'));
log(ParserRun(parserAB, 'adc'));


//many char parsers
var Parsers = R.map(parser4, ['a', 'b', 'c', 'd']);
var parserAny = R.reduce(andParser, Parsers[0], Parsers.slice(1, Parsers.length));
log("\nmany chars parsers");
log(ParserRun(parserAny, 'abcd'));


//many parser
var many = (p1, input) => {
    var out = ParserRun(p1, input);
    var outParsed = out.value.parsed;
    var outRemaining = out.value.remaining;
    if (Either.isLeft(out))
        return Either.Right({ 'parsed': [], 'remaining': input });
    else {
        var outTwo = many(p1, outRemaining);
        var outTwoParsed = outTwo.value.parsed;
        var outTwoRemaining = outTwo.value.remaining;
        return Either.Right({ 'parsed': outParsed.concat(outTwoParsed), 'remaining': outTwoRemaining });
    }
}
var manyParser = R.curry((p1) => {
    var fn = (input) => {
        return many(p1, input);
    }
    return ParserOf(fn);
})
log("\nmany char parser");
log(ParserRun(manyParser(parserA), 'aaabac'));

//many digit parsers
var digitParsers = R.map(parser4, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
var digitParserAny = R.reduce(orParser, digitParsers[0], digitParsers.slice(1, digitParsers.length));
log("\nmany digit parsers");
log(ParserRun(manyParser(digitParserAny), '1234a3'));
log(ParserRun(manyParser(digitParserAny), '12,4a3'));


//double quotes parser
var parserDoubleQuotes = parser4('"');
log("\ndouble quotes parser");
log(ParserRun(parserDoubleQuotes, "\"1234\""));
log(ParserRun(parserDoubleQuotes, "1234\""));


//between parser
var between = (p1, p2, p3) => {
    var fn = (input) => {
        //parser1
        var p1out = ParserRun(p1, input);
        var p1outParsed = p1out.value.parsed;
        var p1outRemaining = p1out.value.remaining;
        if (Either.isLeft(p1out))
            return out;
        else {
            //parser2
            var p2out = ParserRun(manyParser(p2), p1outRemaining);
            var p2outParsed = p2out.value.parsed;
            var p2outRemaining = p2out.value.remaining;
            if (Either.isLeft(p2out))
                return Either.Left({ 'remaining': input });
            else {
                //parser3
                var p3out = ParserRun(p3, p2outRemaining);
                var p3outParsed = p3out.value.parsed;
                var p3outRemaining = p3out.value.remaining;
                if (Either.isLeft(p3out))
                    return Either.Left({ 'remaining': input });
                else
                    return Either.Right({ 'parsed': p2outParsed, 'remaining': p3outRemaining });
            }
        }
    }
    return ParserOf(fn);
}
log("\nbetween parser");
var betweenParser = between(parserDoubleQuotes, digitParserAny, parserDoubleQuotes);
log(ParserRun(betweenParser, "\"1234\""));
log(ParserRun(betweenParser, "\"12134\"\"abc\""));