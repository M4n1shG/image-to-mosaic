# image-to-mosaic

[![npm version](https://img.shields.io/npm/v/image-to-mosaic.svg)](https://www.npmjs.com/package/image-to-mosaic)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/image-to-mosaic)](https://bundlephobia.com/package/image-to-mosaic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A zero-dependency JavaScript/TypeScript library that transforms images into interactive mosaic tiles with customizable patterns, animations, and effects.

[**Live Demo**](https://m4n1shg.github.io/image-to-mosaic/demo/)

## Features

- **5 Mosaic Patterns**: grid, brick, diamond, strips, voronoi
- **5 Animation Types**: fade, scale, flip, slide, scatter
- **4 Delay Modes**: sequential, random, center, spiral
- **8 Hover Effects**: lift, glow, zoom, tilt, flip, blur, pop, spotlight
- **Interactivity**: Drag & drop tiles, shuffle, click events
- **Web Component**: Use as `<mosaic-image>` custom element
- **TypeScript**: Full type definitions included
- **Zero Dependencies**: Pure vanilla JavaScript/TypeScript
- **Lightweight**: ~10KB gzipped

## Installation

### NPM

```bash
npm install image-to-mosaic
```

### CDN (Script Tag)

```html
<script src="https://unpkg.com/image-to-mosaic/dist/image-to-mosaic.umd.js"></script>
```

## Quick Start

### ES Modules

```javascript
import { Mosaic } from 'image-to-mosaic';

const mosaic = new Mosaic({
  target: '#container',
  image: 'path/to/image.jpg',
  pattern: 'grid',
  density: 50,
  gap: 2,
  animation: {
    type: 'fade',
    delay: 'random',
    duration: 500,
    easing: 'ease-out',
  },
  hover: {
    effect: 'lift',
    scale: 1.08,
    duration: 200,
  },
});

mosaic.render();
```

### Script Tag (UMD)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #container {
      width: 800px;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="container"></div>

  <script src="https://unpkg.com/image-to-mosaic/dist/image-to-mosaic.umd.js"></script>
  <script>
    const mosaic = new ImageToMosaic.Mosaic({
      target: '#container',
      image: 'path/to/image.jpg',
      pattern: 'brick',
      density: 30,
      animation: { type: 'scale', delay: 'center' },
      hover: { effect: 'glow' },
    });
    mosaic.render();
  </script>
</body>
</html>
```

### Web Component

```html
<script src="https://unpkg.com/image-to-mosaic/dist/image-to-mosaic.umd.js"></script>
<script>
  ImageToMosaic.registerMosaicElement();
</script>

<mosaic-image
  src="path/to/image.jpg"
  pattern="diamond"
  density="40"
  animation="fade"
  hover="lift"
  style="width: 800px; height: 600px;"
></mosaic-image>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string \| HTMLElement | required | Container element or selector |
| `image` | string | required | Image URL |
| `pattern` | string | 'grid' | Pattern type: grid, brick, diamond, strips, voronoi |
| `density` | number | 50 | Tile density (1-100) |
| `gap` | number | 2 | Gap between tiles in pixels |
| `borderRadius` | number \| string | 0 | Border radius for tiles |
| `animation.type` | string | 'none' | Animation: fade, scale, flip, slide, scatter, none |
| `animation.delay` | string \| number | 'sequential' | Delay mode: sequential, random, center, spiral, or ms |
| `animation.duration` | number | 500 | Animation duration in ms |
| `animation.easing` | string | 'ease-out' | CSS easing function |
| `hover.effect` | string | 'none' | Hover effect: lift, glow, zoom, tilt, flip, blur, pop, spotlight, none |
| `hover.scale` | number | 1.1 | Scale factor for hover |
| `hover.duration` | number | 200 | Hover transition duration in ms |
| `hover.color` | string | undefined | Glow color (for glow effect only) |
| `draggable` | boolean | false | Enable drag & drop |
| `shuffle` | boolean | false | Start with shuffled tiles |
| `onReady` | function | undefined | Callback when mosaic is ready |
| `onTileClick` | function | undefined | Callback when tile is clicked |
| `onError` | function | undefined | Callback when an error occurs |

## Methods

```javascript
// Re-render the mosaic
await mosaic.render();

// Shuffle tile positions
mosaic.shuffle();

// Reset to original positions
mosaic.reset();

// Change image
await mosaic.setImage('new-image.jpg');

// Change pattern
await mosaic.setPattern('voronoi');

// Change density
await mosaic.setDensity(75);

// Change animation
await mosaic.setAnimation('flip');

// Change hover effect
mosaic.setHoverEffect('zoom');

// Update multiple config options
await mosaic.updateConfig({ gap: 5, borderRadius: 10 });

// Destroy and cleanup
mosaic.destroy();
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Author

Created by [Manish Gupta](https://github.com/M4n1shG)

## License

MIT
