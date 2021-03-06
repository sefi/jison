var Jison = require("../setup").Jison,
    Lexer = require("../setup").Lexer,
    assert = require("assert");

var lexData = {
    rules: [
       ["x", "return 'x';"],
       ["y", "return 'y';"]
    ]
};

exports["test tokens as a string"] = function () {

    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new Lexer(lexData);
    assert.ok(parser.parse('xyx'), "parse xyx");
};

exports["test extra spaces in productions"] = function () {

    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x ',
                   'A y',
                   ''      ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new Lexer(lexData);
    assert.ok(parser.parse('xyx'), "parse xyx");
};

exports["test | seperated rules"] = function () {

    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :"A x | A y | "
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new Lexer(lexData);
    assert.ok(parser.parse('xyx'), "parse xyx");
};

exports["test start symbol optional"] = function () {

    var grammar = {
        tokens: "x y",
        bnf: {
            "A" :"A x | A y | "
        }
    };

    var parser = new Jison.Parser(grammar);
    var ok = true;
    assert.ok(ok, "no error");
};

exports["test start symbol should be nonterminal"] = function () {

    var grammar = {
        tokens: "x y",
        startSymbol: "x",
        bnf: {
            "A" :"A x | A y | "
        }
    };

    assert["throws"](function(){new Jison.Parser(grammar);}, "throws error");
};

exports["test token list as string"] = function () {

    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :"A x | A y | "
        }
    };

    var parser = new Jison.Parser(grammar);
    assert.deepEqual(parser.terminals, ["$end", "x", "y"]);
};

exports["test grammar options"] = function () {

    var grammar = {
        options: {type: "slr"},
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var parser = new Jison.Parser(grammar);
    assert.equal(parser.constructor, Jison.SLRParser);
};

exports["test overwrite grammar options"] = function () {

    var grammar = {
        options: {type: "slr"},
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    assert.equal(parser.constructor, Jison.LR0Parser);
};

exports["test yy shared scope"] = function () {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return yy.xed ? 'yfoo' : 'ybar';"]
        ]
    };
    var grammar = {
        tokens: "x yfoo ybar",
        startSymbol: "A",
        bnf: {
            "A" :[[ 'A x', "yy.xed = true;" ],
                  [ 'A yfoo', " return 'foo';" ],
                  [ 'A ybar', " return 'bar';" ],
                   ''      ]
        }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    parser.lexer = new Lexer(lexData);
    assert.equal(parser.parse('y'), "bar", "should return bar");
    assert.equal(parser.parse('xxy'), "foo", "should return foo");
};


exports["test optional token declaration"] = function () {

    var grammar = {
        options: {type: "slr"},
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var parser = new Jison.Parser(grammar, {type: "lr0"});
    assert.equal(parser.constructor, Jison.LR0Parser);
};


exports["test custom parse error method"] = function () {
    var lexData = {
        rules: [
           ["a", "return 'a';"],
           ["b", "return 'b';"],
           ["c", "return 'c';"],
           ["d", "return 'd';"],
           ["g", "return 'g';"]
        ]
    };
    var grammar = {
        "tokens": "a b c d g",
        "startSymbol": "S",
        "bnf": {
            "S" :[ "a g d",
                   "a A c",
                   "b A d",
                   "b g c" ],
            "A" :[ "B" ],
            "B" :[ "g" ]
        }
    };

    var parser = new Jison.Parser(grammar, {type: "lalr"});
    parser.lexer = new Lexer(lexData);
    var result={};
    parser.yy.parseError = function (str, hash) {
        result = hash;
        throw str;
    };
    assert["throws"](function () {parser.parse("agb")});
    assert.equal(result.text, "b", "parse error text should equal b");
    assert["throws"](function () {parser.parse("agz")});
    assert.equal(result.line, 0, "lexical error should have correct line");
};
