var Jison = require("../setup").Jison,
    RegExpLexer = require("../setup").RegExpLexer,
    assert = require("assert");

exports["test Semantic action basic return"] = function() {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ "x", "y" ],
        startSymbol: "E",
        bnf: {
            "E"   :[ ["E x", "return 0"],
                     ["E y", "return 1"],
                     "" ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    assert.equal(parser.parse('x'), 0, "semantic action");
    assert.equal(parser.parse('y'), 1, "semantic action");
};

exports["test Semantic action stack lookup"] = function() {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ "x", "y" ],
        startSymbol: "pgm",
        bnf: {
            "pgm" :[ ["E", "return $1"] ],
            "E"   :[ ["B E", "return $1+$2"],
                      ["x", "$$ = 'EX'"] ],
            "B"   :[ ["y", "$$ = 'BY'"] ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    assert.equal(parser.parse('x'), "EX", "return first token");
    assert.equal(parser.parse('yx'), "BYEX", "return first after reduction");
};

exports["test Semantic actions on nullable grammar"] = function() {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ 'x' ],
        startSymbol: "S",
        bnf: {
            "S" :[ ["A", "return $1"] ],
            "A" :[ ['x A', "$$ = $2+'x'" ],
                   ['', "$$ = '->'" ] ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    assert.equal(parser.parse('xx'), "->xx", "return first after reduction");
};

exports["test Build AST"] = function() {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ 'x' ],
        startSymbol: "S",
        bnf: {
            "S" :[ ['A', "return $1;" ] ],
            "A" :[ ['x A', "$2.push(['ID',{value:'x'}]); $$ = $2;"],
                   ['', "$$ = ['A',{}];"] ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    var expectedAST = ['A',{},
        ['ID',{value:'x'}],
        ['ID',{value:'x'}],
        ['ID',{value:'x'}]];

    var r = parser.parse("xxx");
    assert.deepEqual(r, expectedAST);
};

exports["test 0+0 grammar"] = function() {
    var lexData2 = {
        rules: [
           ["0", "return 'ZERO';"],
           ["\\+", "return 'PLUS';"],
           ["$", "return 'EOF';"]
        ]
    };
    var grammar = {
        tokens: [ "ZERO", "PLUS", "EOF"],
        startSymbol: "S",
        bnf: {
            "S" :[ [ "E EOF",    "return $1" ]],
            "E" :[ [ "E PLUS T", "$$ = ['+',$1,$3]"  ],
                   [ "T",        "$$ = $1" ]  ],
            "T" :[ [ "ZERO",     "$$ = [0]" ] ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData2);

    var expectedAST = ["+", ["+", [0], [0]], [0]];

    assert.deepEqual(parser.parse("0+0+0"), expectedAST);
};

exports["test yytext"] = function() {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ "x" ],
        startSymbol: "pgm",
        bnf: {
            "pgm" :[ ["Xexpr", "return $1;"] ],
            "Xexpr"   :[ ["x", "$$ = yytext;"] ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    assert.equal(parser.parse('x'), "x", "return first token");
};

exports["test yytext more"] = function() {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ "x", "y" ],
        startSymbol: "pgm",
        bnf: {
            "pgm" :[ ["expr expr", "return $1+$2;"] ],
            "expr"   :[ ["x", "$$ = yytext;"],
                         ["y", "$$ = yytext;"] ]
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    assert.equal(parser.parse('xy'), "xy", "return first token");
};

exports["test action include"] = function() {
    var lexData = {
        rules: [
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: [ "y" ],
        startSymbol: "E",
        bnf: {
            "E"   :[ ["E y", "return test();"],
                     "" ]
        },
        actionInclude: function () {
            function test(val) {
                return 1;
            }
        }
    };

    var parser = new Jison.Parser(grammar);
    parser.lexer = new RegExpLexer(lexData);

    assert.equal(parser.parse('y'), 1, "semantic action");
};

