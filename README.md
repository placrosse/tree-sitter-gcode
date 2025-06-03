# tree-sitter-gcode

[![CI][ci]](https://github.com/tree-sitter-grammars/tree-sitter-gcode/actions/workflows/ci.yml)
[![discord][discord]](https://discord.gg/w7nTvsVJhm)
[![matrix][matrix]](https://matrix.to/#/#tree-sitter-chat:matrix.org)
[![npm][npm]](https://www.npmjs.com/package/tree-sitter-gcode)
[![crates][crates]](https://crates.io/crates/tree-sitter-gcode)
[![pypi][pypi]](https://pypi.org/project/tree-sitter-gcode/)

[G-code](https://en.wikipedia.org/wiki/G-code) grammar for [tree-sitter](https://tree-sitter.github.io/tree-sitter).

## Features

- [x] General codes (like G, axes, parameters etc.)
- [x] Wide range of file extensions supported (see [file-types](https://github.com/ChocolateNao/tree-sitter-gcode/blob/master/tree-sitter.json))
- [x] Both inline and end-of-line comments (some G-code flavors support both)
- [x] Indexed axes words (as specified in [ISO 6983-1](https://www.iso.org/standard/34608.html))
- [x] [Checksums](https://reprap.org/wiki/G-code#.2A:_Checksum)
- [x] G-code expressions (specified in [RS274NGC](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=823374))
- [x] Named parameters (check [named paramters for LinuxCNC](https://linuxcnc.org/docs/html/gcode/overview.html#gcode:named-parameters))
- [x] M98 and M99 G-Code subprograms with parameter variables (check [cnccookbook](https://www.cnccookbook.com/m98-m99-g-code-cnc-subprograms/))
- [ ] G-code subroutines (extended [O-codes in LinuxCNC](https://linuxcnc.org/docs/html/gcode/o-code.html))

## Status

This parser was written using a list of references described in the [References](https://github.com/ChocolateNao/tree-sitter-gcode?tab=readme-ov-file#references) section. It should work with most cases. There are many G-code flavors out there so some unique features may not be supported in this grammar.

Feel free to open an issue with a feature request or do a pull request to extend this grammar to support as many features as possible.

## References

- [Numerical control of machines - ISO 6983-1:2009](https://www.iso.org/standard/34608.html)
- [LinuxCNC G-code documentation](https://linuxcnc.org/docs/stable/html/)
- [RepRap G-code documentation](https://reprap.org/wiki/G-code)
- [Marlin firmware G-code index](https://marlinfw.org/meta/gcode/)
- [The NIST RS274NGC Interpreter](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=823374)

[ci]: https://img.shields.io/github/actions/workflow/status/tree-sitter-grammars/tree-sitter-gcode/ci.yml?logo=github&label=CI
[discord]: https://img.shields.io/discord/1063097320771698699?logo=discord&label=discord
[matrix]: https://img.shields.io/matrix/tree-sitter-chat%3Amatrix.org?logo=matrix&label=matrix
[npm]: https://img.shields.io/npm/v/tree-sitter-gcode?logo=npm
[crates]: https://img.shields.io/crates/v/tree-sitter-gcode?logo=rust
[pypi]: https://img.shields.io/pypi/v/tree-sitter-gcode?logo=pypi&logoColor=ffd242
