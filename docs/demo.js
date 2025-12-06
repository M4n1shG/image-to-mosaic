import { Mosaic } from '../src/index.ts';

// DOM Elements
const container = document.getElementById('mosaic-container');
const mosaicWrapper = document.getElementById('mosaic-wrapper');
const galleryWrapper = document.getElementById('gallery-wrapper');
const canvasArea = document.getElementById('canvas-area');
const viewTabs = document.getElementById('view-tabs');
const imageSelect = document.getElementById('image-select');
const imageUrl = document.getElementById('image-url');
const loadImageBtn = document.getElementById('load-image');
const patternSelect = document.getElementById('pattern-select');
const densitySlider = document.getElementById('density-slider');
const densityValue = document.getElementById('density-value');
const gapSlider = document.getElementById('gap-slider');
const gapValue = document.getElementById('gap-value');
const radiusSlider = document.getElementById('radius-slider');
const radiusValue = document.getElementById('radius-value');
const animationSelect = document.getElementById('animation-select');
const delaySelect = document.getElementById('delay-select');
const durationSlider = document.getElementById('duration-slider');
const durationValue = document.getElementById('duration-value');
const easingSelect = document.getElementById('easing-select');
const hoverSelect = document.getElementById('hover-select');
const hoverScaleSlider = document.getElementById('hover-scale-slider');
const hoverScaleValue = document.getElementById('hover-scale-value');
const hoverDurationSlider = document.getElementById('hover-duration-slider');
const hoverDurationValue = document.getElementById('hover-duration-value');
const glowColorGroup = document.getElementById('glow-color-group');
const glowColorInput = document.getElementById('glow-color');
const draggableCheck = document.getElementById('draggable-check');
const shuffleCheck = document.getElementById('shuffle-check');
const shuffleBtn = document.getElementById('shuffle-btn');
const resetBtn = document.getElementById('reset-btn');
const renderBtn = document.getElementById('render-btn');
const codeOutput = document.getElementById('code-output');
const copyCodeBtn = document.getElementById('copy-code');
const themeToggle = document.getElementById('theme-toggle');

// View state
let currentView = 'playground';
let galleryMosaics = [];
let galleryInitialized = false;

// Zoom elements
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomFitBtn = document.getElementById('zoom-fit');
const zoomValueDisplay = document.getElementById('zoom-value');

// Modal elements
const instructionsBtn = document.getElementById('instructions-btn');
const instructionsModal = document.getElementById('instructions-modal');
const modalClose = document.getElementById('modal-close');

// Current zoom level (1 = 100%)
let currentZoom = 1;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

// Pan state
let panX = 0;
let panY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

// Image dimension presets (image source and container display sizes)
const imageDimensions = {
  landscape: { width: 800, height: 600, containerWidth: 1200, containerHeight: 900 },
  portrait: { width: 600, height: 800, containerWidth: 675, containerHeight: 900 },
  square: { width: 600, height: 600, containerWidth: 900, containerHeight: 900 },
  wide: { width: 1200, height: 600, containerWidth: 1200, containerHeight: 600 },
};

// Generate random image URL with proper dimensions
function getRandomImageUrl(type) {
  const dims = imageDimensions[type] || imageDimensions.landscape;
  const random = Date.now() + Math.floor(Math.random() * 1000);
  return `https://picsum.photos/${dims.width}/${dims.height}?random=${random}`;
}

// Update container size based on image type
function updateContainerSize(type) {
  const dims = imageDimensions[type] || imageDimensions.landscape;
  container.style.width = `${dims.containerWidth}px`;
  container.style.height = `${dims.containerHeight}px`;
}

// Current configuration
let currentConfig = {
  image: getRandomImageUrl(imageSelect.value),
  imageType: imageSelect.value,
  pattern: 'grid',
  density: 4,
  gap: 5,
  borderRadius: 5,
  animation: {
    type: 'fade',
    delay: 'sequential',
    duration: 500,
    easing: 'ease-out',
  },
  hover: {
    effect: 'lift',
    scale: 1.08,
    duration: 200,
  },
  draggable: false,
  shuffle: false,
};

// Mosaic instance
let mosaic = null;

// Initialize
async function init() {
  initTheme();
  initZoom();
  await createMosaic();
  setupEventListeners();
  setupThemeToggle();
  setupCollapsiblePanels();
  setupZoomControls();
  setupModal();
  setupViewTabs();
  updateCodeOutput();
}

// Initialize theme from localStorage or system preference
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

// Initialize zoom
function initZoom() {
  // Start at 100% zoom, centered
  requestAnimationFrame(() => {
    panX = -100; // Offset for right panels
    panY = 0;
    setZoom(1);
  });
}

