/**
 * @file G-code grammar for tree-sitter
 * @author ChocolateNao <andrey12q112@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'gcode',

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.line,
        $.eol_comment,
        // $.o_word,
        $.empty_line,
      ),

    inline_comment: ($) => seq('(', /[^\)]*/, ')'),

    eol_comment: ($) =>
      alias(
        prec(2, choice($.inline_comment, seq(';', /.*/))),
        'eol_comment',
      ),

    line: ($) =>
      seq(
        optional($.line_number),
        repeat1(choice($.word, $.inline_comment)),
        optional($.checksum),
        optional($.eol_comment),
        $._eol_or_eof,
      ),

    line_number: ($) => seq(/[nN]/, $.unsigned_integer),

    unsigned_number: ($) =>
      choice(
        seq(/\d+/, optional(seq('.', /\d+/))),
        seq('.', /\d+/),
        seq(/\d+/, '.'),
      ),

    number: ($) =>
      alias(
        seq(optional('-'), $.unsigned_number),
        'number',
      ),

    unsigned_integer: ($) => /\d+/,
    integer: ($) =>
      alias(
        seq(optional('-'), $.unsigned_integer),
        'integer',
      ),

    // Words
    word: ($) =>
      choice(
        $.g_word,
        $.m_word,
        $.t_word,
        $.s_word,
        $.f_word,
        $.axis_word,
        $.indexed_axis_word,
        $.parameter_word,
        $.other_word,
      ),

    g_word: ($) => seq(/[gG]/, $.number),
    m_word: ($) => seq(/[mM]/, $.number),
    f_word: ($) => seq(/[fF]/, $.number),

    // gcode errors when a negative value is used with these words
    t_word: ($) =>
      choice(
        seq(/[tT]/, $.unsigned_integer),
        /[tT][?cxCX]/,
      ),
    s_word: ($) => seq(/[sS]/, $.unsigned_integer),

    axis_identifier: ($) => /[xXyYzZaAbBcCuUvVwWeE]/,
    axis_word: ($) =>
      seq(
        $.axis_identifier,
        choice($.number, $.expression),
      ),
    indexed_axis_word: ($) =>
      seq(
        $.axis_identifier,
        field('index', $.unsigned_integer),
        '=',
        choice($.number, $.expression),
      ),

    parameter_word: ($) => seq(/[pP#]/, $.integer),
    other_word: ($) =>
      seq(/[dDhHiIjJkKlLqQrR]/, optional($.number)),

    // Expressions
    expression: ($) =>
      seq(
        '[',
        choice(
          $.binary_expression,
          $.unary_expression,
          $.atan_expression,
          $.parameter_word,
          $.expression,
          $.number,
        ),
        ']',
      ),

    _operand: ($) => choice($.expression, $.number, $.unary_expression, $.binary_expression),

    binary_expression: ($) =>
      choice(
        prec.left(1, seq($._operand, '+', $._operand)),
        prec.left(1, seq($._operand, '-', $._operand)),
        prec.left(2, seq($._operand, '*', $._operand)),
        prec.left(2, seq($._operand, '/', $._operand)),
        prec.left(2, seq($._operand, 'MOD', $._operand)),
        prec.left(3, seq($._operand, '**', $._operand)),
        prec.left(1, seq($._operand, 'AND', $._operand)),
        prec.left(1, seq($._operand, 'OR', $._operand)),
        prec.left(1, seq($._operand, 'XOR', $._operand)),
      ),

    unary_expression: ($) =>
      seq(
        choice(
          'ABS',
          'ACOS',
          'ASIN',
          'COS',
          'EXP',
          'FIX',
          'FUP',
          'LN',
          'ROUND',
          'SIN',
          'SQRT',
          'TAN',
          'EXISTS',
        ),
        $._operand,
      ),

    atan_expression: ($) =>
      seq('ATAN', $._operand, '/', $._operand),

    // TODO: better spport for o-words. see https://linuxcnc.org/docs/html/gcode/o-code.html
    o_word: ($) =>
      seq(
        /[oO]/,
        $.number,
        // optional($.eol_comment),
        // $.empty_line,
      ),

    checksum: ($) => seq('*', $.number),

    empty_line: ($) =>
      seq(
        optional($._horizontal_whitespace),
        $._eol_or_eof,
      ),

    _horizontal_whitespace: (_) => /[ \t]+/,
    _end_of_line: (_) => token(choice('\n', '\r\n', '\r')),
    _end_of_file: (_) => token('/$(?!.|\n)/'),
    _eol_or_eof: ($) => token(choice($._end_of_file, $._end_of_line)),
  },
});

/**
 * Makes a rule possibly be separated by a comma to for it to be repeated
 *
 * @param {Rule} rule - Rule
 */
// function commaSep(rule) {
//   return seq(rule, repeat(seq(',', rule)));
// }
