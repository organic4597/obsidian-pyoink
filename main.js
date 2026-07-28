/*
PyoInk — bundled by esbuild
Design: 00-사람/계획/2026-07-29-pyoink-detailed-design-exceptions.md
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PyoInkPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/view/PyoInkView.ts
var import_obsidian2 = require("obsidian");

// node_modules/perfect-freehand/dist/esm/index.mjs
var { PI: e } = Math;
var t = e + 1e-4;
var n = 0.5;
var r = [1, 1];
function i(e2, t2, n2, r2 = (e3) => e3) {
  return e2 * r2(0.5 - t2 * (0.5 - n2));
}
var { min: a } = Math;
function o(e2, t2, n2) {
  let r2 = a(1, t2 / n2);
  return a(1, e2 + (a(1, 1 - r2) - e2) * (r2 * 0.275));
}
function s(e2) {
  return [-e2[0], -e2[1]];
}
function c(e2, t2) {
  return [e2[0] + t2[0], e2[1] + t2[1]];
}
function l(e2, t2, n2) {
  return e2[0] = t2[0] + n2[0], e2[1] = t2[1] + n2[1], e2;
}
function u(e2, t2) {
  return [e2[0] - t2[0], e2[1] - t2[1]];
}
function d(e2, t2, n2) {
  return e2[0] = t2[0] - n2[0], e2[1] = t2[1] - n2[1], e2;
}
function f(e2, t2) {
  return [e2[0] * t2, e2[1] * t2];
}
function p(e2, t2, n2) {
  return e2[0] = t2[0] * n2, e2[1] = t2[1] * n2, e2;
}
function m(e2, t2) {
  return [e2[0] / t2, e2[1] / t2];
}
function h(e2) {
  return [e2[1], -e2[0]];
}
function g(e2, t2) {
  let n2 = t2[0];
  return e2[0] = t2[1], e2[1] = -n2, e2;
}
function ee(e2, t2) {
  return e2[0] * t2[0] + e2[1] * t2[1];
}
function _(e2, t2) {
  return e2[0] === t2[0] && e2[1] === t2[1];
}
function v(e2) {
  return Math.hypot(e2[0], e2[1]);
}
function y(e2, t2) {
  let n2 = e2[0] - t2[0], r2 = e2[1] - t2[1];
  return n2 * n2 + r2 * r2;
}
function b(e2) {
  return m(e2, v(e2));
}
function x(e2, t2) {
  return Math.hypot(e2[1] - t2[1], e2[0] - t2[0]);
}
function S(e2, t2, n2) {
  let r2 = Math.sin(n2), i2 = Math.cos(n2), a2 = e2[0] - t2[0], o2 = e2[1] - t2[1], s2 = a2 * i2 - o2 * r2, c2 = a2 * r2 + o2 * i2;
  return [s2 + t2[0], c2 + t2[1]];
}
function C(e2, t2, n2, r2) {
  let i2 = Math.sin(r2), a2 = Math.cos(r2), o2 = t2[0] - n2[0], s2 = t2[1] - n2[1], c2 = o2 * a2 - s2 * i2, l2 = o2 * i2 + s2 * a2;
  return e2[0] = c2 + n2[0], e2[1] = l2 + n2[1], e2;
}
function w(e2, t2, n2) {
  return c(e2, f(u(t2, e2), n2));
}
function te(e2, t2, n2, r2) {
  let i2 = n2[0] - t2[0], a2 = n2[1] - t2[1];
  return e2[0] = t2[0] + i2 * r2, e2[1] = t2[1] + a2 * r2, e2;
}
function T(e2, t2, n2) {
  return c(e2, f(t2, n2));
}
var E = [0, 0];
var D = [0, 0];
var O = [0, 0];
function k(e2, n2) {
  let r2 = T(e2, b(h(u(e2, c(e2, [1, 1])))), -n2), i2 = [], a2 = 1 / 13;
  for (let n3 = a2; n3 <= 1; n3 += a2) i2.push(S(r2, e2, t * 2 * n3));
  return i2;
}
function A(e2, n2, r2) {
  let i2 = [], a2 = 1 / r2;
  for (let r3 = a2; r3 <= 1; r3 += a2) i2.push(S(n2, e2, t * r3));
  return i2;
}
function j(e2, t2, n2) {
  let r2 = u(t2, n2), i2 = f(r2, 0.5), a2 = f(r2, 0.51);
  return [u(e2, i2), u(e2, a2), c(e2, a2), c(e2, i2)];
}
function M(e2, n2, r2, i2) {
  let a2 = [], o2 = T(e2, n2, r2), s2 = 1 / i2;
  for (let n3 = s2; n3 < 1; n3 += s2) a2.push(S(o2, e2, t * 3 * n3));
  return a2;
}
function ne(e2, t2, n2) {
  return [c(e2, f(t2, n2)), c(e2, f(t2, n2 * 0.99)), u(e2, f(t2, n2 * 0.99)), u(e2, f(t2, n2))];
}
function N(e2, t2, n2) {
  return e2 === false || e2 === void 0 ? 0 : e2 === true ? Math.max(t2, n2) : e2;
}
function re(e2, t2, n2) {
  return e2.slice(0, 10).reduce((e3, r2) => {
    let i2 = r2.pressure;
    return t2 && (i2 = o(e3, r2.distance, n2)), (e3 + i2) / 2;
  }, e2[0].pressure);
}
function P(e2, n2 = {}) {
  let { size: r2 = 16, smoothing: a2 = 0.5, thinning: f2 = 0.5, simulatePressure: m2 = true, easing: _2 = (e3) => e3, start: v2 = {}, end: b2 = {}, last: x2 = false } = n2, { cap: S2 = true, easing: w2 = (e3) => e3 * (2 - e3) } = v2, { cap: T2 = true, easing: P2 = (e3) => --e3 * e3 * e3 + 1 } = b2;
  if (e2.length === 0 || r2 <= 0) return [];
  let F2 = e2[e2.length - 1].runningLength, I2 = N(v2.taper, r2, F2), L2 = N(b2.taper, r2, F2), R2 = (r2 * a2) ** 2, z = [], B = [], V = re(e2, m2, r2), H = i(r2, f2, e2[e2.length - 1].pressure, _2), U, W = e2[0].vector, G = e2[0].point, K = G, q = G, J = K, Y = false;
  for (let n3 = 0; n3 < e2.length; n3++) {
    let { pressure: a3 } = e2[n3], { point: s2, vector: h2, distance: v3, runningLength: b3 } = e2[n3], x3 = n3 === e2.length - 1;
    if (!x3 && F2 - b3 < 3) continue;
    f2 ? (m2 && (a3 = o(V, v3, r2)), H = i(r2, f2, a3, _2)) : H = r2 / 2, U === void 0 && (U = H);
    let S3 = b3 < I2 ? w2(b3 / I2) : 1, T3 = F2 - b3 < L2 ? P2((F2 - b3) / L2) : 1;
    H = Math.max(0.01, H * Math.min(S3, T3));
    let k2 = (x3 ? e2[n3] : e2[n3 + 1]).vector, A2 = x3 ? 1 : ee(h2, k2), j2 = ee(h2, W) < 0 && !Y, M2 = A2 !== null && A2 < 0;
    if (j2 || M2) {
      g(E, W), p(E, E, H);
      for (let e3 = 0; e3 <= 1; e3 += 0.07692307692307693) d(D, s2, E), C(D, D, s2, t * e3), q = [D[0], D[1]], z.push(q), l(O, s2, E), C(O, O, s2, t * -e3), J = [O[0], O[1]], B.push(J);
      G = q, K = J, M2 && (Y = true);
      continue;
    }
    if (Y = false, x3) {
      g(E, h2), p(E, E, H), z.push(u(s2, E)), B.push(c(s2, E));
      continue;
    }
    te(E, k2, h2, A2), g(E, E), p(E, E, H), d(D, s2, E), q = [D[0], D[1]], (n3 <= 1 || y(G, q) > R2) && (z.push(q), G = q), l(O, s2, E), J = [O[0], O[1]], (n3 <= 1 || y(K, J) > R2) && (B.push(J), K = J), V = a3, W = h2;
  }
  let X = [e2[0].point[0], e2[0].point[1]], Z = e2.length > 1 ? [e2[e2.length - 1].point[0], e2[e2.length - 1].point[1]] : c(e2[0].point, [1, 1]), Q = [], $ = [];
  if (e2.length === 1) {
    if (!(I2 || L2) || x2) return k(X, U || H);
  } else {
    I2 || L2 && e2.length === 1 || (S2 ? Q.push(...A(X, B[0], 13)) : Q.push(...j(X, z[0], B[0])));
    let t2 = h(s(e2[e2.length - 1].vector));
    L2 || I2 && e2.length === 1 ? $.push(Z) : T2 ? $.push(...M(Z, t2, H, 29)) : $.push(...ne(Z, t2, H));
  }
  return z.concat($, B.reverse(), Q);
}
var F = [0, 0];
function I(e2) {
  return e2 != null && e2 >= 0;
}
function L(e2, t2 = {}) {
  let { streamline: i2 = 0.5, size: a2 = 16, last: o2 = false } = t2;
  if (e2.length === 0) return [];
  let s2 = 0.15 + (1 - i2) * 0.85, l2 = Array.isArray(e2[0]) ? e2 : e2.map(({ x: e3, y: t3, pressure: r2 = n }) => [e3, t3, r2]);
  if (l2.length === 2) {
    let e3 = l2[1];
    l2 = l2.slice(0, -1);
    for (let t3 = 1; t3 < 5; t3++) l2.push(w(l2[0], e3, t3 / 4));
  }
  l2.length === 1 && (l2 = [...l2, [...c(l2[0], r), ...l2[0].slice(2)]]);
  let u2 = [{ point: [l2[0][0], l2[0][1]], pressure: I(l2[0][2]) ? l2[0][2] : 0.25, vector: [...r], distance: 0, runningLength: 0 }], f2 = false, p2 = 0, m2 = u2[0], h2 = l2.length - 1;
  for (let e3 = 1; e3 < l2.length; e3++) {
    let t3 = o2 && e3 === h2 ? [l2[e3][0], l2[e3][1]] : w(m2.point, l2[e3], s2);
    if (_(m2.point, t3)) continue;
    let r2 = x(t3, m2.point);
    if (p2 += r2, e3 < h2 && !f2) {
      if (p2 < a2) continue;
      f2 = true;
    }
    d(F, m2.point, t3), m2 = { point: t3, pressure: I(l2[e3][2]) ? l2[e3][2] : n, vector: b(F), distance: r2, runningLength: p2 }, u2.push(m2);
  }
  return u2[0].vector = u2[1]?.vector || [0, 0], u2;
}
function R(e2, t2 = {}) {
  return P(L(e2, t2), t2);
}

// src/util/errors.ts
var DEBUG_KEY = "pyoink-debug";
function inkLog(code, detail) {
  try {
    const on = typeof localStorage !== "undefined" && localStorage.getItem(DEBUG_KEY) === "1";
    if (on || code.startsWith("E_")) {
      console.warn(`[pyoink] code=${code}`, detail ?? "");
    }
  } catch {
  }
}
function clamp(n2, min, max) {
  if (Number.isNaN(n2) || !Number.isFinite(n2)) return min;
  return Math.min(max, Math.max(min, n2));
}

// src/engine/perfectFreehandAdapter.ts
function toPfInput(points) {
  const out = [];
  for (const p2 of points) {
    const x2 = p2[0];
    const y2 = p2[1];
    if (!Number.isFinite(x2) || !Number.isFinite(y2)) continue;
    let pr = p2[2];
    if (!Number.isFinite(pr)) pr = 0.5;
    pr = Math.min(1, Math.max(0.05, pr));
    out.push([x2, y2, pr]);
  }
  return out;
}
function buildStrokePath(points, style, settings, opts) {
  const input = toPfInput(points);
  if (input.length === 0) {
    inkLog("E_PF_EMPTY");
    return null;
  }
  if (input.length === 1) {
    const path = new Path2D();
    const r2 = Math.max(0.5, style.size * (input[0][2] ?? 0.5) * 0.5);
    path.arc(input[0][0], input[0][1], r2, 0, Math.PI * 2);
    return path;
  }
  const size = Math.max(0.5, style.size);
  try {
    const outline = R(input, {
      size,
      thinning: style.tool === "highlighter" ? 0.05 : settings.pfThinning,
      smoothing: settings.pfSmoothing,
      streamline: settings.pfStreamline,
      simulatePressure: opts.simulatePressure,
      last: opts.last
    });
    if (!outline || outline.length < 2) return null;
    const stride = outline.length > 2e4 ? Math.ceil(outline.length / 1e4) : 1;
    const path = new Path2D();
    path.moveTo(outline[0][0], outline[0][1]);
    for (let i2 = stride; i2 < outline.length; i2 += stride) {
      const pt = outline[i2];
      if (!pt || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) continue;
      path.lineTo(pt[0], pt[1]);
    }
    path.closePath();
    return path;
  } catch (e2) {
    inkLog("E_PF_THROW", e2);
    const path = new Path2D();
    path.moveTo(input[0][0], input[0][1]);
    for (let i2 = 1; i2 < input.length; i2++) path.lineTo(input[i2][0], input[i2][1]);
    return path;
  }
}
function fillStrokePath(ctx, path, style, fallbackPolyline) {
  ctx.save();
  if (style.tool === "highlighter") {
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = style.color;
    if (fallbackPolyline) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
    } else {
      ctx.fill(path);
    }
  } else {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = style.color;
    if (fallbackPolyline) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
    } else {
      ctx.fill(path);
    }
  }
  ctx.restore();
}

// src/engine/StrokeEngine.ts
var StrokeEngine = class {
  constructor(settings) {
    this.settings = settings;
    this.strokes = [];
    this.undoStack = [];
    this.redoStack = [];
    this.active = null;
    this.lastPressure = 0.5;
    this.sawRealPressure = false;
    this.erasing = false;
    this.eraseDirty = false;
    /** Snapshot index at erase start — discard if nothing removed */
    this.eraseUndoPushed = false;
  }
  setSettings(s2) {
    this.settings = s2;
  }
  getActive() {
    return this.active;
  }
  isStroking() {
    return this.active !== null || this.erasing;
  }
  canUndo() {
    return !this.isStroking() && this.undoStack.length > 0;
  }
  canRedo() {
    return !this.isStroking() && this.redoStack.length > 0;
  }
  cloneStrokes(list) {
    return list.map((s2) => ({ ...s2, points: s2.points.map((p2) => [...p2]) }));
  }
  pushUndo() {
    this.undoStack.push(this.cloneStrokes(this.strokes));
    const limit = Math.min(50, Math.max(1, this.settings.undoLimit || 50));
    while (this.undoStack.length > limit) this.undoStack.shift();
    this.redoStack = [];
  }
  beginPen(tool, color, size, pt) {
    this.pushUndo();
    this.sawRealPressure = false;
    this.lastPressure = pt[2];
    this.active = {
      id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      tool,
      color,
      size,
      points: [pt],
      ended: false
    };
  }
  normalizePressure(raw, pointerType) {
    if (!Number.isFinite(raw) || raw <= 0) {
      inkLog("E_PRESSURE_ZERO");
      return this.lastPressure > 0 ? this.lastPressure : 0.5;
    }
    const p2 = Math.min(1, Math.max(0.05, raw * this.settings.pressureGain));
    if (pointerType === "pen" && raw > 0 && raw < 1) this.sawRealPressure = true;
    this.lastPressure = p2;
    return p2;
  }
  extend(points) {
    if (!this.active) return;
    for (const ep of points) {
      if (!Number.isFinite(ep.x) || !Number.isFinite(ep.y)) continue;
      const p2 = this.normalizePressure(ep.pressure, ep.pointerType);
      this.active.points.push([ep.x, ep.y, p2, ep.t]);
      if (this.active.points.length > 5e4) break;
    }
  }
  end() {
    if (this.erasing) {
      const changed = this.eraseDirty;
      this.erasing = false;
      this.eraseDirty = false;
      if (!changed && this.eraseUndoPushed) {
        this.undoStack.pop();
      }
      this.eraseUndoPushed = false;
      return changed;
    }
    if (!this.active) return false;
    this.active.ended = true;
    if (this.active.points.length >= 1) this.strokes.push(this.active);
    this.active = null;
    return true;
  }
  cancel() {
    if (this.erasing) {
      if (this.eraseUndoPushed && this.undoStack.length) {
        this.strokes = this.undoStack.pop();
      }
      this.erasing = false;
      this.eraseDirty = false;
      this.eraseUndoPushed = false;
    }
    if (this.active) {
      if (this.undoStack.length) this.strokes = this.undoStack.pop();
      this.active = null;
    }
  }
  beginErase() {
    if (!this.erasing) {
      this.pushUndo();
      this.erasing = true;
      this.eraseDirty = false;
      this.eraseUndoPushed = true;
    }
  }
  eraseAt(x2, y2, radius) {
    if (!this.erasing) this.beginErase();
    const r2 = radius * radius;
    const keep = [];
    let removed = false;
    for (const s2 of this.strokes) {
      const hit = s2.points.some((pt) => {
        const dx = pt[0] - x2;
        const dy = pt[1] - y2;
        return dx * dx + dy * dy <= r2;
      });
      if (hit) removed = true;
      else keep.push(s2);
    }
    if (removed) {
      this.strokes = keep;
      this.eraseDirty = true;
    }
  }
  undo() {
    if (this.isStroking()) return false;
    if (!this.undoStack.length) return false;
    this.redoStack.push(this.cloneStrokes(this.strokes));
    const limit = Math.min(50, Math.max(1, this.settings.undoLimit || 50));
    while (this.redoStack.length > limit) this.redoStack.shift();
    this.strokes = this.undoStack.pop();
    return true;
  }
  redo() {
    if (this.isStroking()) return false;
    if (!this.redoStack.length) return false;
    this.undoStack.push(this.cloneStrokes(this.strokes));
    const limit = Math.min(50, Math.max(1, this.settings.undoLimit || 50));
    while (this.undoStack.length > limit) this.undoStack.shift();
    this.strokes = this.redoStack.pop();
    return true;
  }
  loadStrokes(strokes) {
    this.strokes = this.cloneStrokes(strokes);
    this.active = null;
    this.erasing = false;
    this.eraseDirty = false;
    this.eraseUndoPushed = false;
    this.undoStack = [];
    this.redoStack = [];
  }
  exportStrokes() {
    return this.cloneStrokes(this.strokes).map((s2) => ({ ...s2, ended: true }));
  }
  draw(ctx, w2, h2, cache, cacheValid) {
    ctx.clearRect(0, 0, w2, h2);
    if (cache && cacheValid) {
      ctx.drawImage(cache, 0, 0, w2, h2);
    } else {
      for (const s2 of this.strokes) this.paintStroke(ctx, s2, true);
    }
    if (this.active) this.paintStroke(ctx, this.active, false);
  }
  rebuildCache(cache, w2, h2, dpr) {
    cache.width = Math.max(1, Math.floor(w2 * dpr));
    cache.height = Math.max(1, Math.floor(h2 * dpr));
    const c2 = cache.getContext("2d");
    if (!c2) return;
    c2.setTransform(dpr, 0, 0, dpr, 0, 0);
    c2.clearRect(0, 0, w2, h2);
    for (const s2 of this.strokes) this.paintStroke(c2, s2, true);
  }
  paintStroke(ctx, s2, last) {
    const simulate = this.settings.simulatePressureFallback && (s2 === this.active ? !this.sawRealPressure : pressureMostlyFlat(s2.points));
    const path = buildStrokePath(
      s2.points,
      { tool: s2.tool, color: s2.color, size: s2.size },
      this.settings,
      { last, simulatePressure: simulate }
    );
    if (!path) return;
    fillStrokePath(ctx, path, { tool: s2.tool, color: s2.color, size: s2.size }, false);
  }
};
function pressureMostlyFlat(points) {
  if (points.length < 3) return true;
  let min = 1;
  let max = 0;
  for (const p2 of points) {
    min = Math.min(min, p2[2]);
    max = Math.max(max, p2[2]);
  }
  return max - min < 0.05;
}

