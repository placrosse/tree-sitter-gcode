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
      choice($.line, $.eol_comment, $.o_word, $.empty_line),

    inline_comment: ($) => seq('(', /[^\)]*/, ')'),

    eol_comment: ($) =>
      alias(
        prec(2, choice($.inline_comment, seq(';', /.*/))),
        'eol_comment',
      ),

    line: ($) =>
      prec(
        2,
        seq(
          optional($.line_number),
          repeat1(choice($.word, $.inline_comment)),
          optional($.checksum),
          optional($.eol_comment),
          /\r?\n/,
        ),
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
    axis_word: ($) => seq($.axis_identifier, $.number),
    indexed_axis_word: ($) =>
      seq(
        $.axis_identifier,
        field('index', $.unsigned_integer),
        '=',
        $.number,
      ),

    parameter_word: ($) => seq(/[pP#]/, $.integer),
    other_word: ($) =>
      seq(/[dDhHiIjJkKlLqQrR]/, optional($.number)),

    // TODO: better spport for o-words. see https://linuxcnc.org/docs/html/gcode/o-code.html
    o_word: ($) =>
      seq(
        /[oO]/,
        $.number,
        optional($.eol_comment),
        $.empty_line,
      ),

    checksum: ($) => seq('*', $.number),

    empty_line: ($) => /\r?\n/,
  },
});