// Setup theme toggle
function setupThemeToggle() {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// Setup collapsible panels
function setupCollapsiblePanels() {
  const panels = document.querySelectorAll('.collapsible-panel');
  panels.forEach(panel => {
    const toggle = panel.querySelector('.panel-toggle');
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
    });
  });
}

// Setup zoom controls
function setupZoomControls() {
  zoomInBtn.addEventListener('click', () => {
    setZoom(currentZoom + ZOOM_STEP);
  });

  zoomOutBtn.addEventListener('click', () => {
    setZoom(currentZoom - ZOOM_STEP);
  });

  zoomFitBtn.addEventListener('click', () => {
    fitToScreen();
  });

  // Mouse wheel zoom
  canvasArea.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(currentZoom + delta);
    }
  }, { passive: false });

  // Panning with mouse drag (space + drag or middle mouse button)
  canvasArea.addEventListener('mousedown', (e) => {
    // Pan with left mouse button when clicking on empty canvas area
    if (e.button === 0) {
      isPanning = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isPanning) {
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    isPanning = false;
  });
}

// Setup modal
function setupModal() {
  // Open modal
  instructionsBtn.addEventListener('click', () => {
    instructionsModal.classList.add('open');
  });

  // Close modal with button
  modalClose.addEventListener('click', () => {
    instructionsModal.classList.remove('open');
  });

  // Close modal with overlay click
  instructionsModal.addEventListener('click', (e) => {
    if (e.target === instructionsModal) {
      instructionsModal.classList.remove('open');
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && instructionsModal.classList.contains('open')) {
      instructionsModal.classList.remove('open');
    }
  });
}

// Setup view tabs
function setupViewTabs() {
  const tabs = viewTabs.querySelectorAll('.tab-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const targetView = tab.dataset.view;
      if (targetView === currentView) return;

      // Update tab states
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update view content
      document.querySelectorAll('.view-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelector(`.view-content[data-view="${targetView}"]`).classList.add('active');

      // Update body class for hiding right panels in gallery
      if (targetView === 'gallery') {
        document.body.classList.add('gallery-view');
      } else {
        document.body.classList.remove('gallery-view');
      }

      // Set current view
      currentView = targetView;

      // Initialize gallery if first time
      if (targetView === 'gallery' && !galleryInitialized) {
        await initializeGallery();
      }

      // Reset pan and fit to screen
      panX = 0;
      panY = 0;
      fitToScreen();
    });
  });
}

// Gallery configurations - showcase different pattern/animation/hover combinations
const galleryConfigs = [
  { pattern: 'grid', animation: 'fade', delay: 'sequential', hover: 'lift', density: 20 },
  { pattern: 'brick', animation: 'scale', delay: 'center', hover: 'spotlight', density: 25 },
  { pattern: 'diamond', animation: 'flip', delay: 'random', hover: 'flip', density: 15 },
  { pattern: 'voronoi', animation: 'scatter', delay: 'spiral', hover: 'tilt', density: 12 },
  { pattern: 'strips', animation: 'slide', delay: 'sequential', hover: 'blur', density: 20 },
  { pattern: 'grid', animation: 'scatter', delay: 'center', hover: 'pop', density: 30 },
];

// Initialize gallery mosaics
async function initializeGallery() {
  galleryInitialized = true;

  const containers = [
    document.getElementById('gallery-1'),
    document.getElementById('gallery-2'),
    document.getElementById('gallery-3'),
    document.getElementById('gallery-4'),
    document.getElementById('gallery-5'),
    document.getElementById('gallery-6'),
  ];

  const renderPromises = containers.map(async (container, index) => {
    const config = galleryConfigs[index];
    const imageUrl = `https://picsum.photos/400/300?random=${Date.now() + index}`;

    const m = new Mosaic({
      target: container,
      image: imageUrl,
      pattern: config.pattern,
      density: config.density,
      gap: 3,
      borderRadius: 4,
      animation: {
        type: config.animation,
        delay: config.delay,
        duration: 500,
      },
      hover: {
        effect: config.hover,
        scale: 1.1,
        duration: 200,
      },
      onReady: () => console.log(`Gallery ${index + 1} ready`),
    });

    galleryMosaics.push(m);
    return m.render();
  });

  await Promise.all(renderPromises);
  console.log('All gallery mosaics rendered!');
}

// Set zoom level
function setZoom(zoom) {
  currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  updateTransform();
}

// Get the active wrapper based on current view
function getActiveWrapper() {
  return currentView === 'gallery' ? galleryWrapper : mosaicWrapper;
}

// Update transform (zoom + pan)
function updateTransform() {
  const wrapper = getActiveWrapper();
  wrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
  zoomValueDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
}

