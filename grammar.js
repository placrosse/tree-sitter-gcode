/**
 * @file G-code grammar for tree-sitter
 * @author ChocolateNao <andrey12q112@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'gcode',

  extras: (_) => [/\s/],

  rules: {
    source_file: ($) =>
      choice(
        seq($._marker, repeat($._statement), $._marker),
        repeat($._statement),
      ),

    _marker: (_) => token('%'),

    _statement: ($) =>
      choice($.line, $.unsigned_integer, $.eol_comment),

    _end_of_line: (_) => token(choice(/\n/, /\r\n/, /\r/)),

    inline_comment: (_) => seq('(', /[^\)]*/, ')'),

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
        $._end_of_line,
      ),

    line_number: ($) => seq(/[nN]/, $.unsigned_integer),

    unsigned_number: (_) =>
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

    unsigned_integer: (_) => /\d+/,
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
        $.parameter_variable,
        $.polar_distance,
        $.polar_angle,
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

    polar_distance: ($) => seq(/@/, $.number),
    polar_angle: ($) => seq(/\^/, $.number),

    axis_identifier: (_) => /[xXyYzZaAbBcCuUvVwWeE]/,
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
    parameter_variable: ($) =>
      seq(
        /[pP#]/,
        field('index', $.unsigned_integer),
        '=',
        $.number,
      ),

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

    _operand: ($) =>
      choice(
        $.expression,
        $.number,
        $.unary_expression,
        $.binary_expression,
        $.parameter_word,
      ),

    binary_expression: ($) =>
      choice(
        prec.left(1, seq($._operand, '+', $._operand)),
        prec.left(1, seq($._operand, '-', $._operand)),
        prec.left(2, seq($._operand, '*', $._operand)),
        prec.left(2, seq($._operand, '/', $._operand)),
        prec.left(
          2,
          seq($._operand, choice('MOD', 'mod'), $._operand),
        ),
        prec.left(3, seq($._operand, '**', $._operand)),
        prec.left(
          1,
          seq($._operand, choice('AND', 'and'), $._operand),
        ),
        prec.left(
          1,
          seq($._operand, choice('OR', 'or'), $._operand),
        ),
        prec.left(
          1,
          seq($._operand, choice('XOR', 'xor'), $._operand),
        ),
      ),

    unary_expression: ($) =>
      seq(
        choice(
          choice('ABS', 'abs'),
          choice('ACOS', 'acos'),
          choice('ASIN', 'asin'),
          choice('COS', 'cos'),
          choice('EXP', 'exp'),
          choice('FIX', 'fix'),
          choice('FUP', 'fup'),
          choice('LN', 'ln'),
          choice('ROUND', 'round'),
          choice('SIN', 'sin'),
          choice('SQRT', 'sort'),
          choice('TAN', 'tan'),
          choice('EXISTS', 'exists'),
        ),
        $._operand,
      ),

    atan_expression: ($) =>
      seq(
        choice('ATAN', 'atan'),
        $._operand,
        '/',
        $._operand,
      ),

    // TODO: better spport for o-words. see https://linuxcnc.org/docs/html/gcode/o-code.html
    o_word: ($) =>
      seq(
        /[oO]/,
        $.number,
        // optional($.eol_comment),
        // $.empty_line,
      ),

    checksum: ($) => seq('*', $.number),
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
