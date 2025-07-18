/**
 * @file G-code grammar for tree-sitter
 * @author ChocolateNao <andrey12q112@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  unary: 5,
  multiplicative: 4,
  additive: 3,
  comparative: 2,
  logical: 1,
};

module.exports = grammar({
  name: 'gcode',

  extras: ($) => [/\s/, $.inline_comment],

  conflicts: ($) => [
    [$._fanuc_o_word, $.direct_label],
    [$.o_word, $.subroutine_block],
    [$._while_loop, $._do_while_loop],
  ],

  rules: {
    source_file: ($) =>
      choice(
        seq($._marker, repeat($._statement), $._marker),
        repeat($._statement),
      ),

    _marker: (_) => token('%'),

    _statement: ($) => choice($.line, $.unsigned_integer, $.eol_comment),

    _end_of_line: ($) => choice(/\n/, /\r\n/, /\r/, $.eol_comment),

    inline_comment: (_) => token(seq('(', /[^\)]*/, ')')),

    eol_comment: (_) => token(seq(';', /.*/)),

    line: ($) =>
      prec(
        2,
        seq(
          optional($.line_number),
          repeat1($.word),
          optional($.checksum),
          optional($.eol_comment),
          $._end_of_line,
        ),
      ),

    _line_identifier: (_) => caseInsensitive('n'),
    line_number: ($) => seq($._line_identifier, $.unsigned_integer),

    unsigned_number: (_) =>
      choice(
        seq(/\d+/, optional(seq('.', /\d+/))),
        seq('.', /\d+/),
        seq(/\d+/, '.'),
      ),

    number: ($) => alias(seq(optional('-'), $.unsigned_number), 'number'),

    unsigned_integer: (_) => /\d+/,
    integer: ($) => alias(seq(optional('-'), $.unsigned_integer), 'integer'),

    // Words
    word: ($) =>
      choice(
        $.g_word,
        $.m_word,
        $.t_word,
        $.s_word,
        $.f_word,
        $.o_word,
        $.axis_word,
        $.indexed_axis_word,
        $.parameter_word,
        $.parameter_variable,
        $.polar_distance,
        $.polar_angle,
        $.spindle_select,
        $.other_word,
      ),

    _g_word_identifier: (_) => caseInsensitive('g'),
    _m_word_identifier: (_) => caseInsensitive('m'),
    _f_word_identifier: (_) => caseInsensitive('f'),
    _t_word_identifier: (_) => caseInsensitive('t'),
    _s_word_identifier: (_) => caseInsensitive('s'),
    _o_word_identifier: (_) => caseInsensitive('o'),
    _other_word_identifier: (_) => /[dDhHiIjJkKlLqQrR]/,
    axis_identifier: (_) => /[xXyYzZaAbBcCuUvVwWeE]/,
    parameter_identifier: (_) => /[pP#]/,
    property_name: (_) => token(seq('<', /[a-zA-Z0-9_-]*/, '>')),

    _word_code: ($) => choice($.number, $.expression, $.parameter_word),
    _word_code_unsigned_int: ($) =>
      choice($.unsigned_integer, $.expression, $.parameter_word),

    g_word: ($) => seq($._g_word_identifier, $._word_code),
    m_word: ($) => seq($._m_word_identifier, $._word_code),
    f_word: ($) => seq($._f_word_identifier, $._word_code),

    t_marlin_special: ($) => seq($._t_word_identifier, /[?cxCX]/),
    // gcode errors when a negative integer value is used with these words
    t_word: ($) =>
      choice(
        seq($._t_word_identifier, $._word_code_unsigned_int),
        $.t_marlin_special,
      ),
    s_word: ($) => seq($._s_word_identifier, $._word_code_unsigned_int),

    polar_distance: ($) => seq('@', $._word_code),
    polar_angle: ($) => seq('^', $._word_code),

    checksum: ($) => seq('*', $._word_code),

    spindle_select: ($) => seq('$', $._word_code),

    axis_word: ($) => seq($.axis_identifier, $._word_code),
    indexed_axis_word: ($) =>
      seq(
        $.axis_identifier,
        field('index', $.unsigned_integer),
        '=',
        $._word_code,
      ),

    parameter_word: ($) =>
      seq(
        $.parameter_identifier,
        choice($.number, field('parameter_name', $.property_name)),
      ),
    parameter_variable: ($) =>
      seq(
        $.parameter_identifier,
        choice(
          field('index', $.unsigned_integer),
          field('parameter_name', $.property_name),
        ),
        '=',
        $._word_code,
      ),

    other_word: ($) =>
      prec.left(seq($._other_word_identifier, optional($._word_code))),

    // Expressions
    expression: ($) =>
      seq(
        '[',
        choice(
          $.binary_expression,
          $.unary_expression,
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

    // prec ref: https://linuxcnc.org/docs/html/gcode/overview.html#gcode:expressions
    binary_expression: ($) =>
      choice(
        prec.left(PREC.additive, seq($._operand, '+', $._operand)),
        prec.left(PREC.additive, seq($._operand, '-', $._operand)),
        prec.left(PREC.multiplicative, seq($._operand, '*', $._operand)),
        prec.left(PREC.multiplicative, seq($._operand, '/', $._operand)),
        prec.left(
          PREC.multiplicative,
          seq($._operand, caseInsensitive('mod'), $._operand),
        ),
        prec.left(PREC.unary, seq($._operand, '**', $._operand)),
        prec.left(
          PREC.comparative,
          seq($._operand, caseInsensitive('eq'), $._operand),
        ),
        prec.left(
          PREC.comparative,
          seq($._operand, caseInsensitive('ne'), $._operand),
        ),
        prec.left(
          PREC.comparative,
          seq($._operand, caseInsensitive('gt'), $._operand),
        ),
        prec.left(
          PREC.comparative,
          seq($._operand, caseInsensitive('ge'), $._operand),
        ),
        prec.left(
          PREC.comparative,
          seq($._operand, caseInsensitive('lt'), $._operand),
        ),
        prec.left(
          PREC.comparative,
          seq($._operand, caseInsensitive('le'), $._operand),
        ),
        prec.left(
          PREC.logical,
          seq($._operand, caseInsensitive('and'), $._operand),
        ),
        prec.left(
          PREC.logical,
          seq($._operand, caseInsensitive('or'), $._operand),
        ),
        prec.left(
          PREC.logical,
          seq($._operand, caseInsensitive('xor'), $._operand),
        ),
      ),

    unary_expression: ($) =>
      seq(
        choice(
          caseInsensitive('abs'),
          caseInsensitive('acos'),
          caseInsensitive('asin'),
          caseInsensitive('cos'),
          caseInsensitive('exp'),
          caseInsensitive('fix'),
          caseInsensitive('fup'),
          caseInsensitive('ln'),
          caseInsensitive('round'),
          caseInsensitive('sin'),
          caseInsensitive('sqrt'),
          caseInsensitive('tan'),
          caseInsensitive('atan'),
          caseInsensitive('exists'),
          caseInsensitive('bin'),
          caseInsensitive('bcd'),
        ),
        $._operand,
      ),

    // O-code subroutines
    _fanuc_o_word: ($) => seq($._o_word_identifier, $.number),

    fanuc_if_statement: ($) =>
      seq(
        caseInsensitive('if'),
        field('condition', $.expression),
        choice($.fanuc_unconditional, $._fanuc_conditional),
      ),
    fanuc_unconditional: ($) => seq(caseInsensitive('goto'), $.integer),
    _fanuc_conditional: ($) =>
      seq(caseInsensitive('then'), choice($.expression, $.parameter_variable)),

    fanuc_loop: ($) =>
      seq(
        caseInsensitive('while'),
        field('condition', $.expression),
        caseInsensitive('do'),
        $.integer,
        $._end_of_line,
        repeat1($.line),
        $._fanuc_loop_end,
      ),

    _fanuc_loop_end: ($) => seq(caseInsensitive('end'), $.integer),

    o_word: ($) =>
      choice(
        $.subroutine_call,
        $._fanuc_o_word,
        $.subroutine_definition,
        $.fanuc_loop,
        $.fanuc_if_statement,
        $.fanuc_unconditional,
        $.if_statement,
        $.loop,
      ),

    label: ($) => field('label_type', choice($.direct_label, $.indirect_label)),

    direct_label: ($) =>
      seq(
        $._o_word_identifier,
        choice($.number, field('subroutine_name', $.property_name)),
      ),
    indirect_label: ($) => seq($._o_word_identifier, $.expression),

    subroutine_call: ($) =>
      seq(
        $.label,
        caseInsensitive('call'),
        optional(repeat1(field('arg', $.expression))),
      ),

    subroutine_block: ($) =>
      choice(
        $.line,
        $.return_statement,
        $.if_statement,
        $.loop,
        $.continue_statement,
        $.break_statement,
      ),

    subroutine_definition: ($) =>
      seq(
        $.label,
        caseInsensitive('sub'),
        $._end_of_line,
        optional(repeat1($.subroutine_block)),
        $.label,
        caseInsensitive('endsub'),
        optional(field('return_value', $.expression)),
      ),

    if_statement: ($) =>
      seq(
        $.label,
        caseInsensitive('if'),
        field('condition', $.expression),
        $._end_of_line,
        optional(repeat1($.subroutine_block)),
        repeat($.elseif_clause),
        optional($.else_clause),
        $.label,
        caseInsensitive('endif'),
      ),

    elseif_clause: ($) =>
      prec.left(
        seq(
          $.label,
          caseInsensitive('elseif'),
          field('condition', $.expression),
          $._end_of_line,
          optional(repeat1($.subroutine_block)),
        ),
      ),

    else_clause: ($) =>
      prec.left(
        seq(
          $.label,
          caseInsensitive('else'),
          $._end_of_line,
          optional(repeat1($.subroutine_block)),
        ),
      ),

    loop: ($) => choice($._while_loop, $._do_while_loop, $._repeat_loop),

    _while_loop: ($) =>
      seq(
        $.label,
        caseInsensitive('while'),
        field('condition', $.expression),
        $._end_of_line,
        optional(repeat1($.subroutine_block)),
        $.label,
        caseInsensitive('endwhile'),
      ),

    _do_while_loop: ($) =>
      seq(
        $.label,
        caseInsensitive('do'),
        $._end_of_line,
        optional(repeat1($.subroutine_block)),
        $.label,
        caseInsensitive('while'),
        field('condition', $.expression),
      ),

    _repeat_loop: ($) =>
      seq(
        $.label,
        caseInsensitive('repeat'),
        field('condition', $.expression),
        $._end_of_line,
        optional(repeat1($.subroutine_block)),
        $.label,
        caseInsensitive('endrepeat'),
      ),

    continue_statement: ($) => seq($.label, caseInsensitive('continue')),
    break_statement: ($) => seq($.label, caseInsensitive('break')),

    return_statement: ($) =>
      seq(
        $.label,
        caseInsensitive('return'),
        optional(field('return_value', $.expression)),
      ),
  },
});

/**
 * Makes a keyword case insensitive.
 *
 * https://github.com/stadelmanma/tree-sitter-fortran/blob/master/grammar.js#L2353
 *
 * @param {string} keyword - Keyword
 * @param {boolean} aliasAsWord - Should function return an AliasRule with alias being the keyword
 *
 * @returns {AliasRule|RegExp} description
 */
function caseInsensitive(keyword, aliasAsWord = true) {
  const result = new RegExp(
    keyword
      .split('')
      .map((l) => (l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l))
      .join(''),
  );

  return aliasAsWord ? alias(result, keyword) : result;
}
