// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterGcode",
    products: [
        .library(name: "TreeSitterGcode", targets: ["TreeSitterGcode"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterGcode",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterGcodeTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterGcode",
            ],
            path: "bindings/swift/TreeSitterGcodeTests"
        )
    ],
    cLanguageStandard: .c11
)
