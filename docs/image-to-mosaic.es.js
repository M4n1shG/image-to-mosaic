var Z = Object.defineProperty;
var J = (i, e, t) => e in i ? Z(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var g = (i, e, t) => J(i, typeof e != "symbol" ? e + "" : e, t);
function Q(i) {
  if (typeof i == "string") {
    const e = document.querySelector(i);
    if (!e)
      throw new Error(`Target element not found: ${i}`);
    return e;
  }
  return i;
}
function O(i, e = {}, t) {
  const n = document.createElement(i);
  return X(n, e), t && (n.className = t), n;
}
function X(i, e) {
  Object.entries(e).forEach(([t, n]) => {
    i.style.setProperty(t, n);
  });
}
function B(i) {
  for (; i.firstChild; )
    i.removeChild(i.firstChild);
}
function tt(i) {
  return new Promise((e, t) => {
    const n = new Image();
    n.onload = () => {
      e({
        width: n.naturalWidth,
        height: n.naturalHeight
      });
    }, n.onerror = () => {
      t(new Error(`Failed to load image: ${i}`));
    }, n.src = i;
  });
}
function W(i) {
  const e = i.getBoundingClientRect();
  return {
    width: e.width,
    height: e.height
  };
}
function et(i, e) {
  let t;
  return (...n) => {
    clearTimeout(t), t = setTimeout(() => i(...n), e);
  };
}
function it() {
  return new Promise((i) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        i();
      });
    });
  });
}
const D = 4;
function nt(i, e, t, n, s) {
  const a = Math.max(1, Math.min(100, i)) / 100, o = Math.round(
    D + Math.pow(a, 1.5) * (n - D)
  ), c = e / t;
  let m = Math.round(Math.sqrt(o * c)), d = Math.round(m / c);
  for (m = Math.max(2, m), d = Math.max(2, d); m * d > n; )
    m > d ? m-- : d--;
  const l = s * (m - 1), h = s * (d - 1), f = (e - l) / m, u = (t - h) / d;
  return {
    cols: m,
    rows: d,
    tileWidth: f,
    tileHeight: u
  };
}
function It(i, e, t, n) {
  const s = e / t, r = Math.round(i / s), o = (i * r - D) / (n - D), c = Math.pow(o, 1 / 1.5) * 100;
  return Math.max(1, Math.min(100, Math.round(c)));
}
function _(i, e, t, n) {
  return Math.sqrt(Math.pow(t - i, 2) + Math.pow(n - e, 2));
}
function st(i, e) {
  return {
    x: (i - 1) / 2,
    y: (e - 1) / 2
  };
}
function ot(i) {
  const e = [...i];
  for (let t = e.length - 1; t > 0; t--) {
    const n = Math.floor(Math.random() * (t + 1));
    [e[t], e[n]] = [e[n], e[t]];
  }
  return e;
}
function at(i, e) {
  const t = [], n = [];
  for (let u = 0; u < e; u++) {
    n[u] = [];
    for (let p = 0; p < i; p++)
      n[u][p] = u * i + p;
  }
  const s = Math.floor(e / 2), r = Math.floor(i / 2), a = /* @__PURE__ */ new Set(), o = [
    [0, 1],
    // right
    [1, 0],
    // down
    [0, -1],
    // left
    [-1, 0]
    // up
  ];
  let c = s, m = r, d = 0, l = 1, h = 0, f = 0;
  for (; t.length < i * e; ) {
    const u = `${c},${m}`;
    c >= 0 && c < e && m >= 0 && m < i && !a.has(u) && (a.add(u), t.push(n[c][m])), c += o[d][0], m += o[d][1], h++, h === l && (h = 0, d = (d + 1) % 4, f++, f === 2 && (f = 0, l++));
  }
  return t;
}
class z {
  constructor() {
    // Store container dimensions for background calculations
    g(this, "containerWidth", 0);
    g(this, "containerHeight", 0);
  }
  /**
   * Sanitize URL to prevent CSS injection attacks
   * Validates and escapes URLs before use in background-image
   */
  sanitizeUrl(e) {
    if (e.startsWith("data:") || e.startsWith("blob:"))
      return e;
    if (e.startsWith("http://") || e.startsWith("https://"))
      try {
        return new URL(e).href;
      } catch {
        throw new Error(`Invalid image URL: ${e}`);
      }
    return e.replace(/[()'"\\]/g, "\\$&");
  }
  /**
   * Get container styles (can be overridden by patterns)
   */
  getContainerStyles() {
    return {
      position: "relative",
      overflow: "visible"
    };
  }
  /**
   * Get base tile styles
   * Uses pixel-based positioning for accurate image display
   */
  getTileStyles(e, t, n, s) {
    return {
      position: "absolute",
      left: `${e.x}px`,
      top: `${e.y}px`,
      width: `${e.width}px`,
      height: `${e.height}px`,
      "background-image": `url('${this.sanitizeUrl(t)}')`,
      // Use container size for background - image covers full mosaic
      "background-size": `${this.containerWidth}px ${this.containerHeight}px`,
      // Position background so this tile shows the correct portion
      "background-position": `-${e.x}px -${e.y}px`,
      "background-repeat": "no-repeat",
      ...e.clipPath ? { "clip-path": e.clipPath } : {}
    };
  }
  /**
   * Calculate background position for a tile (legacy - now using pixel positioning)
   */
  calculateBackgroundPosition(e, t, n, s) {
    const r = n > 1 ? e / (n - 1) * 100 : 0, a = s > 1 ? t / (s - 1) * 100 : 0;
    return { bgPosX: r, bgPosY: a };
  }
}
class rt extends z {
  constructor() {
    super(...arguments);
    g(this, "name", "grid");
  }
  generateTiles(t, n, s, r, a) {
    this.containerWidth = t, this.containerHeight = n;
    const o = [], c = a * (s - 1), m = a * (r - 1), d = (t - c) / s, l = (n - m) / r;
    let h = 0;
    for (let f = 0; f < r; f++)
      for (let u = 0; u < s; u++) {
        const p = u * (d + a), $ = f * (l + a);
        o.push({
          index: h,
          row: f,
          col: u,
          x: p,
          y: $,
          width: d,
          height: l,
          bgPosX: 0,
          bgPosY: 0
        }), h++;
      }
    return o;
  }
}
class ct extends z {
  constructor() {
    super(...arguments);
    g(this, "name", "brick");
  }
  generateTiles(t, n, s, r, a) {
    this.containerWidth = t, this.containerHeight = n;
    const o = [], c = a * (s - 1), m = a * (r - 1), d = (t - c) / s, l = (n - m) / r, h = (d + a) / 2;
    let f = 0;
    for (let u = 0; u < r; u++) {
      const p = u % 2 === 1, $ = u * (l + a), y = p ? s + 1 : s;
      for (let v = 0; v < y; v++) {
        let x, b;
        p ? (x = v * (d + a) - h, v === 0 ? (b = h - a / 2, x = 0) : v === y - 1 ? (b = h - a / 2, x = t - b) : b = d) : (x = v * (d + a), b = d), !(b < 1) && (o.push({
          index: f,
          row: u,
          col: v,
          x,
          y: $,
          width: b,
          height: l,
          bgPosX: 0,
          bgPosY: 0
        }), f++);
      }
    }
    return o;
  }
}
class lt extends z {
  constructor() {
    super(...arguments);
    g(this, "name", "diamond");
  }
  generateTiles(t, n, s, r, a) {
    this.containerWidth = t, this.containerHeight = n;
    const o = [], c = a * (s - 1), m = a * (r - 1), d = (t - c) / s, l = (n - m) / r;
    let h = 0;
    for (let f = 0; f < r; f++)
      for (let u = 0; u < s; u++) {
        const p = u * (d + a), $ = f * (l + a);
        o.push({
          index: h,
          row: f,
          col: u,
          x: p,
          y: $,
          width: d,
          height: l,
          bgPosX: 0,
          bgPosY: 0,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
        }), h++;
      }
    return o;
  }
}
class ht extends z {
  constructor() {
    super(...arguments);
    g(this, "name", "strips");
    g(this, "orientation", "horizontal");
  }
  setOrientation(t) {
    this.orientation = t;
  }
  generateTiles(t, n, s, r, a) {
    this.containerWidth = t, this.containerHeight = n;
    const o = [];
    if (this.orientation === "horizontal") {
      const c = r, m = a * (c - 1), d = (n - m) / c;
      for (let l = 0; l < c; l++) {
        const h = l * (d + a);
        o.push({
          index: l,
          row: l,
          col: 0,
          x: 0,
          y: h,
          width: t,
          height: d,
          bgPosX: 0,
          bgPosY: 0
        });
      }
    } else {
      const c = s, m = a * (c - 1), d = (t - m) / c;
      for (let l = 0; l < c; l++) {
        const h = l * (d + a);
        o.push({
          index: l,
          row: 0,
          col: l,
          x: h,
          y: 0,
          width: d,
          height: n,
          bgPosX: 0,
          bgPosY: 0
        });
      }
    }
    return o;
  }
}
class mt extends z {
  constructor() {
    super(...arguments);
    g(this, "name", "voronoi");
  }
  generateTiles(t, n, s, r, a) {
    this.containerWidth = t, this.containerHeight = n;
    const o = [], c = s * r, m = [], d = t / s, l = n / r;
    for (let h = 0; h < r; h++)
      for (let f = 0; f < s; f++) {
        const u = (Math.random() - 0.5) * d * 0.6, p = (Math.random() - 0.5) * l * 0.6;
        m.push({
          x: (f + 0.5) * d + u,
          y: (h + 0.5) * l + p
        });
      }
    for (let h = 0; h < c; h++) {
      const f = m[h], u = this.computeVoronoiCell(
        f,
        m,
        t,
        n,
        a
      );
      if (u.length < 3) continue;
      const p = u.map((C) => C.x), $ = u.map((C) => C.y), y = Math.max(0, Math.min(...p)), v = Math.min(t, Math.max(...p)), x = Math.max(0, Math.min(...$)), b = Math.min(n, Math.max(...$)), E = v - y, M = b - x;
      if (E <= 0 || M <= 0) continue;
      const T = u.map((C) => {
        const V = (C.x - y) / E * 100, K = (C.y - x) / M * 100;
        return `${V}% ${K}%`;
      }), U = f.x / t * 100, j = f.y / n * 100;
      o.push({
        index: h,
        row: Math.floor(h / s),
        col: h % s,
        x: y,
        y: x,
        width: E,
        height: M,
        bgPosX: U,
        bgPosY: j,
        clipPath: `polygon(${T.join(", ")})`
      });
    }
    return o;
  }
  computeVoronoiCell(t, n, s, r, a) {
    let o = [
      { x: 0, y: 0 },
      { x: s, y: 0 },
      { x: s, y: r },
      { x: 0, y: r }
    ];
    for (const c of n) {
      if (c === t) continue;
      const m = (t.x + c.x) / 2, d = (t.y + c.y) / 2, l = c.x - t.x, h = c.y - t.y;
      if (o = this.clipPolygon(o, m, d, l, h, a / 2), o.length < 3) break;
    }
    return o;
  }
  clipPolygon(t, n, s, r, a, o) {
    if (t.length < 3) return [];
    const c = Math.sqrt(r * r + a * a), m = r / c, d = a / c, l = n - m * o, h = s - d * o, f = [];
    for (let u = 0; u < t.length; u++) {
      const p = t[u], $ = t[(u + 1) % t.length], y = this.sideOfLine(p, l, h, m, d), v = this.sideOfLine($, l, h, m, d);
      if (y <= 0 && f.push(p), y < 0 && v > 0 || y > 0 && v < 0) {
        const x = this.lineIntersection(
          p,
          $,
          l,
          h,
          m,
          d
        );
        x && f.push(x);
      }
    }
    return f;
  }
  sideOfLine(t, n, s, r, a) {
    return (t.x - n) * r + (t.y - s) * a;
  }
  lineIntersection(t, n, s, r, a, o) {
    const c = n.x - t.x, m = n.y - t.y, d = c * a + m * o;
    if (Math.abs(d) < 1e-10) return null;
    const l = ((s - t.x) * a + (r - t.y) * o) / d;
    return {
      x: t.x + l * c,
      y: t.y + l * m
    };
  }
  getTileStyles(t, n, s, r) {
    return {
      position: "absolute",
      left: `${t.x}px`,
      top: `${t.y}px`,
      width: `${t.width}px`,
      height: `${t.height}px`,
      "background-image": `url('${this.sanitizeUrl(n)}')`,
      "background-size": `${this.containerWidth}px ${this.containerHeight}px`,
      "background-position": `-${t.x}px -${t.y}px`,
      "background-repeat": "no-repeat",
      "clip-path": t.clipPath || ""
    };
  }
}
class dt extends z {
  constructor() {
    super(...arguments);
    g(this, "name", "puzzle");
    // Store bump directions for edge consistency
    g(this, "horizontalBumps", []);
    g(this, "verticalBumps", []);
    g(this, "tabSize", 0);
    g(this, "gap", 0);
  }
  generateTiles(t, n, s, r, a) {
    this.containerWidth = t, this.containerHeight = n, this.gap = a;
    const o = [], c = t / s, m = n / r;
    this.tabSize = Math.min(c, m) * 0.18, this.horizontalBumps = [];
    for (let l = 0; l < r; l++) {
      this.horizontalBumps[l] = [];
      for (let h = 0; h < s - 1; h++)
        this.horizontalBumps[l][h] = Math.random() > 0.5;
    }
    this.verticalBumps = [];
    for (let l = 0; l < r - 1; l++) {
      this.verticalBumps[l] = [];
      for (let h = 0; h < s; h++)
        this.verticalBumps[l][h] = Math.random() > 0.5;
    }
    let d = 0;
    for (let l = 0; l < r; l++)
      for (let h = 0; h < s; h++) {
        const f = h * c, u = l * m, p = {
          top: l === 0 ? "flat" : this.verticalBumps[l - 1][h] ? "hole" : "tab",
          right: h === s - 1 ? "flat" : this.horizontalBumps[l][h] ? "tab" : "hole",
          bottom: l === r - 1 ? "flat" : this.verticalBumps[l][h] ? "tab" : "hole",
          left: h === 0 ? "flat" : this.horizontalBumps[l][h - 1] ? "hole" : "tab"
        }, $ = f - this.tabSize, y = u - this.tabSize, v = c + this.tabSize * 2, x = m + this.tabSize * 2, b = this.generatePuzzlePath(
          c,
          m,
          this.tabSize,
          p,
          this.gap
        );
        o.push({
          index: d,
          row: l,
          col: h,
          x: $,
          y,
          width: v,
          height: x,
          bgPosX: 0,
          bgPosY: 0,
          clipPath: b
        }), d++;
      }
    return o;
  }
  /**
   * Generate SVG path for a puzzle piece with bezier curve tabs
   */
  generatePuzzlePath(t, n, s, r, a) {
    const o = a / 2, c = s + o, m = s + o, d = s + t - o, l = s + n - o, h = [];
    h.push(`M ${c} ${m}`);
    const f = Math.max(s - o, s * 0.5);
    return h.push(this.generateEdgePath(
      c,
      m,
      d,
      m,
      r.top,
      "horizontal",
      "up",
      f
    )), h.push(this.generateEdgePath(
      d,
      m,
      d,
      l,
      r.right,
      "vertical",
      "right",
      f
    )), h.push(this.generateEdgePath(
      d,
      l,
      c,
      l,
      r.bottom,
      "horizontal",
      "down",
      f
    )), h.push(this.generateEdgePath(
      c,
      l,
      c,
      m,
      r.left,
      "vertical",
      "left",
      f
    )), h.push("Z"), `path('${h.join(" ")}')`;
  }
  /**
   * Generate path for a single edge with optional tab or hole
   */
  generateEdgePath(t, n, s, r, a, o, c, m) {
    if (a === "flat")
      return `L ${s} ${r}`;
    const l = a === "tab" ? c : this.oppositeDir(c), h = (t + s) / 2, f = (n + r) / 2, u = m * 0.8, p = m * 0.95;
    if (o === "horizontal") {
      const y = s > t ? 1 : -1, v = h - y * u, x = h + y * u, b = l === "up" ? -1 : 1, E = n, M = E + b * p, T = E + b * (p * 0.35);
      return `L ${v} ${E} C ${v} ${T}, ${h - y * u * 1.3} ${M}, ${h} ${M} C ${h + y * u * 1.3} ${M}, ${x} ${T}, ${x} ${E} L ${s} ${r}`;
    } else {
      const y = r > n ? 1 : -1, v = f - y * u, x = f + y * u, b = l === "right" ? 1 : -1, E = t, M = E + b * p, T = E + b * (p * 0.35);
      return `L ${E} ${v} C ${T} ${v}, ${M} ${f - y * u * 1.3}, ${M} ${f} C ${M} ${f + y * u * 1.3}, ${T} ${x}, ${E} ${x} L ${s} ${r}`;
    }
  }
  oppositeDir(t) {
    switch (t) {
      case "up":
        return "down";
      case "down":
        return "up";
      case "left":
        return "right";
      case "right":
        return "left";
    }
  }
  getTileStyles(t, n, s, r) {
    const a = -t.x, o = -t.y;
    return {
      position: "absolute",
      left: `${t.x}px`,
      top: `${t.y}px`,
      width: `${t.width}px`,
      height: `${t.height}px`,
      "background-image": `url('${this.sanitizeUrl(n)}')`,
      "background-size": `${this.containerWidth}px ${this.containerHeight}px`,
      "background-position": `${a}px ${o}px`,
      "background-repeat": "no-repeat",
      "clip-path": t.clipPath || "",
      filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))"
    };
  }
}
const k = /* @__PURE__ */ new Map([
  ["grid", new rt()],
  ["brick", new ct()],
  ["diamond", new lt()],
  ["strips", new ht()],
  ["voronoi", new mt()],
  ["puzzle", new dt()]
]);
function Y(i) {
  const e = k.get(i);
  return e || (console.warn(`Pattern "${i}" not found, falling back to grid`), k.get("grid"));
}
function Rt() {
  return Array.from(k.keys());
}
function Xt(i) {
  k.set(i.name, i);
}
class ut {
  calculate(e, t, n, s, r) {
    return e.index / t * r;
  }
}
class ft {
  calculate(e, t, n, s, r) {
    return Math.random() * r;
  }
}
class gt {
  calculate(e, t, n, s, r) {
    const a = st(n, s), o = _(e.col, e.row, a.x, a.y), c = _(0, 0, a.x, a.y);
    return o / c * r;
  }
}
class pt {
  constructor() {
    g(this, "spiralCache", /* @__PURE__ */ new Map());
  }
  calculate(e, t, n, s, r) {
    const a = `${n}x${s}`;
    let o = this.spiralCache.get(a);
    o || (o = at(n, s), this.spiralCache.set(a, o));
    const c = o.indexOf(e.index);
    return (c >= 0 ? c : e.index) / t * r;
  }
}
class yt {
  constructor(e) {
    this.delay = e;
  }
  calculate() {
    return this.delay;
  }
}
const A = /* @__PURE__ */ new Map([
  ["sequential", new ut()],
  ["random", new ft()],
  ["center", new gt()],
  ["spiral", new pt()]
]);
function I(i) {
  if (typeof i == "number")
    return new yt(i);
  const e = A.get(i);
  return e || (console.warn(`Delay mode "${i}" not found, falling back to random`), A.get("random"));
}
function Ft() {
  return Array.from(A.keys());
}
function Ht(i, e) {
  A.set(i, e);
}
const F = /* @__PURE__ */ new WeakMap();
function G(i, e) {
  const { effect: t, scale: n, duration: s, color: r } = e;
  t !== "none" && (n !== void 0 && i.style.setProperty("--hover-scale", n.toString()), s !== void 0 && i.style.setProperty("--hover-duration", `${s}ms`), r && t === "glow" && i.style.setProperty("--hover-color", r), i.classList.add(`hover-${t}`), t === "tilt" && vt(i));
}
function vt(i) {
  const e = (n) => {
    const s = i.getBoundingClientRect(), r = n.clientX - s.left, a = n.clientY - s.top, o = s.width / 2, c = s.height / 2, m = (r - o) / o * 15, d = (c - a) / c * 15;
    i.style.setProperty("--tilt-x", `${d}deg`), i.style.setProperty("--tilt-y", `${m}deg`);
  }, t = () => {
    i.style.setProperty("--tilt-x", "0deg"), i.style.setProperty("--tilt-y", "0deg");
  };
  i.addEventListener("mousemove", e), i.addEventListener("mouseleave", t), F.set(i, { move: e, leave: t });
}
function R(i) {
  i.classList.remove(
    "hover-lift",
    "hover-glow",
    "hover-zoom",
    "hover-tilt",
    "hover-flip",
    "hover-blur",
    "hover-pop",
    "hover-spotlight"
  );
  const e = F.get(i);
  e && (i.removeEventListener("mousemove", e.move), i.removeEventListener("mouseleave", e.leave), F.delete(i)), i.style.removeProperty("--tilt-x"), i.style.removeProperty("--tilt-y"), i.style.removeProperty("--hover-color");
}
const q = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap();
function xt(i, e) {
  const t = {
    isDragging: !1,
    currentTile: null,
    currentElement: null,
    startX: 0,
    startY: 0,
    originalX: 0,
    originalY: 0
  };
  q.set(i, t);
  const n = (o, c, m) => {
    if (!m.classList.contains("mosaic-tile")) return !1;
    const d = parseInt(m.dataset.index || "-1", 10), l = e.find((h) => h.index === d);
    return !l || !l.element ? !1 : (t.isDragging = !0, t.currentTile = l, t.currentElement = l.element, t.startX = o, t.startY = c, t.originalX = l.x, t.originalY = l.y, l.element.style.zIndex = "100", l.element.style.cursor = "grabbing", l.element.style.transition = "none", !0);
  }, s = (o, c) => {
    if (!t.isDragging || !t.currentElement) return;
    const m = o - t.startX, d = c - t.startY, l = t.originalX + m, h = t.originalY + d;
    t.currentElement.style.left = `${l}px`, t.currentElement.style.top = `${h}px`, t.currentTile && (t.currentTile.x = l, t.currentTile.y = h);
  }, r = () => {
    if (!t.isDragging || !t.currentTile || !t.currentElement) return;
    const o = bt(t.currentTile, e);
    o && o !== t.currentTile && o.element ? wt(t.currentTile, o, t.originalX, t.originalY) : (t.currentElement.style.transition = "left 200ms ease-out, top 200ms ease-out", t.currentElement.style.left = `${t.originalX}px`, t.currentElement.style.top = `${t.originalY}px`, t.currentTile.x = t.originalX, t.currentTile.y = t.originalY), t.currentElement.style.zIndex = "1", t.currentElement.style.cursor = "grab", t.isDragging = !1, t.currentTile = null, t.currentElement = null;
  }, a = {
    mousedown: (o) => {
      const c = o.target;
      n(o.clientX, o.clientY, c) && (o.preventDefault(), o.stopPropagation());
    },
    mousemove: (o) => {
      t.isDragging && (o.preventDefault(), s(o.clientX, o.clientY));
    },
    mouseup: (o) => {
      t.isDragging && (o.preventDefault(), r());
    },
    touchstart: (o) => {
      const c = o.touches[0], m = o.target;
      n(c.clientX, c.clientY, m) && o.preventDefault();
    },
    touchmove: (o) => {
      if (t.isDragging) {
        o.preventDefault();
        const c = o.touches[0];
        s(c.clientX, c.clientY);
      }
    },
    touchend: (o) => {
      t.isDragging && (o.preventDefault(), r());
    }
  };
  H.set(i, a), i.addEventListener("mousedown", a.mousedown), i.addEventListener("touchstart", a.touchstart, { passive: !1 }), document.addEventListener("mousemove", a.mousemove), document.addEventListener("mouseup", a.mouseup), document.addEventListener("touchmove", a.touchmove, { passive: !1 }), document.addEventListener("touchend", a.touchend), e.forEach((o) => {
    o.element && (o.element.style.cursor = "grab");
  });
}
function bt(i, e) {
  let t = null, n = 1 / 0;
  const s = i.x + i.width / 2, r = i.y + i.height / 2;
  for (const a of e) {
    if (a === i) continue;
    const o = a.x + a.width / 2, c = a.y + a.height / 2, m = Math.sqrt(
      Math.pow(s - o, 2) + Math.pow(r - c, 2)
    ), d = Math.min(i.width, i.height) * 0.75;
    m < d && m < n && (n = m, t = a);
  }
  return t;
}
function wt(i, e, t, n) {
  const s = e.x, r = e.y;
  i.x = s, i.y = r, i.element && (i.element.style.transition = "left 200ms ease-out, top 200ms ease-out", i.element.style.left = `${s}px`, i.element.style.top = `${r}px`), e.x = t, e.y = n, e.element && (e.element.style.transition = "left 200ms ease-out, top 200ms ease-out", e.element.style.left = `${t}px`, e.element.style.top = `${n}px`);
}
function N(i) {
  const e = H.get(i);
  e && (i.removeEventListener("mousedown", e.mousedown), i.removeEventListener("touchstart", e.touchstart), document.removeEventListener("mousemove", e.mousemove), document.removeEventListener("mouseup", e.mouseup), document.removeEventListener("touchmove", e.touchmove), document.removeEventListener("touchend", e.touchend), H.delete(i)), q.delete(i);
}
let P = null, S = 0;
function $t() {
  S++, !P && (P = document.createElement("style"), P.id = "mosaic-styles", P.textContent = `
    /* ========== BASE TILE STYLES ========== */
    .mosaic-tile {
      position: absolute;
      background-repeat: no-repeat;
      transform-origin: center center;
    }

    /* ========== ANIMATION KEYFRAMES ========== */
    @keyframes mosaic-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes mosaic-scale {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes mosaic-flip {
      from { opacity: 0; transform: perspective(400px) rotateY(90deg); }
      to { opacity: 1; transform: perspective(400px) rotateY(0deg); }
    }

    @keyframes mosaic-slide {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes mosaic-scatter {
      from {
        opacity: 0;
        transform: translate(calc((var(--random-x, 0) - 0.5) * 200px), calc((var(--random-y, 0) - 0.5) * 200px)) rotate(calc((var(--random-r, 0) - 0.5) * 90deg));
      }
      to {
        opacity: 1;
        transform: translate(0, 0) rotate(0deg);
      }
    }

    /* ========== ANIMATION CLASSES ========== */
    .mosaic-tile.animate-none {
      opacity: 1;
    }

    /* Completed state - no transform so hover works */
    .mosaic-tile.animate-complete {
      opacity: 1;
    }

    .mosaic-tile.animate-fade {
      opacity: 0;
      animation: mosaic-fade var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-scale {
      opacity: 0;
      transform: scale(0.5);
      animation: mosaic-scale var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-flip {
      opacity: 0;
      transform: perspective(400px) rotateY(90deg);
      animation: mosaic-flip var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-slide {
      opacity: 0;
      transform: translateY(30px);
      animation: mosaic-slide var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    .mosaic-tile.animate-scatter {
      opacity: 0;
      animation: mosaic-scatter var(--animation-duration, 500ms) var(--animation-easing, ease-out) var(--animation-delay, 0ms) forwards;
    }

    /* ========== HOVER EFFECTS ========== */

    /* Lift - rises up with shadow */
    .mosaic-tile.hover-lift {
      transition: transform var(--hover-duration, 200ms) ease-out, box-shadow var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-lift:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
      z-index: 10;
    }

    /* Glow - glows with customizable color (no movement) */
    .mosaic-tile.hover-glow {
      transition: box-shadow var(--hover-duration, 200ms) ease-out, filter var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-glow:hover {
      filter: brightness(1.2) saturate(1.2);
      box-shadow: 0 0 20px var(--hover-color, rgba(255,255,255,0.6)), 0 0 40px var(--hover-color, rgba(255,255,255,0.3));
      z-index: 10;
    }

    /* Zoom - dramatic scale with shadow */
    .mosaic-tile.hover-zoom {
      transition: transform var(--hover-duration, 200ms) cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-zoom:hover {
      transform: scale(var(--hover-scale, 1.15));
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10;
    }

    /* Tilt - dynamic 3D tilt based on mouse position (JS sets --tilt-x, --tilt-y) */
    .mosaic-tile.hover-tilt {
      transition: transform var(--hover-duration, 200ms) ease-out;
      transform-style: preserve-3d;
    }
    .mosaic-tile.hover-tilt:hover {
      transform: perspective(600px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1.05);
      z-index: 10;
    }

    /* Flip - 3D flip on hover */
    @keyframes mosaic-hover-flip {
      0% { transform: perspective(600px) rotateY(0deg); }
      100% { transform: perspective(600px) rotateY(180deg); }
    }
    .mosaic-tile.hover-flip {
      transition: transform var(--hover-duration, 300ms) ease-in-out;
      transform-style: preserve-3d;
    }
    .mosaic-tile.hover-flip:hover {
      transform: perspective(600px) rotateY(180deg) scale(1.05);
      z-index: 10;
    }

    /* Blur - glassmorphism blur effect */
    .mosaic-tile.hover-blur {
      transition: filter var(--hover-duration, 200ms) ease-out, transform var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-blur:hover {
      filter: blur(0px) brightness(1.1);
      transform: scale(1.08);
      z-index: 10;
    }
    .mosaic-tile.hover-blur:not(:hover) {
      filter: blur(1px) brightness(0.9);
    }

    /* Pop - bouncy scale animation */
    @keyframes mosaic-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1.08); }
    }
    .mosaic-tile.hover-pop {
      transition: transform var(--hover-duration, 200ms) ease-out;
    }
    .mosaic-tile.hover-pop:hover {
      animation: mosaic-pop 0.3s ease-out forwards;
      box-shadow: 0 8px 25px rgba(0,0,0,0.25);
      z-index: 10;
    }

    /* Spotlight - subtle darkening, brighten on hover */
    .mosaic-tile.hover-spotlight {
      transition: filter var(--hover-duration, 200ms) ease-out, transform var(--hover-duration, 200ms) ease-out;
      filter: brightness(0.7);
    }
    .mosaic-tile.hover-spotlight:hover {
      filter: brightness(1.1) contrast(1.1);
      transform: scale(1.05);
      z-index: 10;
    }

    /* ========== DRAGGABLE STYLES ========== */
    .mosaic-tile.draggable {
      cursor: grab;
    }
    .mosaic-tile.draggable:active {
      cursor: grabbing;
    }
    .mosaic-tile.dragging {
      z-index: 100;
      cursor: grabbing;
      transition: none !important;
    }
  `, document.head.appendChild(P));
}
function Et() {
  S--, S <= 0 && P && (P.remove(), P = null, S = 0);
}
const Mt = [
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear"
];
function Pt(i) {
  return Mt.includes(i) || /^cubic-bezier\(\s*([0-9.]+)\s*,\s*([0-9.-]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.-]+)\s*\)$/.test(i) ? i : "ease-out";
}
const w = {
  renderAs: "element",
  width: "auto",
  height: "auto",
  pattern: "grid",
  density: 50,
  maxTiles: 2500,
  gap: 2,
  borderRadius: 0,
  animation: {
    type: "none",
    duration: 500,
    delay: "sequential",
    easing: "ease-out"
  },
  hover: {
    effect: "none",
    scale: 1.1,
    duration: 200
  },
  draggable: !1,
  shuffle: !1
};
class Tt {
  constructor(e) {
    g(this, "config");
    g(this, "container", null);
    g(this, "tiles", []);
    g(this, "pattern");
    g(this, "delayCalculator");
    g(this, "imageLoaded", !1);
    g(this, "imageDimensions", { width: 0, height: 0 });
    g(this, "resizeObserver", null);
    g(this, "originalTilePositions", /* @__PURE__ */ new Map());
    g(this, "lastContainerSize", { width: 0, height: 0 });
    g(this, "tileClickHandlers", /* @__PURE__ */ new Map());
    this.config = this.resolveConfig(e), this.pattern = Y(this.config.pattern), this.delayCalculator = I(this.config.animation.delay);
  }
  /**
   * Resolve and merge configuration with defaults
   */
  resolveConfig(e) {
    var o, c, m, d, l, h, f, u;
    const t = Q(e.target), n = {
      type: ((o = e.animation) == null ? void 0 : o.type) ?? w.animation.type,
      duration: ((c = e.animation) == null ? void 0 : c.duration) ?? w.animation.duration,
      delay: ((m = e.animation) == null ? void 0 : m.delay) ?? w.animation.delay,
      easing: ((d = e.animation) == null ? void 0 : d.easing) ?? w.animation.easing
    }, s = {
      effect: ((l = e.hover) == null ? void 0 : l.effect) ?? w.hover.effect,
      scale: ((h = e.hover) == null ? void 0 : h.scale) ?? w.hover.scale,
      duration: ((f = e.hover) == null ? void 0 : f.duration) ?? w.hover.duration,
      color: (u = e.hover) == null ? void 0 : u.color
    }, r = e.borderRadius ?? w.borderRadius, a = typeof r == "number" ? `${r}px` : r;
    return {
      target: t,
      image: e.image,
      renderAs: e.renderAs ?? w.renderAs,
      width: e.width ?? w.width,
      height: e.height ?? w.height,
      pattern: e.pattern ?? w.pattern,
      density: e.density ?? w.density,
      maxTiles: e.maxTiles ?? w.maxTiles,
      gap: e.gap ?? w.gap,
      borderRadius: a,
      animation: n,
      hover: s,
      draggable: e.draggable ?? w.draggable,
      shuffle: e.shuffle ?? w.shuffle,
      onReady: e.onReady,
      onTileClick: e.onTileClick,
      onError: e.onError
    };
  }
  /**
   * Render the mosaic
   */
  async render() {
    var n, s, r, a;
    if ($t(), this.container && (N(this.container), this.tiles.forEach((o) => {
      o.element && R(o.element);
    })), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), !this.imageLoaded)
      try {
        this.imageDimensions = await tt(this.config.image), this.imageLoaded = !0;
      } catch (o) {
        const c = o instanceof Error ? o : new Error("Failed to load image");
        throw (s = (n = this.config).onError) == null || s.call(n, c), c;
      }
    const e = this.getContainerDimensions();
    this.lastContainerSize = { ...e }, this.createContainer(e);
    const t = nt(
      this.config.density,
      e.width,
      e.height,
      this.config.maxTiles,
      this.config.gap
    );
    this.tiles = this.pattern.generateTiles(
      e.width,
      e.height,
      t.cols,
      t.rows,
      this.config.gap
    ), this.tiles.forEach((o) => {
      this.originalTilePositions.set(o.index, { x: o.x, y: o.y });
    }), this.calculateDelays(t.cols, t.rows), this.config.shuffle && this.shuffleTilePositions(), await this.renderTiles(t.cols, t.rows), this.setupInteractivity(), this.setupResizeObserver(), (a = (r = this.config).onReady) == null || a.call(r);
  }
  /**
   * Get container dimensions
   */
  getContainerDimensions() {
    let e, t;
    if (this.config.width === "auto" || this.config.height === "auto") {
      const n = W(this.config.target);
      e = this.config.width === "auto" ? n.width : this.config.width, t = this.config.height === "auto" ? n.height : this.config.height, t === 0 && this.imageDimensions.height > 0 && (t = e / this.imageDimensions.width * this.imageDimensions.height);
    } else
      e = this.config.width, t = this.config.height;
    return { width: e, height: t };
  }
  /**
   * Create the mosaic container element
   */
  createContainer(e) {
    B(this.config.target), this.container = O(
      "div",
      {
        ...this.pattern.getContainerStyles(),
        width: `${e.width}px`,
        height: `${e.height}px`
      },
      "mosaic-container"
    ), this.config.target.appendChild(this.container);
  }
  /**
   * Calculate animation delays for each tile
   */
  calculateDelays(e, t) {
    const n = this.config.animation.duration * 2, s = this.tiles.length;
    this.tiles.forEach((r) => {
      r.animationDelay = this.delayCalculator.calculate(
        r,
        s,
        e,
        t,
        n
      );
    });
  }
  /**
   * Shuffle tile visual positions (not the background)
   */
  shuffleTilePositions() {
    const e = this.tiles.map((n) => ({ x: n.x, y: n.y })), t = ot(e);
    this.tiles.forEach((n, s) => {
      n.x = t[s].x, n.y = t[s].y;
    });
  }
  /**
   * Render all tiles to the container
   */
  async renderTiles(e, t) {
    if (!this.container) return;
    const n = document.createDocumentFragment();
    for (const s of this.tiles) {
      const r = this.createTileElement(s, e, t);
      s.element = r, n.appendChild(r);
    }
    this.container.appendChild(n), await it();
    for (const s of this.tiles)
      s.element && this.animateTileIn(s);
  }
  /**
   * Create a single tile element
   */
  createTileElement(e, t, n) {
    const s = this.pattern.getTileStyles(e, this.config.image, t, n), r = !e.clipPath && this.config.borderRadius !== "0px" ? { "border-radius": this.config.borderRadius } : {}, a = O(
      "div",
      {
        ...s,
        ...r,
        cursor: this.config.onTileClick || this.config.draggable ? "pointer" : "default"
      },
      "mosaic-tile"
    );
    a.style.setProperty("--animation-duration", `${this.config.animation.duration}ms`), a.style.setProperty("--animation-delay", `${e.animationDelay}ms`), a.style.setProperty("--animation-easing", Pt(this.config.animation.easing)), this.config.animation.type === "scatter" && (a.style.setProperty("--random-x", String(Math.random())), a.style.setProperty("--random-y", String(Math.random())), a.style.setProperty("--random-r", String(Math.random())));
    const o = this.config.animation.type;
    if (a.classList.add(`animate-${o}`), o !== "none" && a.addEventListener("animationend", () => {
      a.classList.remove(`animate-${o}`), a.classList.add("animate-complete");
    }, { once: !0 }), a.dataset.index = String(e.index), a.dataset.row = String(e.row), a.dataset.col = String(e.col), this.config.onTileClick) {
      const c = () => {
        var m, d;
        return (d = (m = this.config).onTileClick) == null ? void 0 : d.call(m, e, e.index);
      };
      a.addEventListener("click", c), this.tileClickHandlers.set(a, c);
    }
    return a;
  }
  /**
   * Animate a tile into view
   * With CSS-only animations, the animation class already handles this
   * The element is created with the animation class which triggers automatically
   */
  animateTileIn(e) {
  }
  /**
   * Setup hover and drag interactivity
   */
  setupInteractivity() {
    this.config.hover.effect !== "none" && this.tiles.forEach((e) => {
      e.element && G(e.element, this.config.hover);
    }), this.config.draggable && this.container && xt(this.container, this.tiles);
  }
  /**
   * Setup resize observer for responsive behavior
   */
  setupResizeObserver() {
    if (typeof ResizeObserver > "u")
      return;
    const e = et(() => {
      const t = W(this.config.target);
      t.width === this.lastContainerSize.width && t.height === this.lastContainerSize.height || this.render();
    }, 250);
    this.resizeObserver = new ResizeObserver(e), this.resizeObserver.observe(this.config.target);
  }
  /**
   * Shuffle tiles to random positions
   */
  shuffle() {
    this.shuffleTilePositions(), this.tiles.forEach((e) => {
      e.element && X(e.element, {
        left: `${e.x}px`,
        top: `${e.y}px`
      });
    });
  }
  /**
   * Reset tiles to original positions
   */
  reset() {
    this.tiles.forEach((e) => {
      const t = this.originalTilePositions.get(e.index);
      t && e.element && (e.x = t.x, e.y = t.y, X(e.element, {
        left: `${e.x}px`,
        top: `${e.y}px`
      }));
    });
  }
  /**
   * Update the image
   */
  async setImage(e) {
    this.config.image = e, this.imageLoaded = !1, await this.render();
  }
  /**
   * Update density
   */
  async setDensity(e) {
    this.config.density = Math.max(1, Math.min(100, e)), await this.render();
  }
  /**
   * Update pattern
   */
  async setPattern(e) {
    this.config.pattern = e, this.pattern = Y(e), await this.render();
  }
  /**
   * Update animation type
   * Note: Requires re-render to apply new animation class to tiles
   */
  async setAnimation(e) {
    this.config.animation.type = e, await this.render();
  }
  /**
   * Update delay mode
   */
  setDelayMode(e) {
    this.config.animation.delay = e, this.delayCalculator = I(e);
  }
  /**
   * Update hover effect
   */
  setHoverEffect(e) {
    this.tiles.forEach((t) => {
      t.element && R(t.element);
    }), this.config.hover.effect = e, e !== "none" && this.tiles.forEach((t) => {
      t.element && G(t.element, this.config.hover);
    });
  }
  /**
   * Update configuration
   */
  async updateConfig(e) {
    var t;
    this.config = this.resolveConfig({ ...this.config, ...e }), e.pattern && (this.pattern = Y(this.config.pattern)), (t = e.animation) != null && t.delay && (this.delayCalculator = I(this.config.animation.delay)), await this.render();
  }
  /**
   * Get current tiles
   */
  getTiles() {
    return [...this.tiles];
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Destroy the mosaic and cleanup
   */
  destroy() {
    this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.container && N(this.container), this.tileClickHandlers.forEach((e, t) => {
      t.removeEventListener("click", e);
    }), this.tileClickHandlers.clear(), this.tiles.forEach((e) => {
      e.element && R(e.element);
    }), B(this.config.target), this.container = null, this.tiles = [], this.originalTilePositions.clear(), Et();
  }
}
class Ct extends HTMLElement {
  constructor() {
    super();
    g(this, "mosaic", null);
    g(this, "container");
    const t = this.attachShadow({ mode: "open" }), n = document.createElement("style");
    n.textContent = `
      :host {
        display: block;
        position: relative;
      }
      .mosaic-wrapper {
        width: 100%;
        height: 100%;
      }
    `, t.appendChild(n), this.container = document.createElement("div"), this.container.className = "mosaic-wrapper", t.appendChild(this.container);
  }
  static get observedAttributes() {
    return [
      "src",
      "pattern",
      "density",
      "gap",
      "animation",
      "animation-duration",
      "animation-delay",
      "hover",
      "draggable",
      "width",
      "height"
    ];
  }
  connectedCallback() {
    this.initMosaic();
  }
  disconnectedCallback() {
    var t;
    (t = this.mosaic) == null || t.destroy(), this.mosaic = null;
  }
  attributeChangedCallback(t, n, s) {
    n !== s && this.mosaic && this.updateMosaicFromAttributes();
  }
  async initMosaic() {
    const t = this.getAttribute("src");
    if (!t) {
      const s = new Error("MosaicImage: src attribute is required");
      this.dispatchEvent(new CustomEvent("error", { detail: s }));
      return;
    }
    const n = this.getConfigFromAttributes();
    try {
      this.mosaic = new Tt({
        target: this.container,
        image: t,
        ...n,
        onError: (s) => {
          this.dispatchEvent(new CustomEvent("error", { detail: s }));
        }
      }), await this.mosaic.render(), this.dispatchEvent(new CustomEvent("ready"));
    } catch (s) {
      this.dispatchEvent(new CustomEvent("error", { detail: s }));
    }
  }
  getConfigFromAttributes() {
    const t = {}, n = this.getAttribute("pattern");
    n && (t.pattern = n);
    const s = this.getAttribute("density");
    s && (t.density = parseInt(s, 10));
    const r = this.getAttribute("gap");
    r && (t.gap = parseInt(r, 10));
    const a = this.getAttribute("width");
    a && (t.width = a === "auto" ? "auto" : parseInt(a, 10));
    const o = this.getAttribute("height");
    o && (t.height = o === "auto" ? "auto" : parseInt(o, 10));
    const c = this.getAttribute("animation"), m = this.getAttribute("animation-duration"), d = this.getAttribute("animation-delay");
    (c || m || d) && (t.animation = {
      type: c || "fade",
      duration: m ? parseInt(m, 10) : 500,
      delay: this.parseDelayMode(d)
    });
    const l = this.getAttribute("hover");
    l && (t.hover = {
      effect: l
    });
    const h = this.getAttribute("draggable");
    return h !== null && (t.draggable = h !== "false"), t;
  }
  parseDelayMode(t) {
    if (!t) return "random";
    const n = parseInt(t, 10);
    return isNaN(n) ? t : n;
  }
  async updateMosaicFromAttributes() {
    if (this.mosaic)
      try {
        const t = this.getAttribute("src");
        t && await this.mosaic.setImage(t);
        const n = this.getConfigFromAttributes();
        await this.mosaic.updateConfig(n);
      } catch (t) {
        this.dispatchEvent(new CustomEvent("error", { detail: t }));
      }
  }
  // Public API methods
  /**
   * Shuffle the tiles
   */
  shuffle() {
    var t;
    (t = this.mosaic) == null || t.shuffle();
  }
  /**
   * Reset tiles to original positions
   */
  reset() {
    var t;
    (t = this.mosaic) == null || t.reset();
  }
  /**
   * Re-render the mosaic
   */
  async render() {
    var t;
    await ((t = this.mosaic) == null ? void 0 : t.render());
  }
  /**
   * Get the underlying Mosaic instance
   */
  getMosaic() {
    return this.mosaic;
  }
}
function Ot(i = "mosaic-image") {
  customElements.get(i) || customElements.define(i, Ct);
}
class zt {
  constructor() {
    g(this, "name", "fade");
  }
  getInitialStyles() {
    return {
      opacity: "0"
    };
  }
  getFinalStyles() {
    return {
      opacity: "1"
    };
  }
  getTransition(e, t) {
    return `opacity ${e}ms ${t}`;
  }
}
class St {
  constructor() {
    g(this, "name", "scale");
  }
  getInitialStyles() {
    return {
      opacity: "0",
      transform: "scale(0)"
    };
  }
  getFinalStyles() {
    return {
      opacity: "1",
      transform: "scale(1)"
    };
  }
  getTransition(e, t) {
    return `opacity ${e}ms ${t}, transform ${e}ms ${t}`;
  }
}
class Dt {
  constructor() {
    g(this, "name", "flip");
  }
  getInitialStyles() {
    return {
      opacity: "0",
      transform: "perspective(1000px) rotateY(90deg)",
      "backface-visibility": "hidden"
    };
  }
  getFinalStyles() {
    return {
      opacity: "1",
      transform: "perspective(1000px) rotateY(0deg)"
    };
  }
  getTransition(e, t) {
    return `opacity ${e}ms ${t}, transform ${e}ms ${t}`;
  }
}
class kt {
  constructor() {
    g(this, "name", "slide");
  }
  getInitialStyles() {
    return {
      opacity: "0",
      transform: "translateY(50px)"
    };
  }
  getFinalStyles() {
    return {
      opacity: "1",
      transform: "translateY(0)"
    };
  }
  getTransition(e, t) {
    return `opacity ${e}ms ${t}, transform ${e}ms ${t}`;
  }
}
class At {
  constructor() {
    g(this, "name", "scatter");
  }
  getInitialStyles() {
    const e = Math.random() * Math.PI * 2, t = 100 + Math.random() * 200, n = Math.cos(e) * t, s = Math.sin(e) * t, r = (Math.random() - 0.5) * 360;
    return {
      opacity: "0",
      transform: `translate(${n}px, ${s}px) rotate(${r}deg) scale(0.5)`
    };
  }
  getFinalStyles() {
    return {
      opacity: "1",
      transform: "translate(0, 0) rotate(0deg) scale(1)"
    };
  }
  getTransition(e, t) {
    return `opacity ${e}ms ${t}, transform ${e}ms ${t}`;
  }
}
class Lt {
  constructor() {
    g(this, "name", "none");
  }
  getInitialStyles() {
    return {
      opacity: "1"
    };
  }
  getFinalStyles() {
    return {
      opacity: "1"
    };
  }
  getTransition() {
    return "none";
  }
}
const L = /* @__PURE__ */ new Map([
  ["fade", new zt()],
  ["scale", new St()],
  ["flip", new Dt()],
  ["slide", new kt()],
  ["scatter", new At()],
  ["none", new Lt()]
]);
function Bt(i) {
  const e = L.get(i);
  return e || (console.warn(`Animation "${i}" not found, falling back to fade`), L.get("fade"));
}
function Wt() {
  return Array.from(L.keys());
}
function _t(i) {
  L.set(i.name, i);
}
export {
  z as BasePattern,
  ct as BrickPattern,
  gt as CenterDelay,
  lt as DiamondPattern,
  zt as FadeAnimation,
  Dt as FlipAnimation,
  rt as GridPattern,
  Tt as Mosaic,
  Ct as MosaicImageElement,
  dt as PuzzlePattern,
  ft as RandomDelay,
  St as ScaleAnimation,
  At as ScatterAnimation,
  ut as SequentialDelay,
  kt as SlideAnimation,
  pt as SpiralDelay,
  ht as StripsPattern,
  mt as VoronoiPattern,
  It as columnsToApproxDensity,
  nt as densityToGrid,
  Bt as getAnimation,
  Wt as getAnimationNames,
  I as getDelayCalculator,
  Ft as getDelayModeNames,
  Y as getPattern,
  Rt as getPatternNames,
  _t as registerAnimation,
  Ht as registerDelayCalculator,
  Ot as registerMosaicElement,
  Xt as registerPattern
};
//# sourceMappingURL=image-to-mosaic.es.js.map
