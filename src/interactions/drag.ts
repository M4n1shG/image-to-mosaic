import type { TileData } from '../types';

/**
 * Drag state for a container
 */
interface DragState {
  isDragging: boolean;
  currentTile: TileData | null;
  currentElement: HTMLElement | null;
  startX: number;
  startY: number;
  originalX: number;
  originalY: number;
}

/**
 * WeakMap to store drag handlers for cleanup
 */
const dragStates: WeakMap<HTMLElement, DragState> = new WeakMap();
const dragHandlers: WeakMap<HTMLElement, {
  mousedown: (e: MouseEvent) => void;
  mousemove: (e: MouseEvent) => void;
  mouseup: (e: MouseEvent) => void;
  touchstart: (e: TouchEvent) => void;
  touchmove: (e: TouchEvent) => void;
  touchend: (e: TouchEvent) => void;
}> = new WeakMap();

/**
 * Initialize drag and drop for mosaic tiles
 */
export function initDraggable(container: HTMLElement, tiles: TileData[]): void {
  const state: DragState = {
    isDragging: false,
    currentTile: null,
    currentElement: null,
    startX: 0,
    startY: 0,
    originalX: 0,
    originalY: 0,
  };

  dragStates.set(container, state);

  const startDrag = (clientX: number, clientY: number, target: HTMLElement) => {
    if (!target.classList.contains('mosaic-tile')) return false;

    const index = parseInt(target.dataset.index || '-1', 10);
    const tile = tiles.find((t) => t.index === index);
    if (!tile || !tile.element) return false;

    state.isDragging = true;
    state.currentTile = tile;
    state.currentElement = tile.element;
    state.startX = clientX;
    state.startY = clientY;
    state.originalX = tile.x;
    state.originalY = tile.y;

    // Bring to front and change cursor
    tile.element.style.zIndex = '100';
    tile.element.style.cursor = 'grabbing';
    tile.element.style.transition = 'none'; // Disable transition during drag

    return true;
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!state.isDragging || !state.currentElement) return;

    const dx = clientX - state.startX;
    const dy = clientY - state.startY;

    const newX = state.originalX + dx;
    const newY = state.originalY + dy;

    state.currentElement.style.left = `${newX}px`;
    state.currentElement.style.top = `${newY}px`;

    // Update tile data for swap detection
    if (state.currentTile) {
      state.currentTile.x = newX;
      state.currentTile.y = newY;
    }
  };

  const endDrag = () => {
    if (!state.isDragging || !state.currentTile || !state.currentElement) return;

    // Find closest swap target
    const dropTarget = findClosestTile(state.currentTile, tiles);

    if (dropTarget && dropTarget !== state.currentTile && dropTarget.element) {
      // Swap positions
      swapTiles(state.currentTile, dropTarget, state.originalX, state.originalY);
    } else {
      // Snap back to original position
      state.currentElement.style.transition = 'left 200ms ease-out, top 200ms ease-out';
      state.currentElement.style.left = `${state.originalX}px`;
      state.currentElement.style.top = `${state.originalY}px`;
      state.currentTile.x = state.originalX;
      state.currentTile.y = state.originalY;
    }

    // Reset styles
    state.currentElement.style.zIndex = '1';
    state.currentElement.style.cursor = 'grab';

    state.isDragging = false;
    state.currentTile = null;
    state.currentElement = null;
  };

  const handlers = {
    mousedown: (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (startDrag(e.clientX, e.clientY, target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },

    mousemove: (e: MouseEvent) => {
      if (state.isDragging) {
        e.preventDefault();
        moveDrag(e.clientX, e.clientY);
      }
    },

    mouseup: (e: MouseEvent) => {
      if (state.isDragging) {
        e.preventDefault();
        endDrag();
      }
    },

    touchstart: (e: TouchEvent) => {
      const touch = e.touches[0];
      const target = e.target as HTMLElement;
      if (startDrag(touch.clientX, touch.clientY, target)) {
        e.preventDefault();
      }
    },

    touchmove: (e: TouchEvent) => {
      if (state.isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
      }
    },

    touchend: (e: TouchEvent) => {
      if (state.isDragging) {
        e.preventDefault();
        endDrag();
      }
    },
  };

  dragHandlers.set(container, handlers);

  // Add event listeners to container for mousedown
  container.addEventListener('mousedown', handlers.mousedown);
  container.addEventListener('touchstart', handlers.touchstart, { passive: false });

  // Add mousemove and mouseup to document for drag tracking
  document.addEventListener('mousemove', handlers.mousemove);
  document.addEventListener('mouseup', handlers.mouseup);
  document.addEventListener('touchmove', handlers.touchmove, { passive: false });
  document.addEventListener('touchend', handlers.touchend);

  // Set initial cursor style for tiles
  tiles.forEach((tile) => {
    if (tile.element) {
      tile.element.style.cursor = 'grab';
    }
  });
}

/**
 * Find the closest tile to swap with
 */
function findClosestTile(
  dragged: TileData,
  tiles: TileData[]
): TileData | null {
  let closest: TileData | null = null;
  let minDist = Infinity;

  const dragCenterX = dragged.x + dragged.width / 2;
  const dragCenterY = dragged.y + dragged.height / 2;

  for (const tile of tiles) {
    if (tile === dragged) continue;

    const tileCenterX = tile.x + tile.width / 2;
    const tileCenterY = tile.y + tile.height / 2;

    const dist = Math.sqrt(
      Math.pow(dragCenterX - tileCenterX, 2) + Math.pow(dragCenterY - tileCenterY, 2)
    );

    // Only consider tiles within reasonable distance (half the tile size)
    const threshold = Math.min(dragged.width, dragged.height) * 0.75;
    if (dist < threshold && dist < minDist) {
      minDist = dist;
      closest = tile;
    }
  }

  return closest;
}

/**
 * Swap positions of two tiles
 */
function swapTiles(
  tile1: TileData,
  tile2: TileData,
  tile1OriginalX: number,
  tile1OriginalY: number
): void {
  // Tile1 goes to tile2's position, tile2 goes to tile1's original position
  const tile2X = tile2.x;
  const tile2Y = tile2.y;

  // Update tile1 position (goes to tile2's position)
  tile1.x = tile2X;
  tile1.y = tile2Y;
  if (tile1.element) {
    tile1.element.style.transition = 'left 200ms ease-out, top 200ms ease-out';
    tile1.element.style.left = `${tile2X}px`;
    tile1.element.style.top = `${tile2Y}px`;
  }

  // Update tile2 position (goes to tile1's original position)
  tile2.x = tile1OriginalX;
  tile2.y = tile1OriginalY;
  if (tile2.element) {
    tile2.element.style.transition = 'left 200ms ease-out, top 200ms ease-out';
    tile2.element.style.left = `${tile1OriginalX}px`;
    tile2.element.style.top = `${tile1OriginalY}px`;
  }
}

/**
 * Destroy drag and drop for a container
 */
export function destroyDraggable(container: HTMLElement): void {
  const handlers = dragHandlers.get(container);
  if (handlers) {
    container.removeEventListener('mousedown', handlers.mousedown);
    container.removeEventListener('touchstart', handlers.touchstart);
    document.removeEventListener('mousemove', handlers.mousemove);
    document.removeEventListener('mouseup', handlers.mouseup);
    document.removeEventListener('touchmove', handlers.touchmove);
    document.removeEventListener('touchend', handlers.touchend);
    dragHandlers.delete(container);
  }

  dragStates.delete(container);
}
