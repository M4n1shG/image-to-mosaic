/**
 * Resolve a target to an HTMLElement
 */
export function resolveTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (!element) {
      throw new Error(`Target element not found: ${target}`);
    }
    return element as HTMLElement;
  }
  return target;
}

/**
 * Create an element with styles
 */
export function createElement(
  tag: string,
  styles: Record<string, string> = {},
  className?: string
): HTMLElement {
  const element = document.createElement(tag);
  applyStyles(element, styles);
  if (className) {
    element.className = className;
  }
  return element;
}

/**
 * Apply styles to an element
 */
export function applyStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Remove all children from an element
 */
export function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Preload an image and return its natural dimensions
 */
export function preloadImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}

/**
 * Get computed dimensions of an element
 */
export function getElementDimensions(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Request animation frame wrapper with fallback
 */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}