// Fit mosaic to screen
function fitToScreen() {
  const containerRect = canvasArea.getBoundingClientRect();
  const rightPanelWidth = currentView === 'gallery' ? 0 : 200; // No right panels in gallery view

  let wrapperWidth, wrapperHeight;

  if (currentView === 'gallery') {
    // Gallery grid is 1200px x ~580px (3 cols x 2 rows with gaps)
    wrapperWidth = 1200;
    wrapperHeight = 580;
  } else {
    const dims = imageDimensions[currentConfig.imageType] || imageDimensions.landscape;
    wrapperWidth = dims.containerWidth;
    wrapperHeight = dims.containerHeight;
  }

  const availableWidth = containerRect.width - rightPanelWidth - 40;
  const availableHeight = containerRect.height - 40;

  const scaleX = availableWidth / wrapperWidth;
  const scaleY = availableHeight / wrapperHeight;

  // Offset pan to center in available space (left of right panels)
  panX = -rightPanelWidth / 2;
  panY = 0;
  setZoom(Math.min(scaleX, scaleY, 1));
}

// Create mosaic with current config
async function createMosaic() {
  if (mosaic) {
    mosaic.destroy();
  }

  // Set container size based on image type
  updateContainerSize(currentConfig.imageType);

  mosaic = new Mosaic({
    target: container,
    image: currentConfig.image,
    pattern: currentConfig.pattern,
    density: currentConfig.density,
    gap: currentConfig.gap,
    borderRadius: currentConfig.borderRadius,
    animation: currentConfig.animation,
    hover: currentConfig.hover,
    draggable: currentConfig.draggable,
    shuffle: currentConfig.shuffle,
    onReady: () => {
      console.log('Mosaic ready!');
    },
    onTileClick: (tile, index) => {
      console.log(`Tile ${index} clicked:`, tile);
    },
  });

  await mosaic.render();
}

// Setup event listeners
function setupEventListeners() {
  // Image selection
  imageSelect.addEventListener('change', async () => {
    currentConfig.imageType = imageSelect.value;
    currentConfig.image = getRandomImageUrl(imageSelect.value);
    // Recreate mosaic completely to handle container size change smoothly
    await createMosaic();
    fitToScreen();
    updateCodeOutput();
  });

  loadImageBtn.addEventListener('click', async () => {
    if (imageUrl.value) {
      currentConfig.image = imageUrl.value;
      await mosaic.setImage(currentConfig.image);
      updateCodeOutput();
    }
  });

  // Pattern
  patternSelect.addEventListener('change', async () => {
    currentConfig.pattern = patternSelect.value;
    await mosaic.setPattern(currentConfig.pattern);
    updateCodeOutput();
  });

  // Density
  densitySlider.addEventListener('input', () => {
    currentConfig.density = parseInt(densitySlider.value);
    densityValue.textContent = currentConfig.density;
  });

  densitySlider.addEventListener('change', async () => {
    await mosaic.setDensity(currentConfig.density);
    updateCodeOutput();
  });

  // Gap
  gapSlider.addEventListener('input', () => {
    currentConfig.gap = parseInt(gapSlider.value);
    gapValue.textContent = currentConfig.gap;
  });

  gapSlider.addEventListener('change', async () => {
    await mosaic.updateConfig({ gap: currentConfig.gap });
    updateCodeOutput();
  });

  // Border Radius
  radiusSlider.addEventListener('input', () => {
    currentConfig.borderRadius = parseInt(radiusSlider.value);
    radiusValue.textContent = currentConfig.borderRadius;
  });

  radiusSlider.addEventListener('change', async () => {
    await mosaic.updateConfig({ borderRadius: currentConfig.borderRadius });
    updateCodeOutput();
  });

  // Animation
  animationSelect.addEventListener('change', async () => {
    currentConfig.animation.type = animationSelect.value;
    await mosaic.setAnimation(currentConfig.animation.type);
    updateCodeOutput();
  });

  delaySelect.addEventListener('change', async () => {
    currentConfig.animation.delay = delaySelect.value;
    mosaic.setDelayMode(currentConfig.animation.delay);
    await mosaic.render();
    updateCodeOutput();
  });

  durationSlider.addEventListener('input', () => {
    currentConfig.animation.duration = parseInt(durationSlider.value);
    durationValue.textContent = currentConfig.animation.duration;
  });

  durationSlider.addEventListener('change', async () => {
    await mosaic.updateConfig({
      animation: currentConfig.animation,
    });
    updateCodeOutput();
  });

  // Easing
  easingSelect.addEventListener('change', async () => {
    currentConfig.animation.easing = easingSelect.value;
    await mosaic.updateConfig({
      animation: currentConfig.animation,
    });
    updateCodeOutput();
  });

  // Hover
  hoverSelect.addEventListener('change', async () => {
    currentConfig.hover.effect = hoverSelect.value;
    // Show/hide glow color picker
    glowColorGroup.style.display = hoverSelect.value === 'glow' ? 'block' : 'none';
    // Re-render to ensure clean hover state
    await mosaic.updateConfig({ hover: currentConfig.hover });
    updateCodeOutput();
  });

  // Glow Color
  glowColorInput.addEventListener('change', async () => {
    currentConfig.hover.color = glowColorInput.value;
    await mosaic.updateConfig({ hover: currentConfig.hover });
    updateCodeOutput();
  });

  // Hover Scale
  hoverScaleSlider.addEventListener('input', () => {
    currentConfig.hover.scale = parseFloat(hoverScaleSlider.value);
    hoverScaleValue.textContent = currentConfig.hover.scale.toFixed(2);
  });

  hoverScaleSlider.addEventListener('change', async () => {
    await mosaic.updateConfig({ hover: currentConfig.hover });
    updateCodeOutput();
  });

  // Hover Duration
  hoverDurationSlider.addEventListener('input', () => {
    currentConfig.hover.duration = parseInt(hoverDurationSlider.value);
    hoverDurationValue.textContent = currentConfig.hover.duration;
  });

  hoverDurationSlider.addEventListener('change', async () => {
    await mosaic.updateConfig({ hover: currentConfig.hover });
    updateCodeOutput();
  });

  // Draggable
  draggableCheck.addEventListener('change', async () => {
    currentConfig.draggable = draggableCheck.checked;
    await mosaic.updateConfig({ draggable: currentConfig.draggable });
    updateCodeOutput();
  });

  // Shuffle (start shuffled)
  shuffleCheck.addEventListener('change', async () => {
    currentConfig.shuffle = shuffleCheck.checked;
    await mosaic.updateConfig({ shuffle: currentConfig.shuffle });
    updateCodeOutput();
  });

  // Actions
  shuffleBtn.addEventListener('click', () => {
    mosaic.shuffle();
  });

  resetBtn.addEventListener('click', () => {
    mosaic.reset();
  });

  renderBtn.addEventListener('click', async () => {
    await mosaic.render();
  });

  // Copy code
  copyCodeBtn.addEventListener('click', () => {
    const code = generateCode();
    navigator.clipboard.writeText(code).then(() => {
      copyCodeBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyCodeBtn.textContent = 'Copy';
      }, 2000);
    });
  });
}