// src/input/GestureRouter.ts
var GestureRouter = class {
  constructor(settings) {
    this.settings = settings;
    this.activeDrawId = null;
    this.activeDrawType = null;
    this.pointers = /* @__PURE__ */ new Map();
    this.lastPenAt = 0;
    this.penDownIds = /* @__PURE__ */ new Set();
    this.tool = "pen";
    this.navigateMode = false;
    this.fingerIds = /* @__PURE__ */ new Set();
    this.multiFingerAnchor = null;
    this.multiFingerMaxMove = 0;
    this.lastShortcutAt = 0;
    this.lastSingleTapAt = 0;
    this.lastSingleTapX = 0;
    this.lastSingleTapY = 0;
    this.downSample = null;
    this.movedPx = 0;
  }
  setTool(t2) {
    this.tool = t2;
  }
  getTool() {
    return this.tool;
  }
  getActiveDrawId() {
    return this.activeDrawId;
  }
  isDrawing() {
    return this.activeDrawId !== null;
  }
  clearActiveDraw() {
    this.activeDrawId = null;
    this.activeDrawType = null;
  }
  penOwnsSurface(s2) {
    if (this.penDownIds.size > 0) return true;
    if (this.activeDrawType === "pen") return true;
    if (performance.now() - this.lastPenAt < (s2.palmRejectMs ?? 600)) return true;
    return false;
  }
  fingerMayDraw(s2) {
    if (s2.penOnlyInk !== false) return false;
    if (!s2.allowFingerDraw) return false;
    if (this.penOwnsSurface(s2)) return false;
    return true;
  }
  onDown(ev, canvasRect) {
    this.pointers.set(ev.pointerId, ev);
    const s2 = this.settings();
    const sample = this.sampleFromEvent(ev, canvasRect);
    this.downSample = sample;
    this.movedPx = 0;
    if (ev.pointerType === "pen") {
      this.penDownIds.add(ev.pointerId);
      this.lastPenAt = performance.now();
    }
    if (ev.pointerType === "touch") {
      if (this.penOwnsSurface(s2)) {
        inkLog("E_PALM");
        return { type: "ignore" };
      }
      this.fingerIds.add(ev.pointerId);
      if (this.fingerIds.size >= 2) {
        if (this.activeDrawId !== null && this.activeDrawType === "touch") {
          const id = this.activeDrawId;
          this.clearActiveDraw();
          this.armMulti(sample, this.fingerIds.size);
          return { type: "draw-end", pointerId: id };
        }
        this.armMulti(sample, this.fingerIds.size);
        return { type: "ignore" };
      }
      if (!this.fingerMayDraw(s2)) {
        return { type: "scroll" };
      }
    }
    if (this.navigateMode && ev.pointerType !== "pen") {
      return { type: "ignore" };
    }
    if (s2.penOnlyInk !== false && ev.pointerType === "touch") {
      return { type: "scroll" };
    }
    if (this.activeDrawId !== null && ev.pointerId !== this.activeDrawId) {
      inkLog("E_PTR_SECONDARY");
      return { type: "ignore" };
    }
    if (ev.pointerType === "touch" && s2.penOnlyInk !== false) {
      return { type: "scroll" };
    }
    this.activeDrawId = ev.pointerId;
    this.activeDrawType = ev.pointerType || "mouse";
    if (this.tool === "eraser") return { type: "erase-start", pointerId: ev.pointerId };
    return { type: "draw-start", pointerId: ev.pointerId };
  }
  onMove(ev, canvasRect) {
    this.pointers.set(ev.pointerId, ev);
    const s2 = this.settings();
    const sample = this.sampleFromEvent(ev, canvasRect);
    if (ev.pointerType === "pen") {
      this.lastPenAt = performance.now();
      this.penDownIds.add(ev.pointerId);
    }
    if (this.downSample) {
      const dx = sample.x - this.downSample.x;
      const dy = sample.y - this.downSample.y;
      this.movedPx = Math.max(this.movedPx, Math.hypot(dx, dy));
    }
    if (ev.pointerType === "touch" && this.penOwnsSurface(s2)) {
      return { type: "ignore" };
    }
    if (this.fingerIds.size >= 2 && this.multiFingerAnchor) {
      this.multiFingerAnchor.count = Math.max(this.multiFingerAnchor.count, this.fingerIds.size);
      const dx = sample.x - this.multiFingerAnchor.x;
      const dy = sample.y - this.multiFingerAnchor.y;
      this.multiFingerMaxMove = Math.max(this.multiFingerMaxMove, Math.hypot(dx, dy));
      return { type: "ignore" };
    }
    if (ev.pointerType === "touch" && s2.penOnlyInk !== false) {
      return { type: "ignore" };
    }
    if (this.activeDrawId === null || ev.pointerId !== this.activeDrawId) {
      return { type: "ignore" };
    }
    if (this.activeDrawType === "touch" && s2.penOnlyInk !== false) {
      const id = this.activeDrawId;
      this.clearActiveDraw();
      return { type: "draw-end", pointerId: id };
    }
    return {
      type: "draw-move",
      pointerId: ev.pointerId,
      samples: this.collectSamples(ev, canvasRect)
    };
  }
  onUp(ev, canvasRect) {
    this.pointers.delete(ev.pointerId);
    const s2 = this.settings();
    if (ev.pointerType === "pen") {
      this.penDownIds.delete(ev.pointerId);
      this.lastPenAt = performance.now();
    }
    if (ev.pointerType === "touch") {
      this.fingerIds.delete(ev.pointerId);
      if (this.fingerIds.size === 0 && this.multiFingerAnchor) {
        const dt = performance.now() - this.multiFingerAnchor.t;
        const move = this.multiFingerMaxMove;
        const count = this.multiFingerAnchor.count;
        this.multiFingerAnchor = null;
        this.multiFingerMaxMove = 0;
        if (!this.penOwnsSurface(s2) && dt < 380 && move < 22 && performance.now() - this.lastShortcutAt > 220) {
          const action = count >= 3 ? s2.threeFingerTapAction : s2.twoFingerTapAction || (s2.enableTwoFingerToolCycle ? "cycle_tool" : "none");
          if (action && action !== "none") {
            this.lastShortcutAt = performance.now();
            return { type: "finger-action", action };
          }
        }
      }
      if (this.fingerIds.size === 0 && !this.multiFingerAnchor && this.activeDrawId === null && !this.penOwnsSurface(s2) && this.movedPx < 14) {
        const now = performance.now();
        const sample = this.sampleFromEvent(ev, canvasRect);
        if (now - this.lastSingleTapAt < 320 && Math.hypot(sample.x - this.lastSingleTapX, sample.y - this.lastSingleTapY) < 40) {
          this.lastSingleTapAt = 0;
          const action = s2.doubleTapAction;
          if (action && action !== "none" && now - this.lastShortcutAt > 220) {
            this.lastShortcutAt = now;
            return { type: "finger-action", action };
          }
        } else {
          this.lastSingleTapAt = now;
          this.lastSingleTapX = sample.x;
          this.lastSingleTapY = sample.y;
        }
      }
    }
    if (this.navigateMode && this.activeDrawId === null && ev.pointerType !== "pen" && this.movedPx < 8) {
      return { type: "navigate-click", clientX: ev.clientX, clientY: ev.clientY };
    }
    if (!this.navigateMode && this.activeDrawId === ev.pointerId && ev.pointerType === "mouse" && this.movedPx < 6 && this.tool !== "eraser") {
      return { type: "navigate-click", clientX: ev.clientX, clientY: ev.clientY };
    }
    if (this.activeDrawId === ev.pointerId) {
      this.clearActiveDraw();
      return { type: "draw-end", pointerId: ev.pointerId };
    }
    return { type: "ignore" };
  }
  onCancel(ev) {
    this.pointers.delete(ev.pointerId);
    this.fingerIds.delete(ev.pointerId);
    if (ev.pointerType === "pen") {
      this.penDownIds.delete(ev.pointerId);
      this.lastPenAt = performance.now();
    }
    if (this.activeDrawId === ev.pointerId) {
      inkLog("E_PTR_LOST");
      this.clearActiveDraw();
      return { type: "draw-end", pointerId: ev.pointerId };
    }
    return { type: "ignore" };
  }
  armMulti(sample, count) {
    this.multiFingerAnchor = {
      x: sample.x,
      y: sample.y,
      t: performance.now(),
      count
    };
    this.multiFingerMaxMove = 0;
  }
  sampleFromEvent(ev, rect) {
    return {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
      pressure: ev.pressure,
      t: ev.timeStamp || performance.now(),
      pointerType: ev.pointerType || "mouse"
    };
  }
  collectSamples(ev, rect) {
    const list = typeof ev.getCoalescedEvents === "function" ? ev.getCoalescedEvents() : [ev];
    return list.map((e2) => this.sampleFromEvent(e2, rect));
  }
};

