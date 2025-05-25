import XCTest
import SwiftTreeSitter
import TreeSitterGcode

final class TreeSitterGcodeTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_gcode())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading G-code grammar")
    }
}
