# tree-sitter-gcode

[G-code](https://en.wikipedia.org/wiki/G-code) grammar for [tree-sitter](https://tree-sitter.github.io/tree-sitter).

## Features

- [x] General codes (like G, axes, parameters etc.)
- [x] Wide range of file extensions supported (see [file-types](https://github.com/ChocolateNao/tree-sitter-gcode/blob/master/tree-sitter.json))
- [x] Both inline and end-of-line comments (some g-code flavors support both)
- [x] Indexed axes words (as specified in [ISO 6983-1](https://www.iso.org/standard/34608.html))
- [x] [Checksums](https://reprap.org/wiki/G-code#.2A:_Checksum)
- [ ] G-code expressions (specified in [RS274NGC](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=823374))
- [ ] M98 and M99 G-Code subprograms
- [ ] G-code subroutines (O-codes in [LinuxCNC](https://linuxcnc.org/docs/html/gcode/o-code.html))


## Status

This parser was written using a list of references described below. It should work with most cases. There are many G-code flavors out there so some unique features may not be supported in this grammar.

Feel free to open an issue with a feature request or do a pull request to extend this grammar to support as many features as possible.

## References

- [Numerical control of machines - ISO 6983-1:2009](https://www.iso.org/standard/34608.html)
- [LinuxCNC G-code documentation](https://linuxcnc.org/docs/stable/html/)
- [RepRap G-code documentation](https://reprap.org/wiki/G-code)
- [Marlin firmware G-code index](https://marlinfw.org/meta/gcode/)
- [The NIST RS274NGC Interpreter](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=823374)