// src/layout/LayoutSnapshot.ts
function measureLayout(contentEl, sourceMtime, sourceSize, maxCssHeight) {
  const cssWidth = Math.max(contentEl.scrollWidth, contentEl.clientWidth, 1);
  let contentHeight = Math.max(contentEl.scrollHeight, contentEl.clientHeight, 1);
  if (contentHeight > maxCssHeight) contentHeight = maxCssHeight;
  return {
    cssWidth,
    contentHeight,
    dpr: window.devicePixelRatio || 1,
    sourceMtime,
    sourceSize,
    snapshotAt: Date.now()
  };
}

// src/store/schema.ts
var PYOINK_MAGIC = "pyoink";
var PYOINK_VERSION = 1;
var MAX_FILE_BYTES = 8 * 1024 * 1024;
var MAX_POINTS_PER_STROKE = 5e4;
var MAX_STROKES = 5e3;
function emptyDoc(source) {
  const now = Date.now();
  return {
    v: 1,
    magic: PYOINK_MAGIC,
    source,
    sourcePathNorm: source,
    sourceMtime: 0,
    sourceSize: 0,
    layout: { cssWidth: 0, contentHeight: 0, dpr: 1, snapshotAt: now },
    strokes: [],
    meta: {
      createdAt: now,
      updatedAt: now,
      appId: "pyoink",
      appVersion: "0.1.0"
    }
  };
}
function isFiniteNum(n2) {
  return typeof n2 === "number" && Number.isFinite(n2);
}
function sanitizePoint(p2) {
  if (!Array.isArray(p2) || p2.length < 2) return null;
  const x2 = Number(p2[0]);
  const y2 = Number(p2[1]);
  if (!isFiniteNum(x2) || !isFiniteNum(y2)) return null;
  let pr = p2.length > 2 ? Number(p2[2]) : 0.5;
  if (!isFiniteNum(pr)) pr = 0.5;
  pr = Math.min(1, Math.max(0.05, pr));
  let t2 = p2.length > 3 ? Number(p2[3]) : 0;
  if (!isFiniteNum(t2)) t2 = 0;
  return [x2, y2, pr, t2];
}
function sanitizeStroke(raw, warnings) {
  if (!raw || typeof raw !== "object") return null;
  const o2 = raw;
  const tool = o2.tool;
  if (tool !== "pen" && tool !== "highlighter" && tool !== "eraser") {
    warnings.push("E_TOOL");
    return null;
  }
  if (tool === "eraser") return null;
  const ptsIn = o2.points;
  if (!Array.isArray(ptsIn)) {
    warnings.push("E_STROKE");
    return null;
  }
  if (ptsIn.length > MAX_POINTS_PER_STROKE) {
    warnings.push("E_LIMIT");
  }
  const points = [];
  const limit = Math.min(ptsIn.length, MAX_POINTS_PER_STROKE);
  for (let i2 = 0; i2 < limit; i2++) {
    const pt = sanitizePoint(ptsIn[i2]);
    if (pt) points.push(pt);
  }
  if (points.length === 0) {
    warnings.push("E_STROKE");
    return null;
  }
  const id = typeof o2.id === "string" && o2.id ? o2.id : `s_rec_${Math.random().toString(36).slice(2, 9)}`;
  const color = typeof o2.color === "string" ? o2.color : "#1a1a1a";
  const size = isFiniteNum(Number(o2.size)) ? Math.max(0.5, Number(o2.size)) : 2.2;
  return { id, tool, color, size, points, ended: true };
}
function parseInkJson(text, expectedSource) {
  const warnings = [];
  if (text.length > MAX_FILE_BYTES) {
    inkLog("E_LIMIT", { len: text.length });
    return { ok: false, code: "E_LIMIT", doc: emptyDoc(expectedSource), warnings: ["E_LIMIT"] };
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (e2) {
    inkLog("E_JSON", e2);
    return { ok: false, code: "E_JSON", doc: emptyDoc(expectedSource), warnings: ["E_JSON"] };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, code: "E_JSON", doc: emptyDoc(expectedSource), warnings: ["E_JSON"] };
  }
  const o2 = data;
  const magicOk = o2.magic === PYOINK_MAGIC || o2.magic === "hermes-ink" || // legacy rename
  o2.magic === "pyoink";
  if (!magicOk) {
    if (!(o2.v === 1 && Array.isArray(o2.strokes))) {
      inkLog("E_MAGIC", o2.magic);
      return { ok: false, code: "E_MAGIC", doc: emptyDoc(expectedSource), warnings: ["E_MAGIC"] };
    }
    warnings.push("E_MAGIC_LEGACY");
  } else if (o2.magic === "hermes-ink") {
    warnings.push("E_MAGIC_LEGACY");
  }
  if (typeof o2.v === "number" && o2.v > PYOINK_VERSION) {
    inkLog("E_VER", o2.v);
    return { ok: false, code: "E_VER", doc: emptyDoc(expectedSource), warnings: ["E_VER"] };
  }
  const doc = emptyDoc(expectedSource);
  doc.source = typeof o2.source === "string" ? o2.source : expectedSource;
  doc.sourcePathNorm = typeof o2.sourcePathNorm === "string" ? o2.sourcePathNorm : doc.source;
  doc.sourceMtime = isFiniteNum(Number(o2.sourceMtime)) ? Number(o2.sourceMtime) : 0;
  doc.sourceSize = isFiniteNum(Number(o2.sourceSize)) ? Number(o2.sourceSize) : 0;
  if (o2.layout && typeof o2.layout === "object") {
    const L2 = o2.layout;
    doc.layout.cssWidth = Number(L2.cssWidth) || 0;
    doc.layout.contentHeight = Number(L2.contentHeight) || 0;
    doc.layout.dpr = Number(L2.dpr) || 1;
    doc.layout.snapshotAt = Number(L2.snapshotAt) || Date.now();
  }
  if (o2.meta && typeof o2.meta === "object") {
    const M2 = o2.meta;
    doc.meta.createdAt = Number(M2.createdAt) || doc.meta.createdAt;
    doc.meta.updatedAt = Number(M2.updatedAt) || doc.meta.updatedAt;
  }
  const strokesIn = Array.isArray(o2.strokes) ? o2.strokes : [];
  if (strokesIn.length > MAX_STROKES) warnings.push("E_LIMIT");
  const strokes = [];
  for (let i2 = 0; i2 < Math.min(strokesIn.length, MAX_STROKES); i2++) {
    const s2 = sanitizeStroke(strokesIn[i2], warnings);
    if (s2) strokes.push(s2);
  }
  doc.strokes = strokes;
  if (doc.source !== expectedSource) {
    warnings.push("E_SOURCE_MISMATCH");
  }
  return { ok: true, doc, warnings };
}
function serializeInkDoc(doc) {
  doc.meta.updatedAt = Date.now();
  return JSON.stringify(doc, null, 2);
}
function encodeSourcePath(sourcePath) {
  let p2 = sourcePath.normalize("NFC").replace(/\\/g, "/");
  p2 = p2.replace(/[<>:"|?*\x00-\x1f]/g, "_");
  p2 = p2.replace(/\//g, "__");
  if (p2.length <= 180) return p2;
  let h2 = 2166136261;
  for (let i2 = 0; i2 < sourcePath.length; i2++) {
    h2 ^= sourcePath.charCodeAt(i2);
    h2 = Math.imul(h2, 16777619);
  }
  const hex = (h2 >>> 0).toString(16).padStart(8, "0");
  return `${p2.slice(0, 160)}__${hex}`;
}
function annotationRelPath(folder, sourcePath) {
  const f2 = folder.replace(/\/+$/, "");
  return `${f2}/${encodeSourcePath(sourcePath)}.pyoink.json`;
}

// src/store/InkStore.ts
var import_obsidian = require("obsidian");
var InkStore = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
    this.saving = false;
    this.pending = false;
    this.loadedMtime = 0;
  }
  pathFor(sourcePath) {
    return annotationRelPath(this.settings().annotationsFolder, sourcePath);
  }
  getLoadedMtime() {
    return this.loadedMtime;
  }
  async ensureFolder() {
    const folder = this.settings().annotationsFolder.replace(/\/+$/, "");
    const abs = this.app.vault.getAbstractFileByPath(folder);
    if (abs && !(abs instanceof import_obsidian.TFolder)) {
      inkLog("E_STORE_FOLDER", folder);
      new import_obsidian.Notice("PyoInk: annotations folder is a file \u2014 check settings");
      return false;
    }
    if (!abs) {
      try {
        await this.app.vault.createFolder(folder);
      } catch (e2) {
        const again = this.app.vault.getAbstractFileByPath(folder);
        if (!(again instanceof import_obsidian.TFolder)) {
          inkLog("E_STORE_FOLDER", e2);
          new import_obsidian.Notice("PyoInk: cannot create annotations folder");
          return false;
        }
      }
    }
    return true;
  }
  async load(sourcePath) {
    const path = this.pathFor(sourcePath);
    const legacyPath = path.replace(/\.pyoink\.json$/i, ".hink.json");
    let af = this.app.vault.getAbstractFileByPath(path);
    if (!af) af = this.app.vault.getAbstractFileByPath(legacyPath);
    if (!af || !("extension" in af)) {
      this.loadedMtime = 0;
      return { ok: true, doc: emptyDoc(sourcePath), warnings: [] };
    }
    const file = af;
    const loadedFromLegacy = file.path !== path;
    try {
      const text = await this.app.vault.read(file);
      const result = parseInkJson(text, sourcePath);
      this.loadedMtime = file.stat.mtime;
      if (result.ok === false) {
        const code = result.code;
        try {
          const bak = `${file.path}.corrupt-${Date.now()}`;
          await this.app.vault.adapter.write(bak, text);
          new import_obsidian.Notice(`PyoInk: bad ink file (backed up). Starting empty.`);
        } catch {
          new import_obsidian.Notice(`PyoInk: bad ink file (${code}). Starting empty.`);
        }
      } else if (result.warnings.includes("E_SOURCE_MISMATCH")) {
        new import_obsidian.Notice("PyoInk: ink file source path mismatch \u2014 check carefully");
      } else if (loadedFromLegacy && result.ok) {
        result.warnings.push("E_LEGACY_PATH");
      }
      return result;
    } catch (e2) {
      inkLog("E_READ", e2);
      new import_obsidian.Notice("PyoInk: failed to read ink file");
      return { ok: false, code: "E_READ", doc: emptyDoc(sourcePath), warnings: ["E_READ"] };
    }
  }
  /**
   * Atomic-ish write: tmp then rename/replace.
   * Never modifies source markdown.
   */
  async save(doc) {
    if (this.saving) {
      this.pending = true;
      return true;
    }
    this.saving = true;
    let ok = false;
    try {
      if (!await this.ensureFolder()) {
        ok = false;
      } else {
        const path = this.pathFor(doc.source);
        const body = serializeInkDoc(doc);
        const tmp = `${path}.tmp`;
        try {
          await this.app.vault.adapter.write(tmp, body);
          try {
            if (await this.app.vault.adapter.exists(path)) {
              await this.app.vault.adapter.remove(path);
            }
            await this.app.vault.adapter.write(path, body);
            try {
              await this.app.vault.adapter.remove(tmp);
            } catch {
            }
          } catch {
            await this.app.vault.adapter.write(path, body);
          }
          const af = this.app.vault.getAbstractFileByPath(path);
          if (af && "stat" in af) this.loadedMtime = af.stat.mtime;
          ok = true;
        } catch (e2) {
          inkLog("E_SAVE", e2);
          new import_obsidian.Notice("PyoInk: save failed \u2014 strokes kept in memory");
          ok = false;
          try {
            await this.app.vault.adapter.remove(tmp);
          } catch {
          }
        }
      }
    } finally {
      this.saving = false;
      if (this.pending) {
        this.pending = false;
      }
    }
    return ok;
  }
  consumePending() {
    if (!this.pending) return false;
    this.pending = false;
    return true;
  }
  isSaving() {
    return this.saving;
  }
};

// src/util/settings.ts
var FINGER_ACTION_LABELS = {
  none: "None",
  cycle_tool: "Cycle tool",
  undo: "Undo",
  redo: "Redo",
  toggle_nav: "Toggle navigate",
  pen: "Pen",
  highlighter: "Highlighter",
  eraser: "Eraser",
  exit: "Leave (save)"
};
var PEN_COLORS = [
  "#1a1a1a",
  "#e03131",
  "#1971c2",
  "#2f9e44",
  "#f08c00",
  "#9c36b5"
];
var HI_COLORS = [
  "#ffe566",
  "#ff922b",
  "#69db7c",
  "#74c0fc",
  "#f783ac"
];
var FINGER_ACTIONS = new Set(Object.keys(FINGER_ACTION_LABELS));
function asFingerAction(v2, fallback) {
  const s2 = String(v2 || "");
  return FINGER_ACTIONS.has(s2) ? s2 : fallback;
}
var DEFAULT_SETTINGS = {
  annotationsFolder: "PyoInk",
  penColor: "#1a1a1a",
  highlighterColor: "#ffe566",
  penWidth: 2.4,
  highlighterWidth: 16,
  eraserWidth: 28,
  toolCycle: ["pen", "highlighter", "eraser"],
  enableTwoFingerToolCycle: true,
  enablePencilDoubleTapProbe: false,
  penOnlyInk: true,
  allowFingerDraw: false,
  palmRejectMs: 700,
  simulatePressureFallback: true,
  pressureGain: 1.2,
  pfSmoothing: 0.5,
  pfThinning: 0.5,
  pfStreamline: 0.5,
  debounceMs: 12e3,
  maxCanvasCssHeight: 8192,
  undoLimit: 50,
  toolbarXPct: 50,
  toolbarYPct: 92,
  twoFingerTapAction: "cycle_tool",
  threeFingerTapAction: "undo",
  doubleTapAction: "toggle_nav"
};
function sanitizeSettings(raw) {
  const s2 = Object.assign({}, DEFAULT_SETTINGS, raw ?? {});
  let folder = String(s2.annotationsFolder || "PyoInk").trim().replace(/\\/g, "/");
  if (!folder || folder.includes("..") || folder.startsWith("/") || folder.includes(":")) {
    folder = DEFAULT_SETTINGS.annotationsFolder;
  }
  s2.annotationsFolder = folder.replace(/\/+$/, "");
  s2.penWidth = clamp(Number(s2.penWidth), 0.5, 40);
  s2.highlighterWidth = clamp(Number(s2.highlighterWidth), 2, 80);
  s2.eraserWidth = clamp(Number(s2.eraserWidth), 8, 120);
  s2.pressureGain = clamp(Number(s2.pressureGain), 0.3, 3);
  s2.pfSmoothing = clamp(Number(s2.pfSmoothing), 0, 0.95);
  s2.pfThinning = clamp(Number(s2.pfThinning), -0.99, 0.99);
  s2.pfStreamline = clamp(Number(s2.pfStreamline), 0, 0.99);
  s2.debounceMs = clamp(Number(s2.debounceMs), 1e3, 6e4);
  s2.maxCanvasCssHeight = clamp(Number(s2.maxCanvasCssHeight), 2048, 16384);
  s2.undoLimit = clamp(Number(s2.undoLimit), 1, 50);
  s2.palmRejectMs = clamp(Number(s2.palmRejectMs), 0, 3e3);
  s2.toolbarXPct = clamp(Number(s2.toolbarXPct), 5, 95);
  s2.toolbarYPct = clamp(Number(s2.toolbarYPct), 5, 95);
  if (s2.penOnlyInk === void 0) s2.penOnlyInk = true;
  if (s2.penOnlyInk) s2.allowFingerDraw = false;
  if (!Array.isArray(s2.toolCycle) || s2.toolCycle.length === 0) {
    s2.toolCycle = [...DEFAULT_SETTINGS.toolCycle];
  }
  s2.twoFingerTapAction = asFingerAction(s2.twoFingerTapAction, "cycle_tool");
  s2.threeFingerTapAction = asFingerAction(s2.threeFingerTapAction, "undo");
  s2.doubleTapAction = asFingerAction(s2.doubleTapAction, "toggle_nav");
  if (s2.enableTwoFingerToolCycle === false && s2.twoFingerTapAction === "cycle_tool") {
    s2.twoFingerTapAction = "none";
  }
  return s2;
}

// src/view/PyoInkView.ts
var VIEW_TYPE_PYOINK = "pyoink-view";
var PyoInkView = class extends import_obsidian2.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.file = null;
    this.state = "idle";
    this.doc = emptyDoc("");
    this.dirty = false;
    this.remoteNewer = false;
    this.cacheCanvas = null;
    this.cacheValid = false;
    this.navBtn = null;
    this.dragBound = false;
    this.cursorX = -1;
    this.cursorY = -1;
    this.cursorOn = false;
    this.undoBtn = null;
    this.redoBtn = null;
    this.saveTimer = null;
    this.raf = 0;
    this.needRedraw = false;
    this.unsubModify = null;
    this.resizeObs = null;
    this.cssW = 0;
    this.cssH = 0;
    this.scrollTouchId = null;
    this.lastScrollY = 0;
    this.lastScrollX = 0;
    this.engine = new StrokeEngine(plugin.settings);
    this.gestures = new GestureRouter(() => this.plugin.settings);
    this.store = new InkStore(this.app, () => this.plugin.settings);
  }
  getViewType() {
    return VIEW_TYPE_PYOINK;
  }
  getDisplayText() {
    return this.file ? `PyoInk: ${this.file.basename}` : "PyoInk";
  }
  getIcon() {
    return "pen-tool";
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    this.rootEl = container.createDiv({ cls: "pyoink-root" });
    this.scrollEl = this.rootEl.createDiv({ cls: "pyoink-scroll" });
    this.pageEl = this.scrollEl.createDiv({ cls: "pyoink-page" });
    this.noteEl = this.pageEl.createDiv({ cls: "pyoink-content" });
    this.canvas = this.pageEl.createEl("canvas", { cls: "pyoink-canvas" });
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2d unavailable");
    this.ctx = ctx;
    this.cacheCanvas = document.createElement("canvas");
    this.buildToolbar();
    this.bindPointer();
    this.bindKeys();
  }
  async onClose() {
    await this.flushSave();
    this.teardownWatchers();
    if (this.raf) cancelAnimationFrame(this.raf);
  }
  async openFile(file) {
    if (file.extension !== "md") {
      inkLog("E_NO_MD");
      new import_obsidian2.Notice("PyoInk: Markdown only");
      return;
    }
    await this.flushSave();
    this.teardownWatchers();
    this.state = "loading";
    this.file = file;
    this.dirty = false;
    this.remoteNewer = false;
    this.engine = new StrokeEngine(this.plugin.settings);
    this.gestures = new GestureRouter(() => this.plugin.settings);
    this.gestures.navigateMode = false;
    this.syncToolbar();
    this.noteEl.empty();
    try {
      const md = await this.app.vault.read(file);
      await import_obsidian2.MarkdownRenderer.render(this.app, md, this.noteEl, file.path, this);
      this.wireInternalLinks();
    } catch (e2) {
      inkLog("E_RENDER", e2);
      this.state = "error";
      this.noteEl.setText("(render failed)\n\n" + await this.app.vault.read(file).catch(() => ""));
      new import_obsidian2.Notice("PyoInk: markdown render failed \u2014 showing raw");
    }
    const loaded = await this.store.load(file.path);
    this.doc = loaded.doc;
    this.doc.source = file.path;
    this.doc.sourcePathNorm = file.path;
    this.doc.sourceMtime = file.stat.mtime;
    this.doc.sourceSize = file.stat.size;
    this.engine.loadStrokes(this.doc.strokes);
    this.cacheValid = false;
    await this.waitImages(2e3);
    this.resizeAndRedraw(true);
    this.watchFile(file);
    this.watchResize();
    this.state = this.state === "error" ? "error" : "ready";
    this.rootEl.focus();
  }
  wireInternalLinks() {
    this.noteEl.querySelectorAll("a.internal-link").forEach((a2) => {
      a2.addEventListener("click", (ev) => {
        ev.preventDefault();
        const href = a2.getAttribute("data-href") || a2.getAttribute("href") || "";
        if (href) {
          void this.app.workspace.openLinkText(href, this.file?.path || "", false);
        }
      });
    });
  }
  async waitImages(timeoutMs) {
    const imgs = Array.from(this.noteEl.querySelectorAll("img"));
    if (!imgs.length) return;
    await Promise.race([
      Promise.all(
        imgs.map(
          (img) => new Promise((res) => {
            if (img.complete) res();
            else {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }
          })
        )
      ),
      new Promise((r2) => setTimeout(r2, timeoutMs))
    ]);
  }
  buildToolbar() {
    this.toolbarEl = this.rootEl.createDiv({ cls: "pyoink-toolbar" });
    this.applyToolbarPos();
    const drag = this.toolbarEl.createDiv({ cls: "pyoink-tb-drag" });
    this.bindToolbarDrag(drag);
    const tools = this.toolbarEl.createDiv({ cls: "pyoink-tb-row" });
    this.iconBtn(tools, "pen", "pencil", "Pen");
    this.iconBtn(tools, "highlighter", "highlighter", "Highlighter");
    this.iconBtn(tools, "eraser", "eraser", "Eraser");
    this.navBtn = tools.createEl("button");
    this.navBtn.title = "Navigate (links)";
    (0, import_obsidian2.setIcon)(this.navBtn, "mouse-pointer-click");
    this.navBtn.onclick = () => this.setNavigate(!this.gestures.navigateMode);
    this.undoBtn = tools.createEl("button");
    this.undoBtn.title = "Undo";
    (0, import_obsidian2.setIcon)(this.undoBtn, "undo-2");
    this.undoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.undo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };
    this.redoBtn = tools.createEl("button");
    this.redoBtn.title = "Redo";
    (0, import_obsidian2.setIcon)(this.redoBtn, "redo-2");
    this.redoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.redo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };
    const exit = tools.createEl("button");
    exit.title = "Leave (save on exit)";
    (0, import_obsidian2.setIcon)(exit, "log-out");
    exit.onclick = async () => {
      const ok = await this.flushSave();
      if (!ok && this.dirty) {
        if (!confirm("PyoInk: save failed. Exit anyway?")) return;
      }
      if (this.file) await this.leaf.openFile(this.file);
    };
    this.colorRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row" });
    this.widthRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row" });
    this.rebuildColorRow();
    this.rebuildWidthRow();
    this.syncToolbar();
  }
  iconBtn(parent, tool, icon, title) {
    const b2 = parent.createEl("button");
    b2.dataset.tool = tool;
    b2.title = title;
    (0, import_obsidian2.setIcon)(b2, icon);
    b2.onclick = () => {
      this.finishStrokeIfNeeded();
      this.setTool(tool);
      this.setNavigate(false);
      this.rebuildColorRow();
      this.rebuildWidthRow();
      this.syncToolbar();
      this.updateCanvasCursor();
    };
  }
  rebuildColorRow() {
    this.colorRowEl.empty();
    const tool = this.gestures.getTool();
    if (tool === "eraser" || this.gestures.navigateMode) {
      this.colorRowEl.style.display = "none";
      return;
    }
    this.colorRowEl.style.display = "";
    const colors = tool === "highlighter" ? HI_COLORS : PEN_COLORS;
    const cur = tool === "highlighter" ? this.plugin.settings.highlighterColor : this.plugin.settings.penColor;
    for (const c2 of colors) {
      const b2 = this.colorRowEl.createEl("button", { cls: "pyoink-swatch" });
      b2.style.background = c2;
      b2.title = c2;
      if (c2.toLowerCase() === String(cur).toLowerCase()) b2.classList.add("is-active");
      b2.onclick = () => {
        this.finishStrokeIfNeeded();
        if (tool === "highlighter") this.plugin.settings.highlighterColor = c2;
        else this.plugin.settings.penColor = c2;
        void this.plugin.saveSettings();
        this.rebuildColorRow();
        this.updateCanvasCursor();
      };
    }
  }
  rebuildWidthRow() {
    this.widthRowEl.empty();
    if (this.gestures.navigateMode) {
      this.widthRowEl.style.display = "none";
      return;
    }
    this.widthRowEl.style.display = "";
    const tool = this.gestures.getTool();
    const presets = tool === "eraser" ? [["S", 16], ["M", 28], ["L", 48]] : tool === "highlighter" ? [["S", 10], ["M", 16], ["L", 28]] : [["S", 1.6], ["M", 2.4], ["L", 4.5]];
    const cur = tool === "eraser" ? this.plugin.settings.eraserWidth : tool === "highlighter" ? this.plugin.settings.highlighterWidth : this.plugin.settings.penWidth;
    for (const [label, w2] of presets) {
      const b2 = this.widthRowEl.createEl("button", { text: label, cls: "pyoink-width-btn" });
      b2.dataset.w = label;
      const dists = presets.map((p2) => Math.abs(p2[1] - cur));
      const best = dists.indexOf(Math.min(...dists));
      if (presets[best][0] === label) b2.classList.add("is-active");
      b2.onclick = () => {
        this.finishStrokeIfNeeded();
        if (tool === "eraser") this.plugin.settings.eraserWidth = w2;
        else if (tool === "highlighter") this.plugin.settings.highlighterWidth = w2;
        else this.plugin.settings.penWidth = w2;
        void this.plugin.saveSettings();
        this.rebuildWidthRow();
        this.updateCanvasCursor();
        this.requestRedraw();
      };
    }
  }
  finishStrokeIfNeeded() {
    if (!this.engine.isStroking()) return;
    const changed = this.engine.end();
    this.gestures.clearActiveDraw();
    this.state = "ready";
    this.cacheValid = false;
    if (changed) this.markDirty();
    this.requestRedraw();
    this.syncToolbar();
  }
  applyToolbarPos() {
    const x2 = this.plugin.settings.toolbarXPct ?? 50;
    const y2 = this.plugin.settings.toolbarYPct ?? 92;
    this.toolbarEl.style.left = `${x2}%`;
    this.toolbarEl.style.top = `${y2}%`;
    this.toolbarEl.style.bottom = "auto";
    this.toolbarEl.style.transform = "translate(-50%, -50%)";
  }
  bindToolbarDrag(handle) {
    let dragging = false;
    let pid = null;
    const onDown = (ev) => {
      dragging = true;
      pid = ev.pointerId;
      this.dragBound = true;
      this.toolbarEl.classList.add("is-dragging");
      handle.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      ev.stopPropagation();
    };
    const onMove = (ev) => {
      if (!dragging || ev.pointerId !== pid) return;
      const rect = this.rootEl.getBoundingClientRect();
      const x2 = (ev.clientX - rect.left) / rect.width * 100;
      const y2 = (ev.clientY - rect.top) / rect.height * 100;
      this.plugin.settings.toolbarXPct = Math.min(95, Math.max(5, x2));
      this.plugin.settings.toolbarYPct = Math.min(95, Math.max(5, y2));
      this.applyToolbarPos();
      ev.preventDefault();
    };
    const onUp = (ev) => {
      if (!dragging || ev.pointerId !== pid) return;
      dragging = false;
      pid = null;
      this.dragBound = false;
      this.toolbarEl.classList.remove("is-dragging");
      void this.plugin.saveSettings();
      try {
        handle.releasePointerCapture(ev.pointerId);
      } catch {
      }
    };
    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }
  setNavigate(on) {
    this.gestures.navigateMode = on;
    this.pageEl.classList.toggle("is-navigate", on);
    this.canvas.classList.toggle("is-pass-through", on);
    this.rebuildColorRow();
    this.rebuildWidthRow();
    this.syncToolbar();
    this.updateCanvasCursor();
  }
  setTool(t2) {
    this.gestures.setTool(t2);
    this.syncToolbar();
    this.updateCanvasCursor();
  }
  cycleTool() {
    this.finishStrokeIfNeeded();
    this.setNavigate(false);
    const order = this.plugin.settings.toolCycle;
    const cur = this.gestures.getTool();
    const i2 = order.indexOf(cur);
    this.setTool(order[(i2 + 1) % order.length]);
    this.rebuildColorRow();
    this.rebuildWidthRow();
  }
  currentBrushRadius() {
    const tool = this.gestures.getTool();
    if (tool === "eraser") return this.plugin.settings.eraserWidth / 2;
    if (tool === "highlighter") return this.plugin.settings.highlighterWidth / 2;
    return Math.max(4, this.plugin.settings.penWidth * 2);
  }
  updateCanvasCursor() {
    if (this.gestures.navigateMode) {
      this.canvas.style.cursor = "pointer";
      return;
    }
    this.canvas.style.cursor = "none";
  }
  paintCursor(ctx) {
    if (!this.cursorOn || this.gestures.navigateMode) return;
    if (this.cursorX < 0 || this.cursorY < 0) return;
    const r2 = this.currentBrushRadius();
    const tool = this.gestures.getTool();
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cursorX, this.cursorY, r2, 0, Math.PI * 2);
    if (tool === "eraser") {
      ctx.strokeStyle = "rgba(220, 50, 50, 0.95)";
      ctx.fillStyle = "rgba(220, 50, 50, 0.12)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
    } else if (tool === "highlighter") {
      ctx.strokeStyle = this.plugin.settings.highlighterColor;
      ctx.fillStyle = this.hexAlpha(this.plugin.settings.highlighterColor, 0.25);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = this.plugin.settings.penColor;
      ctx.fillStyle = this.hexAlpha(this.plugin.settings.penColor, 0.18);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
    }
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.fillStyle = tool === "eraser" ? "rgba(220,50,50,0.9)" : this.plugin.settings.penColor;
    if (tool === "highlighter") ctx.fillStyle = this.plugin.settings.highlighterColor;
    ctx.arc(this.cursorX, this.cursorY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  hexAlpha(hex, a2) {
    const h2 = hex.replace("#", "");
    if (h2.length !== 6) return `rgba(0,0,0,${a2})`;
    const r2 = parseInt(h2.slice(0, 2), 16);
    const g2 = parseInt(h2.slice(2, 4), 16);
    const b2 = parseInt(h2.slice(4, 6), 16);
    return `rgba(${r2},${g2},${b2},${a2})`;
  }
  eraserRadius() {
    return this.plugin.settings.eraserWidth || 28;
  }
  syncToolbar() {
    const t2 = this.gestures.getTool();
    this.toolbarEl.querySelectorAll("button[data-tool]").forEach((el) => {
      el.classList.toggle(
        "is-active",
        el.dataset.tool === t2 && !this.gestures.navigateMode
      );
    });
    if (this.navBtn) this.navBtn.classList.toggle("is-active", this.gestures.navigateMode);
    if (this.undoBtn) this.undoBtn.toggleAttribute("disabled", !this.engine.canUndo());
    if (this.redoBtn) this.redoBtn.toggleAttribute("disabled", !this.engine.canRedo());
  }
  bindKeys() {
    this.rootEl.tabIndex = 0;
    this.rootEl.addEventListener("keydown", (ev) => {
      if (ev.key === "t" || ev.key === "T") {
        this.cycleTool();
        ev.preventDefault();
      }
      if (ev.key === "n" || ev.key === "N") {
        this.setNavigate(!this.gestures.navigateMode);
        ev.preventDefault();
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "z") {
        this.finishStrokeIfNeeded();
        if (ev.shiftKey) {
          if (this.engine.redo()) {
            this.cacheValid = false;
            this.markDirty();
            this.requestRedraw();
            this.syncToolbar();
          }
        } else if (this.engine.undo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        ev.preventDefault();
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "y") {
        this.finishStrokeIfNeeded();
        if (this.engine.redo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        ev.preventDefault();
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "s") {
        void this.flushSave();
        ev.preventDefault();
      }
    });
  }
  bindPointer() {
    const c2 = this.canvas;
    c2.addEventListener("pointerdown", (ev) => {
      if (this.state !== "ready" && this.state !== "stroking") return;
      if (this.gestures.navigateMode && ev.pointerType !== "pen") return;
      const rect = c2.getBoundingClientRect();
      const action = this.gestures.onDown(ev, rect);
      if (action.type === "scroll" && ev.pointerType === "touch") {
        this.scrollTouchId = ev.pointerId;
        this.lastScrollY = ev.clientY;
        this.lastScrollX = ev.clientX;
        return;
      }
      this.handleGesture(action, ev, rect);
    });
    c2.addEventListener("pointermove", (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        this.scrollEl.scrollTop += this.lastScrollY - ev.clientY;
        this.scrollEl.scrollLeft += this.lastScrollX - ev.clientX;
        this.lastScrollY = ev.clientY;
        this.lastScrollX = ev.clientX;
        return;
      }
      if (this.gestures.navigateMode && ev.pointerType !== "pen" && !this.gestures.isDrawing()) return;
      const rect = c2.getBoundingClientRect();
      const action = this.gestures.onMove(ev, rect);
      this.handleGesture(action, ev, rect);
    });
    const up = (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        this.scrollTouchId = null;
        return;
      }
      const rect = c2.getBoundingClientRect();
      const action = this.gestures.onUp(ev, rect);
      this.handleGesture(action, ev, rect);
    };
    c2.addEventListener("pointerup", up);
    c2.addEventListener("pointercancel", (ev) => {
      if (this.scrollTouchId === ev.pointerId) this.scrollTouchId = null;
      const action = this.gestures.onCancel(ev);
      this.handleGesture(action, ev, c2.getBoundingClientRect());
    });
    c2.addEventListener(
      "wheel",
      (ev) => {
        this.scrollEl.scrollTop += ev.deltaY;
        this.scrollEl.scrollLeft += ev.deltaX;
        ev.preventDefault();
      },
      { passive: false }
    );
    c2.addEventListener("pointermove", (ev) => {
      const rect = c2.getBoundingClientRect();
      this.cursorX = ev.clientX - rect.left;
      this.cursorY = ev.clientY - rect.top;
      this.cursorOn = true;
      if (!this.gestures.isDrawing() && this.state === "ready") this.requestRedraw();
    }, { capture: true });
    c2.addEventListener("pointerenter", () => {
      this.cursorOn = true;
      this.updateCanvasCursor();
    });
    c2.addEventListener("pointerleave", () => {
      this.cursorOn = false;
      this.requestRedraw();
    });
    this.updateCanvasCursor();
  }
  handleGesture(action, ev, rect) {
    switch (action.type) {
      case "scroll":
      case "ignore":
        return;
      case "navigate-click": {
        const opened = this.clickThrough(action.clientX, action.clientY);
        if (opened) {
          if (this.engine.getActive() || this.engine.isStroking()) {
            this.engine.cancel();
            this.cacheValid = false;
            this.requestRedraw();
          }
          this.gestures.clearActiveDraw();
          this.state = "ready";
          try {
            this.canvas.releasePointerCapture(ev.pointerId);
          } catch {
          }
        } else if (this.gestures.isDrawing() || this.engine.getActive()) {
          this.engine.end();
          this.gestures.clearActiveDraw();
          this.state = "ready";
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          try {
            this.canvas.releasePointerCapture(ev.pointerId);
          } catch {
          }
        }
        return;
      }
      case "tool-cycle":
        this.runFingerAction("cycle_tool");
        return;
      case "finger-action":
        this.runFingerAction(action.action);
        return;
      case "draw-start":
      case "erase-start": {
        if (ev.pointerType === "touch" && this.plugin.settings.penOnlyInk !== false) {
          inkLog("E_PALM");
          return;
        }
        try {
          this.canvas.setPointerCapture(ev.pointerId);
        } catch {
          inkLog("E_PTR_NO_CAPTURE");
        }
        this.state = "stroking";
        if (this.saveTimer) {
          window.clearTimeout(this.saveTimer);
          this.saveTimer = null;
        }
        const sample = this.gestures.sampleFromEvent(ev, rect);
        if (action.type === "erase-start" || this.gestures.getTool() === "eraser") {
          this.engine.beginErase();
          this.engine.eraseAt(sample.x, sample.y, this.eraserRadius());
          this.cacheValid = false;
        } else {
          const tool = this.gestures.getTool();
          if (tool === "eraser") {
            this.engine.beginErase();
            this.engine.eraseAt(sample.x, sample.y, this.eraserRadius());
            this.cacheValid = false;
          } else {
            const color = tool === "highlighter" ? this.plugin.settings.highlighterColor : this.plugin.settings.penColor;
            const size = tool === "highlighter" ? this.plugin.settings.highlighterWidth : this.plugin.settings.penWidth;
            this.engine.beginPen(tool, color, size, [
              sample.x,
              sample.y,
              sample.pressure || 0.5,
              sample.t
            ]);
          }
        }
        this.requestRedraw();
        ev.preventDefault();
        return;
      }
      case "draw-move": {
        if (this.gestures.getTool() === "eraser" || this.engine.getActive() === null) {
          for (const s2 of action.samples) this.engine.eraseAt(s2.x, s2.y, this.eraserRadius());
          this.cacheValid = false;
        } else {
          this.engine.extend(action.samples);
        }
        this.requestRedraw();
        ev.preventDefault();
        return;
      }
      case "draw-end": {
        const changed = this.engine.end();
        this.state = "ready";
        this.cacheValid = false;
        if (changed) this.markDirty();
        this.syncToolbar();
        this.requestRedraw();
        try {
          this.canvas.releasePointerCapture(ev.pointerId);
        } catch {
        }
        if (this.remoteNewer && !this.dirty) void this.reloadFromDisk();
        return;
      }
    }
  }
  /** Click under transparent canvas onto markdown (links etc.). Returns true if a link was opened. */
  clickThrough(clientX, clientY) {
    const prev = this.canvas.style.pointerEvents;
    this.canvas.style.pointerEvents = "none";
    const el = document.elementFromPoint(clientX, clientY);
    this.canvas.style.pointerEvents = this.gestures.navigateMode ? "none" : prev || "auto";
    if (!el) return false;
    const link = el.closest("a");
    if (link) {
      const internal = link.classList.contains("internal-link");
      const href = link.getAttribute("data-href") || link.getAttribute("href") || "";
      if (internal && href) {
        void this.app.workspace.openLinkText(href, this.file?.path || "", false);
        return true;
      }
      if (href) {
        window.open(href, "_blank");
        return true;
      }
    }
    return false;
  }
  markDirty() {
    this.dirty = true;
    if (this.engine.isStroking() || this.state === "stroking") return;
    this.scheduleSave();
  }
  scheduleSave() {
    const ms = Math.max(12e3, this.plugin.settings.debounceMs || 12e3);
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      if (this.engine.isStroking() || this.state === "stroking") {
        this.scheduleSave();
        return;
      }
      void this.flushSave();
    }, ms);
  }
  async flushSave() {
    if (!this.file) return true;
    if (!this.dirty && !this.store.isSaving()) return true;
    if (this.engine.isStroking()) {
      this.engine.end();
      this.cacheValid = false;
    }
    this.state = "saving";
    const live = measureLayout(
      this.pageEl,
      this.file.stat.mtime,
      this.file.stat.size,
      this.plugin.settings.maxCanvasCssHeight
    );
    this.doc.source = this.file.path;
    this.doc.sourcePathNorm = this.file.path;
    this.doc.sourceMtime = this.file.stat.mtime;
    this.doc.sourceSize = this.file.stat.size;
    this.doc.layout = {
      cssWidth: live.cssWidth,
      contentHeight: live.contentHeight,
      dpr: live.dpr,
      snapshotAt: Date.now()
    };
    this.doc.strokes = this.engine.exportStrokes();
    this.doc.settingsEcho = { penWidth: this.plugin.settings.penWidth, pfVersion: "1.2.3" };
    if (this.remoteNewer && this.dirty) {
      new import_obsidian2.Notice("PyoInk: remote ink changed \u2014 saving local will overwrite");
    }
    const ok = await this.store.save(this.doc);
    if (ok) {
      this.dirty = false;
      this.remoteNewer = false;
    }
    if (this.store.consumePending()) return this.flushSave();
    this.state = "ready";
    return ok;
  }
  async reloadFromDisk() {
    if (!this.file || this.dirty || this.engine.isStroking()) return;
    const loaded = await this.store.load(this.file.path);
    this.doc = loaded.doc;
    this.engine.loadStrokes(this.doc.strokes);
    this.cacheValid = false;
    this.requestRedraw();
    new import_obsidian2.Notice("PyoInk: reloaded ink from disk");
  }
  watchFile(file) {
    const inkPath = this.store.pathFor(file.path);
    const ref = this.app.vault.on("modify", (f2) => {
      if (!(f2 instanceof import_obsidian2.TFile)) return;
      if (f2.path === inkPath || f2.path.endsWith(".hink.json")) {
        if (this.engine.isStroking()) {
          this.remoteNewer = true;
          return;
        }
        if (this.dirty) {
          this.remoteNewer = true;
          new import_obsidian2.Notice("PyoInk: remote/disk ink changed while dirty \u2014 save may overwrite");
          return;
        }
        if (f2.stat.mtime > this.store.getLoadedMtime()) void this.reloadFromDisk();
      }
    });
    this.unsubModify = () => this.app.vault.offref(ref);
  }
  watchResize() {
    this.resizeObs = new ResizeObserver(() => {
      this.resizeAndRedraw(false);
    });
    this.resizeObs.observe(this.pageEl);
  }
  teardownWatchers() {
    if (this.unsubModify) {
      this.unsubModify();
      this.unsubModify = null;
    }
    if (this.resizeObs) {
      this.resizeObs.disconnect();
      this.resizeObs = null;
    }
  }
  resizeAndRedraw(forceCache) {
    if (!this.file) return;
    const contentW = Math.max(this.noteEl.scrollWidth, this.noteEl.clientWidth, this.scrollEl.clientWidth, 1);
    let contentH = Math.max(this.noteEl.scrollHeight, this.noteEl.clientHeight, this.scrollEl.clientHeight, 1);
    if (contentH > this.plugin.settings.maxCanvasCssHeight) {
      contentH = this.plugin.settings.maxCanvasCssHeight;
      inkLog("E_CANVAS_MAX", contentH);
    }
    let w2 = contentW;
    let h2 = contentH;
    const dpr = window.devicePixelRatio || 1;
    if (w2 * h2 * dpr * dpr > 16e6) {
      const scale = Math.sqrt(16e6 / (w2 * h2 * dpr * dpr));
      w2 = Math.floor(w2 * scale);
      h2 = Math.floor(h2 * scale);
      inkLog("E_CANVAS_MAX", { w: w2, h: h2 });
    }
    this.cssW = w2;
    this.cssH = h2;
    this.pageEl.style.width = `${w2}px`;
    this.pageEl.style.minHeight = `${h2}px`;
    this.canvas.width = Math.max(1, Math.floor(w2 * dpr));
    this.canvas.height = Math.max(1, Math.floor(h2 * dpr));
    this.canvas.style.width = `${w2}px`;
    this.canvas.style.height = `${h2}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, w2, h2);
    if (forceCache || !this.cacheValid) {
      if (this.cacheCanvas) this.engine.rebuildCache(this.cacheCanvas, w2, h2, dpr);
      this.cacheValid = true;
    }
    this.requestRedraw();
  }
  requestRedraw() {
    this.needRedraw = true;
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      if (!this.needRedraw) return;
      this.needRedraw = false;
      this.engine.setSettings(this.plugin.settings);
      if (!this.cacheValid && this.cacheCanvas) {
        this.engine.rebuildCache(this.cacheCanvas, this.cssW, this.cssH, window.devicePixelRatio || 1);
        this.cacheValid = true;
      }
      this.ctx.clearRect(0, 0, this.cssW, this.cssH);
      this.engine.draw(this.ctx, this.cssW, this.cssH, this.cacheCanvas, this.cacheValid);
      this.paintCursor(this.ctx);
    });
  }
};

// main.ts
var PyoInkPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE_PYOINK, (leaf) => new PyoInkView(leaf, this));
    this.addCommand({
      id: "open-pyoink-current",
      name: "Open PyoInk on current note",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) void this.openInk(file);
        return true;
      }
    });
    this.addRibbonIcon("pen-tool", "PyoInk", async () => {
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== "md") {
        new import_obsidian3.Notice("Open a Markdown note first");
        return;
      }
      await this.openInk(file);
    });
    this.addSettingTab(new PyoInkSettingTab(this));
  }
  getActiveInkView() {
    for (const l2 of this.app.workspace.getLeavesOfType(VIEW_TYPE_PYOINK)) {
      if (l2.view instanceof PyoInkView) return l2.view;
    }
    return null;
  }
  async openInk(file) {
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_PYOINK, active: true });
    const view = leaf.view;
    if (view instanceof PyoInkView) await view.openFile(file);
  }
  async loadSettings() {
    this.settings = sanitizeSettings(await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var PyoInkSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(plugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PyoInk" });
    containerEl.createEl("p", {
      text: "Transparent ink on Markdown. Pen draws; finger gestures are shortcuts. Auto-save after 12s idle or on leave."
    });
    new import_obsidian3.Setting(containerEl).setName("Pen-only ink").setDesc("Only Apple Pencil draws. Finger = scroll / shortcuts.").addToggle(
      (t2) => t2.setValue(this.plugin.settings.penOnlyInk !== false).onChange(async (v2) => {
        this.plugin.settings.penOnlyInk = v2;
        if (v2) this.plugin.settings.allowFingerDraw = false;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Idle save delay (ms)").setDesc("Default 12000 (12s) with no writing. Always saves when leaving.").addSlider(
      (s2) => s2.setLimits(12e3, 3e4, 1e3).setValue(this.plugin.settings.debounceMs).setDynamicTooltip().onChange(async (v2) => {
        this.plugin.settings.debounceMs = v2;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Undo / Redo stack size").setDesc("Queue depth (max 50). Oldest dropped when full.").addSlider(
      (s2) => s2.setLimits(10, 50, 1).setValue(this.plugin.settings.undoLimit).setDynamicTooltip().onChange(async (v2) => {
        this.plugin.settings.undoLimit = v2;
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "Finger shortcuts" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Assign actions to finger taps (not pencil). Short taps only; move = scroll."
    });
    this.fingerDropdown(
      containerEl,
      "Two-finger tap",
      "twoFingerTapAction",
      this.plugin.settings.twoFingerTapAction
    );
    this.fingerDropdown(
      containerEl,
      "Three-finger tap",
      "threeFingerTapAction",
      this.plugin.settings.threeFingerTapAction
    );
    this.fingerDropdown(
      containerEl,
      "Double-tap (one finger)",
      "doubleTapAction",
      this.plugin.settings.doubleTapAction
    );
    new import_obsidian3.Setting(containerEl).setName("Annotations folder").addText(
      (t2) => t2.setValue(this.plugin.settings.annotationsFolder).onChange(async (v2) => {
        this.plugin.settings = sanitizeSettings({
          ...this.plugin.settings,
          annotationsFolder: v2
        });
        await this.plugin.saveSettings();
      })
    );
  }
  fingerDropdown(containerEl, name, key, value) {
    new import_obsidian3.Setting(containerEl).setName(name).addDropdown((d2) => {
      for (const [id, label] of Object.entries(FINGER_ACTION_LABELS)) {
        d2.addOption(id, label);
      }
      d2.setValue(value);
      d2.onChange(async (v2) => {
        this.plugin.settings[key] = v2;
        if (key === "twoFingerTapAction") {
          this.plugin.settings.enableTwoFingerToolCycle = v2 !== "none";
        }
        await this.plugin.saveSettings();
      });
    });
  }
};
