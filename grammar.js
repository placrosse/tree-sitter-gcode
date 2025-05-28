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
      choice($.row, $.comment, $.o_word, $.empty_line),

    comment: ($) =>
      choice(seq('(', /[^\)]*/, ')'), seq(';', /.*/)),

    row: ($) =>
      prec(
        2,
        seq(
          optional($.line_number),
          repeat1($.word),
          optional($.comment),
          /\r?\n/,
        ),
      ),

    line_number: ($) => /[nN]\d+/,

    non_negative_number: ($) =>
      choice(
        seq(/\d+/, optional(seq('.', /\d+/))),
        seq('.', /\d+/),
      ),

    number: ($) =>
      alias(
        seq(optional('-'), $.non_negative_number),
        'number',
      ),

    non_negative_integer: ($) => /\d+/,
    integer: ($) =>
      alias(
        seq(optional('-'), $.non_negative_integer),
        'integer',
      ),

    word: ($) =>
      choice(
        $.g_word,
        $.m_word,
        $.t_word,
        $.s_word,
        $.f_word,
        $.axis_word,
        $.parameter_word,
        $.other_word,
      ),

    g_word: ($) => seq(/[gG]/, $.number),
    m_word: ($) => seq(/[mM]/, $.number),

    // gcode errors when a negative value is used with these words
    t_word: ($) => seq(/[tT]/, $.non_negative_integer),
    s_word: ($) => seq(/[sS]/, $.non_negative_integer),

    f_word: ($) => seq(/[fF]/, $.number),
    axis_word: ($) => seq(/[xXyYzZaAbBcCuUvVwW]/, $.number),
    parameter_word: ($) => seq(/[pP#]/, $.integer),
    other_word: ($) => seq(/[dDhHiIjJkKlLqQrR]/, $.number),

    o_word: ($) =>
      seq(/[oO]\d+/, optional($.comment), /\r?\n/),

    empty_line: ($) => /\r?\n/,
  },
});