// Generate code snippet
function generateCode() {
  const config = {
    target: "'#container'",
    image: `'path/to/your-image.jpg'`,
    pattern: `'${currentConfig.pattern}'`,
    density: currentConfig.density,
    gap: currentConfig.gap,
    borderRadius: currentConfig.borderRadius,
    animation: {
      type: `'${currentConfig.animation.type}'`,
      delay: typeof currentConfig.animation.delay === 'string'
        ? `'${currentConfig.animation.delay}'`
        : currentConfig.animation.delay,
      duration: currentConfig.animation.duration,
      easing: `'${currentConfig.animation.easing}'`,
    },
    hover: {
      effect: `'${currentConfig.hover.effect}'`,
      scale: currentConfig.hover.scale,
      duration: currentConfig.hover.duration,
      color: currentConfig.hover.color ? `'${currentConfig.hover.color}'` : null,
    },
    draggable: currentConfig.draggable,
    shuffle: currentConfig.shuffle,
  };

  const hoverConfig = config.hover.color
    ? `{
    effect: ${config.hover.effect},
    scale: ${config.hover.scale},
    duration: ${config.hover.duration},
    color: ${config.hover.color},
  }`
    : `{
    effect: ${config.hover.effect},
    scale: ${config.hover.scale},
    duration: ${config.hover.duration},
  }`;

  return `import { Mosaic } from 'image-to-mosaic';

const mosaic = new Mosaic({
  target: ${config.target},
  image: ${config.image},
  pattern: ${config.pattern},
  density: ${config.density},
  gap: ${config.gap},
  borderRadius: ${config.borderRadius},
  animation: {
    type: ${config.animation.type},
    delay: ${config.animation.delay},
    duration: ${config.animation.duration},
    easing: ${config.animation.easing},
  },
  hover: ${hoverConfig},
  draggable: ${config.draggable},
  shuffle: ${config.shuffle},
});

mosaic.render();`;
}

// Update code output
function updateCodeOutput() {
  codeOutput.textContent = generateCode();
}

// Start
init();
