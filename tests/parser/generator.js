var Jison = require("../setup").Jison,
    Lexer = require("../setup").Lexer,
    assert = require("assert");



exports["test commonjs module generator"] = function () {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var input = "xyxxxy";
    var parser_ = new Jison.Parser(grammar);
    parser_.lexer = new Lexer(lexData);

    var parserSource = parser_.generateCommonJSModule();
    var exports = {};
    eval(parserSource);

    assert.ok(exports.parse(input));
};

exports["test module generator"] = function () {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var input = "xyxxxy";
    var parser_ = new Jison.Parser(grammar);
    parser_.lexer = new Lexer(lexData);

    var parserSource = parser_.generateModule();
    eval(parserSource);

    assert.ok(parser.parse(input));
};

exports["test module generator with module name"] = function () {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var input = "xyxxxy";
    var parser_ = new Jison.Parser(grammar);
    parser_.lexer = new Lexer(lexData);

    var parserSource = parser_.generate({moduleType: "js", moduleName: "parsey"});
    eval(parserSource);

    assert.ok(parsey.parse(input));
};

exports["test module generator with namespaced module name"] = function () {
    var lexData = {
        rules: [
           ["x", "return 'x';"],
           ["y", "return 'y';"]
        ]
    };
    var grammar = {
        tokens: "x y",
        startSymbol: "A",
        bnf: {
            "A" :[ 'A x',
                   'A y',
                   ''      ]
        }
    };

    var compiler = {};

    var input = "xyxxxy";
    var parser_ = new Jison.Parser(grammar);
    parser_.lexer = new Lexer(lexData);

    var parserSource = parser_.generateModule({moduleName: "compiler.parser"});
    eval(parserSource);

    assert.ok(compiler.parser.parse(input));
};

exports["test module include"] = function () {
    var grammar = {
    "comment": "ECMA-262 5th Edition, 15.12.1 The JSON Grammar. (Incomplete implementation)",
    "author": "Zach Carter",

    "lex": {
        "macros": {
            "digit": "[0-9]",
            "exp": "([eE][-+]?{digit}+)"
        },
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            ["-?{digit}+(\\.{digit}+)?{exp}?", "return 'NUMBER';"],
            ["\"[^\"]*", function(){
                if(yytext.charAt(yyleng-1) == '\\') {
                    // remove escape
                    yytext = yytext.substr(0,yyleng-2);
                    this.more();
                } else {
                    yytext = yytext.substr(1); // swallow start quote
                    this.input(); // swallow end quote
                    return "STRING";
                }
            }],
            ["\\{", "return '{'"],
            ["\\}", "return '}'"],
            ["\\[", "return '['"],
            ["\\]", "return ']'"],
            [",", "return ','"],
            [":", "return ':'"],
            ["true\\b", "return 'TRUE'"],
            ["false\\b", "return 'FALSE'"],
            ["null\\b", "return 'NULL'"]
        ]
    },

    "tokens": "STRING NUMBER { } [ ] , : TRUE FALSE NULL",
    "start": "JSONText",

    "bnf": {
        "JSONString": [ "STRING" ],

        "JSONNumber": [ "NUMBER" ],

        "JSONBooleanLiteral": [ "TRUE", "FALSE" ],


        "JSONText": [ "JSONValue" ],

        "JSONValue": [ "JSONNullLiteral",
                       "JSONBooleanLiteral",
                       "JSONString",
                       "JSONNumber",
                       "JSONObject",
                       "JSONArray" ],

        "JSONObject": [ "{ }",
                        "{ JSONMemberList }" ],

        "JSONMember": [ "JSONString : JSONValue" ],

        "JSONMemberList": [ "JSONMember",
                              "JSONMemberList , JSONMember" ],

        "JSONArray": [ "[ ]",
                       "[ JSONElementList ]" ],

        "JSONElementList": [ "JSONValue",
                             "JSONElementList , JSONValue" ]
    }
};



    var parser_ = new Jison.Parser(grammar);

    var parserSource = parser_.generateModule();
    eval(parserSource);

    assert.ok(parser.parse(JSON.stringify(grammar.bnf)));
};
