# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-05

### Added
- Initial release
- **5 Mosaic Patterns**: grid, brick, diamond, strips, voronoi
- **5 Animation Types**: fade, scale, flip, slide, scatter
- **4 Delay Modes**: sequential, random, center, spiral
- **4 Hover Effects**: lift, glow, zoom, tilt
- Drag and drop tiles functionality
- Shuffle and reset tile positions
- Web Component support (`<mosaic-image>`)
- `onReady`, `onTileClick`, and `onError` callbacks
- UMD build for script tag usage
- ES module build for bundlers
- TypeScript type definitions
- Zero external dependencies

### Security
- URL sanitization to prevent CSS injection attacks
- CSS easing value validation
- Multi-instance support with proper style cleanup
- Memory leak prevention with proper event listener cleanup
