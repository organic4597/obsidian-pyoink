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
    /** Last stroke committed by end() — for incremental cache stamp. */
    this._lastFinished = null;
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
    const finished = this.active;
    this.active = null;
    this._lastFinished = finished;
    return true;
  }
  takeLastFinished() {
    const s2 = this._lastFinished;
    this._lastFinished = null;
    return s2;
  }
  cancel() {
    this._lastFinished = null;
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
  /** Append one finished stroke onto existing cache (fast path between pen lifts). */
  stampStrokeToCache(cache, stroke, w2, h2, dpr) {
    if (cache.width < 1 || cache.height < 1) {
      this.rebuildCache(cache, w2, h2, dpr);
      return;
    }
    const c2 = cache.getContext("2d");
    if (!c2) return;
    c2.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.paintStroke(c2, stroke, true);
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
    /** Pencil tip double-tap (two quick tip taps) */
    this.lastPenTapAt = 0;
    this.lastPenTapX = 0;
    this.lastPenTapY = 0;
    this.penDownAt = 0;
    this.downSample = null;
    this.movedPx = 0;
    /** Page zoom (CSS scale). Pointer samples are divided by this. */
    this.viewZoom = 1;
    this.pinch = null;
  }
  setViewZoom(z) {
    this.viewZoom = Math.max(0.01, z || 1);
  }
  getViewZoom() {
    return this.viewZoom;
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
  /**
   * Clear in-flight pointer / palm state when switching tools or navigate mode.
   * Prevents "nav → pen but ink dead" after stale penDownIds / activeDraw.
   */
  resetTransient() {
    this.activeDrawId = null;
    this.activeDrawType = null;
    this.pointers.clear();
    this.penDownIds.clear();
    this.fingerIds.clear();
    this.multiFingerAnchor = null;
    this.multiFingerMaxMove = 0;
    this.downSample = null;
    this.movedPx = 0;
    this.pinch = null;
  }
  /**
   * Pencil contact preempts all touch pan/pinch state.
   * Fixes: after finger scroll, pen ink stops (stuck activeDrawId / fingerIds / capture).
   */
  preemptForPen(pointerId) {
    this.fingerIds.clear();
    this.multiFingerAnchor = null;
    this.multiFingerMaxMove = 0;
    this.pinch = null;
    Array.from(this.pointers.entries()).forEach(([id, pev]) => {
      if (id === pointerId) return;
      if (pev.pointerType === "pen") return;
      this.pointers.delete(id);
    });
    if (this.activeDrawId !== null && this.activeDrawId !== pointerId) {
      inkLog("E_PTR_SECONDARY", "preempt_for_pen_clear");
      this.clearActiveDraw();
    }
    Array.from(this.penDownIds).forEach((id) => {
      if (id !== pointerId) this.penDownIds.delete(id);
    });
    this.penDownIds.add(pointerId);
    this.lastPenAt = performance.now();
    this.penDownAt = performance.now();
  }
  /**
   * Drop one pointer without side-effect shortcuts (scroll pan end, lost capture).
   * Fixes freeze where fingerIds never cleared after scroll-only gestures.
   */
  releasePointer(pointerId, pointerType) {
    this.pointers.delete(pointerId);
    this.fingerIds.delete(pointerId);
    if (pointerType === "pen" || this.penDownIds.has(pointerId)) {
      this.penDownIds.delete(pointerId);
    }
    if (this.activeDrawId === pointerId) {
      this.clearActiveDraw();
    }
    if (this.fingerIds.size === 0) {
      this.multiFingerAnchor = null;
      this.multiFingerMaxMove = 0;
      this.pinch = null;
    }
  }
  /** Hover / barrel proximity: buttons===0 and no contact pressure. */
  isPenHover(ev) {
    if (ev.pointerType !== "pen" && ev.pointerType !== "mouse") return false;
    if (ev.buttons !== 0) return false;
    const p2 = typeof ev.pressure === "number" ? ev.pressure : 0;
    return p2 <= 0;
  }
  /** True while a pen tip is physically down (block palm). */
  penTipDown() {
    return this.penDownIds.size > 0;
  }
  /** Palm guard for ink — includes short post-pen window. */
  penOwnsSurface(s2) {
    if (this.penTipDown()) return true;
    if (performance.now() - this.lastPenAt < (s2.palmRejectMs ?? 600)) return true;
    return false;
  }
  fingerMayDraw(s2) {
    if (s2.strictPenTouchSeparate !== false) return false;
    if (s2.penOnlyInk !== false) return false;
    if (!s2.allowFingerDraw) return false;
    if (this.penOwnsSurface(s2)) return false;
    return true;
  }
  /** Touch may only pan/zoom/gestures when strict (or pen-only). */
  touchIsUiOnly(s2) {
    if (s2.strictPenTouchSeparate !== false) return true;
    if (s2.penOnlyInk !== false) return true;
    return !s2.allowFingerDraw;
  }
  onDown(ev, canvasRect) {
    if (this.fingerIds.size > 0 && this.pointers.size === 0) {
      this.fingerIds.clear();
      this.multiFingerAnchor = null;
      this.multiFingerMaxMove = 0;
      this.pinch = null;
    }
    this.pointers.set(ev.pointerId, ev);
    const s2 = this.settings();
    const sample = this.sampleFromEvent(ev, canvasRect);
    this.downSample = sample;
    this.movedPx = 0;
    if (ev.pointerType === "pen") {
      const contacting = ev.buttons > 0;
      if (contacting) {
        this.penDownIds.clear();
        this.penDownIds.add(ev.pointerId);
        if (this.activeDrawId !== null && this.activeDrawId !== ev.pointerId) {
          this.clearActiveDraw();
        }
        this.fingerIds.clear();
        this.multiFingerAnchor = null;
        this.multiFingerMaxMove = 0;
        this.pinch = null;
      } else {
        this.penDownIds.delete(ev.pointerId);
      }
      this.lastPenAt = performance.now();
      this.penDownAt = performance.now();
    }
    if (ev.pointerType === "touch") {
      if (this.penTipDown()) {
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
        const pinch = this.beginPinchIfPossible(s2);
        if (pinch) return pinch;
        return { type: "ignore" };
      }
      if (!this.fingerMayDraw(s2) || this.touchIsUiOnly(s2)) {
        return { type: "scroll" };
      }
    }
    if (this.navigateMode && ev.pointerType !== "pen") {
      return { type: "ignore" };
    }
    if (this.touchIsUiOnly(s2) && ev.pointerType === "touch") {
      return { type: "scroll" };
    }
    if (this.activeDrawId !== null && ev.pointerId !== this.activeDrawId) {
      if (ev.pointerType === "pen") {
        inkLog("E_PTR_SECONDARY", "pen_force_takeover");
        this.clearActiveDraw();
      } else {
        inkLog("E_PTR_SECONDARY");
        return { type: "ignore" };
      }
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
      if (ev.buttons > 0) {
        this.penDownIds.add(ev.pointerId);
      } else {
        this.penDownIds.delete(ev.pointerId);
      }
    }
    if (this.downSample) {
      const dx = sample.x - this.downSample.x;
      const dy = sample.y - this.downSample.y;
      this.movedPx = Math.max(this.movedPx, Math.hypot(dx, dy));
    }
    if (ev.pointerType === "touch" && this.penTipDown()) {
      return { type: "ignore" };
    }
    if (this.fingerIds.size >= 2) {
      if (this.multiFingerAnchor) {
        this.multiFingerAnchor.count = Math.max(this.multiFingerAnchor.count, this.fingerIds.size);
        const dx = sample.x - this.multiFingerAnchor.x;
        const dy = sample.y - this.multiFingerAnchor.y;
        this.multiFingerMaxMove = Math.max(this.multiFingerMaxMove, Math.hypot(dx, dy));
      }
      if (s2.enablePinchZoom !== false) {
        const pinch = this.pinchMove(s2);
        if (pinch) return pinch;
      }
      return { type: "ignore" };
    }
    if (ev.pointerType === "touch" && this.touchIsUiOnly(s2)) {
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
      const sPen = s2;
      const wasDrawing = this.activeDrawId === ev.pointerId;
      const holdMs = performance.now() - (this.penDownAt || performance.now());
      const sample = this.sampleFromEvent(ev, canvasRect);
      const tipTap = this.movedPx < 12 && holdMs < 200;
      if (tipTap && wasDrawing && performance.now() - this.lastShortcutAt > 200) {
        const now = performance.now();
        if (sPen.enablePencilDoubleTap !== false && now - this.lastPenTapAt < 380 && Math.hypot(sample.x - this.lastPenTapX, sample.y - this.lastPenTapY) < 40) {
          this.lastPenTapAt = 0;
          this.lastShortcutAt = now;
          this.clearActiveDraw();
          const action = sPen.pencilDoubleTapAction && sPen.pencilDoubleTapAction !== "none" ? sPen.pencilDoubleTapAction : "cycle_tool";
          return {
            type: "pen-double-tap",
            action,
            pointerId: ev.pointerId
          };
        }
        this.lastPenTapAt = now;
        this.lastPenTapX = sample.x;
        this.lastPenTapY = sample.y;
        const single = sPen.pencilSingleTapAction || "ink";
        if (single !== "ink") {
          this.lastShortcutAt = now;
          this.clearActiveDraw();
          if (single === "none") {
            return { type: "pen-single-tap", action: "none", pointerId: ev.pointerId };
          }
          return {
            type: "pen-single-tap",
            action: single,
            pointerId: ev.pointerId
          };
        }
      } else if (wasDrawing) {
        this.lastPenTapAt = 0;
      }
    }
    if (ev.pointerType === "touch") {
      this.fingerIds.delete(ev.pointerId);
      if (this.pinch && this.fingerIds.size < 2) {
        this.pinch = null;
        if (this.fingerIds.size === 0 && this.multiFingerAnchor) {
        } else if (this.fingerIds.size === 1) {
          return { type: "pinch-end" };
        } else {
          return { type: "pinch-end" };
        }
      }
      if (this.fingerIds.size === 0 && this.multiFingerAnchor) {
        const dt = performance.now() - this.multiFingerAnchor.t;
        const move = this.multiFingerMaxMove;
        const count = this.multiFingerAnchor.count;
        this.multiFingerAnchor = null;
        this.multiFingerMaxMove = 0;
        this.pinch = null;
        if (!this.penOwnsSurface(s2) && dt < 380 && move < 22 && performance.now() - this.lastShortcutAt > 220) {
          const action = count >= 3 ? s2.threeFingerTapAction : s2.twoFingerTapAction || (s2.enableTwoFingerToolCycle ? "cycle_tool" : "none");
          if (action && action !== "none") {
            this.lastShortcutAt = performance.now();
            return { type: "finger-action", action };
          }
        }
        return { type: "pinch-end" };
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
    const z = this.viewZoom || 1;
    return {
      // Divide by zoom: getBoundingClientRect is visual (scaled); ink is content space
      x: (ev.clientX - rect.left) / z,
      y: (ev.clientY - rect.top) / z,
      pressure: ev.pressure,
      t: ev.timeStamp || performance.now(),
      pointerType: ev.pointerType || "mouse"
    };
  }
  collectSamples(ev, rect) {
    const list = typeof ev.getCoalescedEvents === "function" ? ev.getCoalescedEvents() : [ev];
    return list.map((e2) => this.sampleFromEvent(e2, rect));
  }
  touchPair() {
    if (this.fingerIds.size < 2) return null;
    const ids = Array.from(this.fingerIds);
    const a2 = this.pointers.get(ids[0]);
    const b2 = this.pointers.get(ids[1]);
    if (!a2 || !b2) return null;
    return { a: a2, b: b2 };
  }
  beginPinchIfPossible(s2) {
    if (s2.enablePinchZoom === false) return null;
    const pair = this.touchPair();
    if (!pair) return null;
    const dist = Math.hypot(pair.a.clientX - pair.b.clientX, pair.a.clientY - pair.b.clientY);
    if (dist < 8) return null;
    const ids = Array.from(this.fingerIds);
    this.pinch = {
      idA: ids[0],
      idB: ids[1],
      startDist: dist,
      startZoom: this.viewZoom
    };
    return {
      type: "pinch",
      scale: this.viewZoom,
      centerClientX: (pair.a.clientX + pair.b.clientX) / 2,
      centerClientY: (pair.a.clientY + pair.b.clientY) / 2
    };
  }
  pinchMove(s2) {
    if (s2.enablePinchZoom === false) return null;
    const pair = this.touchPair();
    if (!pair) return null;
    const dist = Math.hypot(pair.a.clientX - pair.b.clientX, pair.a.clientY - pair.b.clientY);
    if (dist < 8) return null;
    if (!this.pinch) {
      const ids = Array.from(this.fingerIds);
      this.pinch = {
        idA: ids[0],
        idB: ids[1],
        startDist: dist,
        startZoom: this.viewZoom
      };
    }
    const factor = dist / Math.max(1, this.pinch.startDist);
    const next = this.pinch.startZoom * factor;
    this.multiFingerMaxMove = Math.max(this.multiFingerMaxMove, Math.abs(dist - this.pinch.startDist));
    return {
      type: "pinch",
      scale: next,
      centerClientX: (pair.a.clientX + pair.b.clientX) / 2,
      centerClientY: (pair.a.clientY + pair.b.clientY) / 2
    };
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
  none: "None (no shortcut)",
  cycle_tool: "Cycle tool (pen \u2192 marker \u2192 eraser)",
  undo: "Undo",
  redo: "Redo",
  toggle_nav: "Toggle navigate mode",
  pen: "Switch to pen",
  highlighter: "Switch to highlighter",
  eraser: "Switch to eraser",
  exit: "Leave ink view (save)"
};
var PENCIL_SINGLE_TAP_LABELS = {
  ink: "Draw / write (default)",
  none: "Ignore short tap (no mark)",
  cycle_tool: "Cycle tool",
  undo: "Undo",
  redo: "Redo",
  toggle_nav: "Toggle navigate mode",
  pen: "Switch to pen",
  highlighter: "Switch to highlighter",
  eraser: "Switch to eraser",
  exit: "Leave ink view (save)"
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
var WIDTH_STEPS = {
  pen: [1, 1.6, 2.2, 3, 4, 5.5, 8],
  highlighter: [8, 12, 16, 20, 26, 34, 44],
  eraser: [12, 18, 24, 32, 42, 56, 72]
};
function nearestWidthStep(tool, cur) {
  const steps = WIDTH_STEPS[tool];
  let best = 0;
  let bestD = Infinity;
  for (let i2 = 0; i2 < steps.length; i2++) {
    const d2 = Math.abs(steps[i2] - cur);
    if (d2 < bestD) {
      bestD = d2;
      best = i2;
    }
  }
  return best;
}
function snapWidth(tool, cur) {
  const steps = WIDTH_STEPS[tool];
  return steps[nearestWidthStep(tool, cur)];
}
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
  enablePencilDoubleTap: false,
  pencilDoubleTapAction: "cycle_tool",
  pencilSingleTapAction: "ink",
  penOnlyInk: true,
  allowFingerDraw: false,
  strictPenTouchSeparate: true,
  enablePinchZoom: true,
  minZoom: 0.5,
  maxZoom: 3,
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
  s2.penWidth = snapWidth("pen", clamp(Number(s2.penWidth), 0.5, 40));
  s2.highlighterWidth = snapWidth(
    "highlighter",
    clamp(Number(s2.highlighterWidth), 2, 80)
  );
  s2.eraserWidth = snapWidth("eraser", clamp(Number(s2.eraserWidth), 8, 120));
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
  if (s2.strictPenTouchSeparate === void 0) s2.strictPenTouchSeparate = true;
  if (s2.enablePinchZoom === void 0) s2.enablePinchZoom = true;
  s2.minZoom = clamp(Number(s2.minZoom ?? 0.5), 0.25, 1);
  s2.maxZoom = clamp(Number(s2.maxZoom ?? 3), 1, 5);
  if (s2.minZoom > s2.maxZoom) {
    const t2 = s2.minZoom;
    s2.minZoom = s2.maxZoom;
    s2.maxZoom = t2;
  }
  if (s2.strictPenTouchSeparate) {
    s2.penOnlyInk = true;
    s2.allowFingerDraw = false;
  }
  if (s2.penOnlyInk) s2.allowFingerDraw = false;
  if (!Array.isArray(s2.toolCycle) || s2.toolCycle.length === 0) {
    s2.toolCycle = [...DEFAULT_SETTINGS.toolCycle];
  }
  s2.twoFingerTapAction = asFingerAction(s2.twoFingerTapAction, "cycle_tool");
  s2.threeFingerTapAction = asFingerAction(s2.threeFingerTapAction, "undo");
  s2.doubleTapAction = asFingerAction(s2.doubleTapAction, "toggle_nav");
  if (s2.enablePencilDoubleTap === void 0 && s2.enablePencilDoubleTapProbe !== void 0) {
    s2.enablePencilDoubleTap = !!s2.enablePencilDoubleTapProbe;
  }
  if (s2.enablePencilDoubleTap === void 0) s2.enablePencilDoubleTap = false;
  s2.pencilDoubleTapAction = asFingerAction(
    s2.pencilDoubleTapAction,
    "cycle_tool"
  );
  {
    const raw2 = String(s2.pencilSingleTapAction || "ink");
    if (raw2 === "ink" || FINGER_ACTIONS.has(raw2)) {
      s2.pencilSingleTapAction = raw2;
    } else {
      s2.pencilSingleTapAction = "ink";
    }
  }
  if (s2.enableTwoFingerToolCycle === false && s2.twoFingerTapAction === "cycle_tool") {
    s2.twoFingerTapAction = "none";
  }
  return s2;
}

// src/view/PyoInkView.ts
var TOOLBAR_SVG = {
  pen: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  highlighter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`,
  eraser: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`,
  nav: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 3L3 13"/></svg>`,
  redo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3L21 13"/></svg>`,
  exit: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`
};
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
    this.propsToggleBtn = null;
    this.propsCollapsed = false;
    this.dragBound = false;
    this.cursorX = -1;
    this.cursorY = -1;
    this.cursorOn = false;
    /** Apple Pencil / pen hover pressure (0 when unknown). */
    this.cursorPressure = 0.5;
    this.undoBtn = null;
    this.redoBtn = null;
    /** Content zoom (1 = 100%). Touch pinch / ctrl-wheel. */
    this.viewZoom = 1;
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
    /** Finger pan velocity (px/ms) for fling inertia */
    this.scrollVelX = 0;
    this.scrollVelY = 0;
    this.scrollLastT = 0;
    this.flingRaf = 0;
    this.panRaf = 0;
    this.panPendingX = 0;
    this.panPendingY = 0;
    this.rgbPanelOpen = false;
    this.rgbPanelEl = null;
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
    this.zoomPadEl = this.scrollEl.createDiv({ cls: "pyoink-zoom-pad" });
    this.pageEl = this.zoomPadEl.createDiv({ cls: "pyoink-page" });
    this.noteEl = this.pageEl.createDiv({ cls: "pyoink-content" });
    this.canvas = this.pageEl.createEl("canvas", { cls: "pyoink-canvas" });
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2d unavailable");
    this.ctx = ctx;
    this.cacheCanvas = document.createElement("canvas");
    this.viewZoom = 1;
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
    this.viewZoom = 1;
    this.gestures.setViewZoom(1);
    this.applyPageZoom();
    this.syncToolbar();
    this.noteEl.empty();
    try {
      const md = await this.app.vault.read(file);
      await this.renderReadingView(md, file);
    } catch (e2) {
      inkLog("E_RENDER", e2);
      this.state = "error";
      this.noteEl.setText("(render failed)");
      new import_obsidian2.Notice("PyoInk: markdown render failed");
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
  /**
   * Render note like Obsidian Reading View so core/theme CSS applies
   * (headings, lists, callouts, embeds, readable line width, etc.).
   */
  async renderReadingView(md, file) {
    this.noteEl.empty();
    this.noteEl.removeClass("pyoink-content-source");
    this.noteEl.addClasses([
      "markdown-preview-view",
      "markdown-rendered",
      "node-insert-event",
      "is-readable-line-width",
      "allow-fold-headings",
      "allow-fold-lists"
    ]);
    const sizer = this.noteEl.createDiv({
      cls: "markdown-preview-sizer markdown-preview-section"
    });
    sizer.createDiv({
      cls: "markdown-preview-pusher",
      attr: { style: "width: 1px; height: 0.1px; margin-bottom: 0;" }
    });
    await import_obsidian2.MarkdownRenderer.render(this.app, md, sizer, file.path, this);
    this.wireInternalLinks();
  }
  wireInternalLinks() {
    this.noteEl.querySelectorAll("a.internal-link").forEach((a2) => {
      a2.addEventListener("click", (ev) => {
        if (!this.gestures.navigateMode) return;
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
    if (this.plugin.settings.toolbarYPct == null || this.plugin.settings.toolbarYPct > 96) {
      this.plugin.settings.toolbarYPct = 90;
    }
    if (this.plugin.settings.toolbarXPct == null) {
      this.plugin.settings.toolbarXPct = 50;
    }
    const drag = this.toolbarEl.createDiv({ cls: "pyoink-tb-drag" });
    this.bindToolbarDrag(drag);
    const tools = this.toolbarEl.createDiv({ cls: "pyoink-tb-row pyoink-tb-tools" });
    this.iconBtn(tools, "pen", "pen", "Pen");
    this.iconBtn(tools, "highlighter", "highlighter", "Highlighter");
    this.iconBtn(tools, "eraser", "eraser", "Eraser");
    this.navBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.navBtn.title = "Navigate (links)";
    this.setSvgIcon(this.navBtn, "nav");
    this.navBtn.onclick = () => this.setNavigate(!this.gestures.navigateMode);
    const sep = tools.createSpan({ cls: "pyoink-tb-sep" });
    sep.setAttr("aria-hidden", "true");
    this.undoBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.undoBtn.title = "Undo";
    this.setSvgIcon(this.undoBtn, "undo");
    this.undoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.undo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };
    this.redoBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.redoBtn.title = "Redo";
    this.setSvgIcon(this.redoBtn, "redo");
    this.redoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.redo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };
    const zOut = tools.createEl("button", { cls: "pyoink-tb-icon", text: "\u2212" });
    zOut.title = "Zoom out";
    zOut.onclick = () => this.bumpZoom(1 / 1.15);
    const zReset = tools.createEl("button", { cls: "pyoink-tb-icon", text: "1\xD7" });
    zReset.title = "Reset zoom";
    zReset.onclick = () => this.setZoom(1);
    const zIn = tools.createEl("button", { cls: "pyoink-tb-icon", text: "+" });
    zIn.title = "Zoom in";
    zIn.onclick = () => this.bumpZoom(1.15);
    const exit = tools.createEl("button", { cls: "pyoink-tb-icon" });
    exit.title = "Leave (save on exit)";
    this.setSvgIcon(exit, "exit");
    exit.onclick = async () => {
      const ok = await this.flushSave();
      if (!ok && this.dirty) {
        if (!confirm("PyoInk: save failed. Exit anyway?")) return;
      }
      if (this.file) await this.leaf.openFile(this.file);
    };
    this.propsEl = this.rootEl.createDiv({ cls: "pyoink-props" });
    this.propsToggleBtn = this.propsEl.createEl("button", {
      cls: "pyoink-props-toggle",
      attr: { title: "Style panel", "aria-label": "Toggle style panel" }
    });
    this.propsToggleBtn.textContent = "\u2039";
    this.propsToggleBtn.onclick = (ev) => {
      ev.preventDefault();
      this.propsCollapsed = !this.propsCollapsed;
      this.syncPropsChrome();
    };
    this.propsBodyEl = this.propsEl.createDiv({ cls: "pyoink-props-body" });
    this.propsBodyEl.createDiv({
      cls: "pyoink-props-title",
      text: "Style"
    });
    this.colorRowEl = this.propsBodyEl.createDiv({
      cls: "pyoink-tb-row pyoink-color-row"
    });
    this.rgbRowEl = this.propsBodyEl.createDiv({
      cls: "pyoink-tb-row pyoink-rgb-row"
    });
    this.widthRowEl = this.propsBodyEl.createDiv({
      cls: "pyoink-tb-row pyoink-width-row"
    });
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.syncToolbar();
    this.syncPropsChrome();
    this.applyToolbarPos();
  }
  syncPropsChrome() {
    if (!this.propsEl) return;
    const tool = this.gestures.getTool();
    const hideForNav = this.gestures.navigateMode;
    this.propsEl.style.display = hideForNav ? "none" : "";
    this.propsEl.classList.toggle("is-collapsed", this.propsCollapsed);
    if (this.propsToggleBtn) {
      this.propsToggleBtn.textContent = this.propsCollapsed ? "\u203A" : "\u2039";
      this.propsToggleBtn.title = this.propsCollapsed ? "Show style panel" : "Hide style panel";
    }
    if (this.colorRowEl) {
      this.colorRowEl.style.display = tool === "eraser" || this.propsCollapsed ? "none" : "";
    }
    if (this.rgbRowEl && this.propsCollapsed) {
      this.rgbRowEl.style.display = "none";
    }
  }
  setSvgIcon(el, key) {
    el.empty();
    el.addClass("pyoink-tb-icon");
    const wrap = el.createSpan({ cls: "pyoink-icon" });
    wrap.innerHTML = TOOLBAR_SVG[key] || TOOLBAR_SVG.pen;
  }
  iconBtn(parent, tool, iconKey, title) {
    const b2 = parent.createEl("button", { cls: "pyoink-tb-icon" });
    b2.dataset.tool = tool;
    b2.title = title;
    this.setSvgIcon(b2, iconKey);
    b2.onclick = () => {
      this.finishStrokeIfNeeded();
      this.setTool(tool);
      this.setNavigate(false);
      this.rebuildColorRow();
      this.rebuildRgbRow();
      this.rebuildWidthRow();
      this.syncToolbar();
      this.updateCanvasCursor();
      this.requestRedraw();
    };
  }
  currentToolColor() {
    const tool = this.gestures.getTool();
    if (tool === "highlighter") return this.plugin.settings.highlighterColor;
    return this.plugin.settings.penColor;
  }
  /** @param fromRgb when true, do not rebuild RGB row (sliders are mid-drag). */
  setToolColor(hex, fromRgb = false) {
    const h2 = this.normalizeHex(hex);
    if (!h2) return;
    const tool = this.gestures.getTool();
    if (tool === "highlighter") this.plugin.settings.highlighterColor = h2;
    else this.plugin.settings.penColor = h2;
    void this.plugin.saveSettings();
    this.rebuildColorRow();
    if (!fromRgb) this.rebuildRgbRow();
    this.updateCanvasCursor();
    this.requestRedraw();
  }
  normalizeHex(raw) {
    let s2 = String(raw || "").trim();
    if (!s2.startsWith("#")) s2 = "#" + s2;
    if (/^#[0-9a-fA-F]{6}$/.test(s2)) return s2.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(s2)) {
      const r2 = s2[1], g2 = s2[2], b2 = s2[3];
      return `#${r2}${r2}${g2}${g2}${b2}${b2}`.toLowerCase();
    }
    return null;
  }
  hexToRgb(hex) {
    const h2 = this.normalizeHex(hex) || "#1a1a1a";
    return {
      r: parseInt(h2.slice(1, 3), 16),
      g: parseInt(h2.slice(3, 5), 16),
      b: parseInt(h2.slice(5, 7), 16)
    };
  }
  rgbToHex(r2, g2, b2) {
    const c2 = (n2) => Math.max(0, Math.min(255, Math.round(n2))).toString(16).padStart(2, "0");
    return `#${c2(r2)}${c2(g2)}${c2(b2)}`;
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
    const cur = this.currentToolColor().toLowerCase();
    for (const c2 of colors) {
      const b2 = this.colorRowEl.createEl("button", { cls: "pyoink-swatch" });
      b2.style.background = c2;
      b2.title = c2;
      const active = c2.toLowerCase() === cur;
      if (active) {
        b2.classList.add("is-active");
        const mark = b2.createSpan({ cls: "pyoink-swatch-check" });
        mark.innerHTML = TOOLBAR_SVG.check;
      }
      b2.onclick = () => {
        this.finishStrokeIfNeeded();
        this.setToolColor(c2);
      };
    }
  }
  rebuildRgbRow() {
    this.rgbRowEl.empty();
    this.rgbPanelEl = null;
    const tool = this.gestures.getTool();
    if (tool === "eraser" || this.gestures.navigateMode) {
      this.rgbRowEl.style.display = "none";
      this.rgbPanelOpen = false;
      return;
    }
    this.rgbRowEl.style.display = "";
    this.rgbRowEl.addClass("pyoink-rgb-row");
    const cur = this.currentToolColor();
    const preview = this.rgbRowEl.createEl("button", {
      cls: "pyoink-swatch pyoink-rgb-current",
      attr: { title: cur }
    });
    preview.style.background = cur;
    const toggle = this.rgbRowEl.createEl("button", {
      cls: "pyoink-tb-icon pyoink-rgb-toggle",
      attr: { title: "Color palette" }
    });
    toggle.textContent = "\u{1F3A8}";
    toggle.classList.toggle("is-active", this.rgbPanelOpen);
    toggle.onclick = (ev) => {
      ev.preventDefault();
      this.rgbPanelOpen = !this.rgbPanelOpen;
      this.rebuildRgbRow();
    };
    const nativeWrap = this.rgbRowEl.createEl("label", {
      cls: "pyoink-rgb-native-wrap",
      attr: { title: "Custom RGB" }
    });
    const native = nativeWrap.createEl("input", {
      type: "color",
      cls: "pyoink-rgb-native"
    });
    native.value = this.normalizeHex(cur) || "#1a1a1a";
    native.oninput = () => {
      this.finishStrokeIfNeeded();
      this.setToolColor(native.value, true);
      preview.style.background = native.value;
      this.paintPaletteActive(native.value);
    };
    if (!this.rgbPanelOpen) return;
    const panel = this.rgbRowEl.createDiv({ cls: "pyoink-rgb-panel" });
    this.rgbPanelEl = panel;
    panel.createDiv({
      cls: "pyoink-rgb-panel-title",
      text: "Pick a color"
    });
    const grid = panel.createDiv({ cls: "pyoink-rgb-grid" });
    for (const hex of this.buildCirclePalette()) {
      const b2 = grid.createEl("button", {
        cls: "pyoink-swatch pyoink-rgb-circle",
        attr: { title: hex, "data-hex": hex }
      });
      b2.style.background = hex;
      if (hex.toLowerCase() === cur.toLowerCase()) {
        b2.classList.add("is-active");
        const mark = b2.createSpan({ cls: "pyoink-swatch-check" });
        mark.innerHTML = TOOLBAR_SVG.check;
      }
      b2.onclick = () => {
        this.finishStrokeIfNeeded();
        this.setToolColor(hex, true);
        preview.style.background = hex;
        native.value = this.normalizeHex(hex) || hex;
        this.paintPaletteActive(hex);
      };
    }
    requestAnimationFrame(() => this.applyToolbarPos());
  }
  paintPaletteActive(hex) {
    const h2 = (this.normalizeHex(hex) || hex).toLowerCase();
    const root = this.rgbPanelEl || this.rgbRowEl;
    root.querySelectorAll("button.pyoink-rgb-circle").forEach((el) => {
      const b2 = el;
      const active = (b2.dataset.hex || "").toLowerCase() === h2;
      b2.classList.toggle("is-active", active);
      const existing = b2.querySelector(".pyoink-swatch-check");
      if (active && !existing) {
        const mark = b2.createSpan({ cls: "pyoink-swatch-check" });
        mark.innerHTML = TOOLBAR_SVG.check;
      } else if (!active && existing) {
        existing.remove();
      }
    });
  }
  /** Visual RGB circles: neutrals + hue×lightness rings. */
  buildCirclePalette() {
    const out = [];
    const push = (hex) => {
      const n2 = this.normalizeHex(hex);
      if (n2 && !out.includes(n2)) out.push(n2);
    };
    for (const v2 of [0, 32, 64, 96, 128, 160, 192, 224, 255]) {
      push(this.rgbToHex(v2, v2, v2));
    }
    const hues = 12;
    const lights = [0.28, 0.42, 0.55, 0.68, 0.82];
    const sats = [0.75, 0.55];
    for (const sat of sats) {
      for (const light of lights) {
        for (let i2 = 0; i2 < hues; i2++) {
          const h2 = i2 / hues * 360;
          push(this.hslToHex(h2, sat, light));
        }
      }
    }
    for (const c2 of PEN_COLORS) push(c2);
    return out;
  }
  hslToHex(h2, s2, l2) {
    const a2 = s2 * Math.min(l2, 1 - l2);
    const f2 = (n2) => {
      const k2 = (n2 + h2 / 30) % 12;
      const c2 = l2 - a2 * Math.max(Math.min(k2 - 3, 9 - k2, 1), -1);
      return Math.round(255 * c2);
    };
    return this.rgbToHex(f2(0), f2(8), f2(4));
  }
  rebuildWidthRow() {
    this.widthRowEl.empty();
    if (this.gestures.navigateMode) {
      this.widthRowEl.style.display = "none";
      return;
    }
    this.widthRowEl.style.display = "";
    const tool = this.gestures.getTool();
    const steps = WIDTH_STEPS[tool];
    const cur = tool === "eraser" ? this.plugin.settings.eraserWidth : tool === "highlighter" ? this.plugin.settings.highlighterWidth : this.plugin.settings.penWidth;
    const idx = nearestWidthStep(tool, cur);
    const toolLabel = tool === "eraser" ? "Eraser" : tool === "highlighter" ? "Marker" : "Pen";
    this.widthRowEl.createSpan({
      text: `${toolLabel}`,
      cls: "pyoink-width-label"
    });
    const minus = this.widthRowEl.createEl("button", {
      text: "\u2212",
      cls: "pyoink-width-step"
    });
    minus.title = "Thinner";
    const range = this.widthRowEl.createEl("input", {
      type: "range",
      cls: "pyoink-width-slider"
    });
    range.min = "0";
    range.max = String(steps.length - 1);
    range.step = "1";
    range.value = String(idx);
    range.title = `${toolLabel} size (7 steps)`;
    const plus = this.widthRowEl.createEl("button", {
      text: "+",
      cls: "pyoink-width-step"
    });
    plus.title = "Thicker";
    const val = this.widthRowEl.createSpan({
      text: `${idx + 1}/7`,
      cls: "pyoink-width-val"
    });
    const applyW = (i2) => {
      const ii = Math.max(0, Math.min(steps.length - 1, Math.round(i2)));
      const w2 = steps[ii];
      this.finishStrokeIfNeeded();
      if (tool === "eraser") this.plugin.settings.eraserWidth = w2;
      else if (tool === "highlighter") this.plugin.settings.highlighterWidth = w2;
      else this.plugin.settings.penWidth = w2;
      void this.plugin.saveSettings();
      range.value = String(ii);
      val.setText(`${ii + 1}/7`);
      this.updateCanvasCursor();
      this.requestRedraw();
    };
    range.oninput = () => applyW(Number(range.value));
    minus.onclick = (ev) => {
      ev.preventDefault();
      applyW(Number(range.value) - 1);
    };
    plus.onclick = (ev) => {
      ev.preventDefault();
      applyW(Number(range.value) + 1);
    };
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
  /** Hard reset input path after tool/nav switch so ink receives pen again. */
  resetInkInputSurface() {
    this.finishStrokeIfNeeded();
    this.gestures.resetTransient();
    this.scrollTouchId = null;
    this.state = "ready";
    try {
      const c2 = this.canvas;
      c2.style.pointerEvents = this.gestures.navigateMode ? "none" : "auto";
    } catch {
    }
  }
  setNavigate(on) {
    this.resetInkInputSurface();
    this.gestures.navigateMode = on;
    this.pageEl.classList.toggle("is-navigate", on);
    this.canvas.classList.toggle("is-pass-through", on);
    this.canvas.style.pointerEvents = on ? "none" : "auto";
    if (!on) this.rgbPanelOpen = false;
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.syncToolbar();
    this.updateCanvasCursor();
    this.requestRedraw();
  }
  setTool(t2) {
    this.resetInkInputSurface();
    this.gestures.setTool(t2);
    this.gestures.navigateMode = false;
    this.pageEl.classList.remove("is-navigate");
    this.canvas.classList.remove("is-pass-through");
    this.canvas.style.pointerEvents = "auto";
    this.syncToolbar();
    this.updateCanvasCursor();
  }
  bindToolbarDrag(handle) {
    let dragging = false;
    let pid = null;
    let grabOffX = 0;
    let grabOffY = 0;
    const onDown = (ev) => {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      dragging = true;
      pid = ev.pointerId;
      this.dragBound = true;
      this.toolbarEl.classList.add("is-dragging");
      const root = this.rootEl.getBoundingClientRect();
      const tb = this.toolbarEl.getBoundingClientRect();
      grabOffX = ev.clientX - tb.left;
      grabOffY = ev.clientY - tb.top;
      try {
        handle.setPointerCapture(ev.pointerId);
      } catch {
      }
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
    };
    const onMove = (ev) => {
      if (!dragging || ev.pointerId !== pid) return;
      const root = this.rootEl.getBoundingClientRect();
      let left = ev.clientX - root.left - grabOffX;
      let top = ev.clientY - root.top - grabOffY;
      const clamped = this.clampToolbarTopLeft(left, top);
      const tbW = this.toolbarEl.offsetWidth || 200;
      const tbH = this.toolbarEl.offsetHeight || 80;
      const cx = clamped.left + tbW / 2;
      const cy = clamped.top + tbH / 2;
      this.plugin.settings.toolbarXPct = cx / Math.max(1, root.width) * 100;
      this.plugin.settings.toolbarYPct = cy / Math.max(1, root.height) * 100;
      this.applyToolbarPos();
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
    };
    const onUp = (ev) => {
      if (!dragging || ev.pointerId !== pid) return;
      dragging = false;
      pid = null;
      this.dragBound = false;
      this.toolbarEl.classList.remove("is-dragging");
      this.applyToolbarPos();
      void this.plugin.saveSettings();
      try {
        handle.releasePointerCapture(ev.pointerId);
      } catch {
      }
      ev.preventDefault();
      ev.stopPropagation();
    };
    handle.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { capture: true });
    window.addEventListener("pointerup", onUp, { capture: true });
    window.addEventListener("pointercancel", onUp, { capture: true });
  }
  /**
   * Keep the whole remote inside the ink view, with the drag bar always reachable.
   * Uses top-left pixel coords relative to rootEl.
   */
  clampToolbarTopLeft(left, top) {
    const rootW = this.rootEl.clientWidth || 1;
    const rootH = this.rootEl.clientHeight || 1;
    const tbW = this.toolbarEl.offsetWidth || 280;
    const tbH = this.toolbarEl.offsetHeight || 56;
    const pad = 12;
    const leftPad = this.propsCollapsed || this.gestures.navigateMode ? pad : Math.min(230, rootW * 0.4);
    const minTop = pad;
    const maxTop = Math.max(minTop, rootH - tbH - pad);
    const minLeft = leftPad;
    const maxLeft = Math.max(minLeft, rootW - tbW - pad);
    return {
      left: Math.min(maxLeft, Math.max(minLeft, left)),
      top: Math.min(maxTop, Math.max(minTop, top))
    };
  }
  applyToolbarPos() {
    const rootW = this.rootEl.clientWidth || 1;
    const rootH = this.rootEl.clientHeight || 1;
    const tbW = this.toolbarEl.offsetWidth || 200;
    const tbH = this.toolbarEl.offsetHeight || 80;
    let cx = (this.plugin.settings.toolbarXPct ?? 50) / 100 * rootW;
    let cy = (this.plugin.settings.toolbarYPct ?? 92) / 100 * rootH;
    let left = cx - tbW / 2;
    let top = cy - tbH / 2;
    const c2 = this.clampToolbarTopLeft(left, top);
    left = c2.left;
    top = c2.top;
    this.plugin.settings.toolbarXPct = (left + tbW / 2) / rootW * 100;
    this.plugin.settings.toolbarYPct = (top + tbH / 2) / rootH * 100;
    this.toolbarEl.style.left = `${left}px`;
    this.toolbarEl.style.top = `${top}px`;
    this.toolbarEl.style.right = "auto";
    this.toolbarEl.style.bottom = "auto";
    this.toolbarEl.style.transform = "none";
  }
  clampZoom(z) {
    const s2 = this.plugin.settings;
    const min = s2.minZoom ?? 0.5;
    const max = s2.maxZoom ?? 3;
    return Math.min(max, Math.max(min, z));
  }
  /** Apply CSS zoom; keep focal client point stable when provided. */
  setZoom(next, focalClientX, focalClientY) {
    const z1 = this.viewZoom || 1;
    const z2 = this.clampZoom(next);
    if (Math.abs(z2 - z1) < 1e-3) {
      this.viewZoom = z2;
      this.gestures.setViewZoom(z2);
      this.applyPageZoom();
      return;
    }
    const scroll = this.scrollEl;
    const srect = scroll.getBoundingClientRect();
    const fx = focalClientX ?? srect.left + srect.width / 2;
    const fy = focalClientY ?? srect.top + srect.height / 2;
    const contentX = (scroll.scrollLeft + (fx - srect.left)) / z1;
    const contentY = (scroll.scrollTop + (fy - srect.top)) / z1;
    this.viewZoom = z2;
    this.gestures.setViewZoom(z2);
    this.applyPageZoom();
    scroll.scrollLeft = contentX * z2 - (fx - srect.left);
    scroll.scrollTop = contentY * z2 - (fy - srect.top);
    this.requestRedraw();
  }
  bumpZoom(factor) {
    this.setZoom(this.viewZoom * factor);
  }
  applyPageZoom() {
    const z = this.viewZoom || 1;
    const w2 = this.cssW || this.pageEl.clientWidth || 1;
    const h2 = this.cssH || this.pageEl.clientHeight || 1;
    if (this.zoomPadEl) {
      this.zoomPadEl.style.width = `${Math.max(1, w2 * z)}px`;
      this.zoomPadEl.style.height = `${Math.max(1, h2 * z)}px`;
    }
    this.pageEl.style.width = `${w2}px`;
    this.pageEl.style.minHeight = `${h2}px`;
    this.pageEl.style.transform = z === 1 ? "" : `scale(${z})`;
    this.pageEl.style.transformOrigin = "0 0";
    this.gestures.setViewZoom(z);
  }
  /**
   * Keep Pencil input path healthy without heavy work on every stroke.
   */
  ensurePenChannelLive(ev) {
    if (this.flingRaf) {
      cancelAnimationFrame(this.flingRaf);
      this.flingRaf = 0;
    }
    this.scrollVelX = 0;
    this.scrollVelY = 0;
    if (this.panRaf) {
      cancelAnimationFrame(this.panRaf);
      this.panRaf = 0;
      this.panPendingX = 0;
      this.panPendingY = 0;
    }
    if (this.scrollTouchId != null) {
      const id = this.scrollTouchId;
      this.scrollTouchId = null;
      this.gestures.releasePointer(id, "touch");
      try {
        this.canvas.releasePointerCapture(id);
      } catch {
      }
    }
    if (!this.gestures.navigateMode) {
      this.canvas.classList.remove("is-pass-through");
      this.canvas.style.pointerEvents = "auto";
    }
    if (this.state !== "ready" && this.state !== "stroking") {
      this.state = "ready";
    }
    if (this.engine.isStroking() && this.gestures.getActiveDrawId() === null) {
      const changed = this.engine.end();
      if (changed) {
        const finished = this.engine.takeLastFinished();
        const dpr = window.devicePixelRatio || 1;
        if (finished && this.cacheCanvas && this.cacheValid && this.cssW > 0) {
          this.engine.stampStrokeToCache(
            this.cacheCanvas,
            finished,
            this.cssW,
            this.cssH,
            dpr
          );
        } else {
          this.cacheValid = false;
        }
        this.markDirty();
      }
      this.state = "ready";
    }
  }
  /** Start a pen/erase stroke from a pointer event (shared by down + recovered move). */
  beginInkFromEvent(ev, rect) {
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
        sample.pressure > 0 ? sample.pressure : 0.5,
        sample.t
      ]);
    }
    this.requestRedraw();
  }
  cycleTool() {
    this.finishStrokeIfNeeded();
    this.setNavigate(false);
    const order = this.plugin.settings.toolCycle;
    const cur = this.gestures.getTool();
    const i2 = order.indexOf(cur);
    this.setTool(order[(i2 + 1) % order.length]);
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.requestRedraw();
  }
  runFingerAction(action) {
    const a2 = action === "cycle_tool" ? "cycle_tool" : action;
    switch (a2) {
      case "none":
        return;
      case "cycle_tool":
        this.cycleTool();
        return;
      case "undo":
        this.finishStrokeIfNeeded();
        if (this.engine.undo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        return;
      case "redo":
        this.finishStrokeIfNeeded();
        if (this.engine.redo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        return;
      case "toggle_nav":
        this.setNavigate(!this.gestures.navigateMode);
        return;
      case "pen":
      case "highlighter":
      case "eraser":
        this.finishStrokeIfNeeded();
        this.setNavigate(false);
        this.setTool(a2);
        this.rebuildColorRow();
        this.rebuildRgbRow();
        this.rebuildWidthRow();
        this.syncToolbar();
        this.requestRedraw();
        return;
      case "exit":
        void (async () => {
          const ok = await this.flushSave();
          if (!ok && this.dirty) {
            if (!confirm("PyoInk: save failed. Exit anyway?")) return;
          }
          if (this.file) await this.leaf.openFile(this.file);
        })();
        return;
    }
  }
  currentBrushRadius() {
    const tool = this.gestures.getTool();
    if (tool === "eraser") return Math.max(6, this.plugin.settings.eraserWidth / 2);
    if (tool === "highlighter") return Math.max(5, this.plugin.settings.highlighterWidth / 2);
    return Math.max(3, this.plugin.settings.penWidth * 1.35);
  }
  updateCanvasCursor() {
    if (this.gestures.navigateMode) {
      this.canvas.style.cursor = "pointer";
      return;
    }
    this.canvas.style.cursor = "none";
  }
  /**
   * Hover / tip preview — high-contrast so it stays visible on light & dark notes.
   * Outer halo (white+dark) + fill matching tool color.
   */
  paintCursor(ctx) {
    if (!this.cursorOn || this.gestures.navigateMode) return;
    if (this.cursorX < 0 || this.cursorY < 0) return;
    const r2 = this.currentBrushRadius();
    const tool = this.gestures.getTool();
    const x2 = this.cursorX;
    const y2 = this.cursorY;
    const ink = tool === "eraser" ? "#dc3232" : tool === "highlighter" ? this.plugin.settings.highlighterColor : this.plugin.settings.penColor;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x2, y2, r2 + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x2, y2, r2 + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x2, y2, r2, 0, Math.PI * 2);
    if (tool === "eraser") {
      ctx.fillStyle = "rgba(220, 50, 50, 0.14)";
      ctx.strokeStyle = "rgba(220, 50, 50, 0.95)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
    } else if (tool === "highlighter") {
      ctx.fillStyle = this.hexAlpha(ink, 0.28);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = this.hexAlpha(ink, 0.22);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
    }
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2.5;
    const c2 = Math.min(4, r2 * 0.45);
    ctx.beginPath();
    ctx.moveTo(x2 - c2, y2);
    ctx.lineTo(x2 + c2, y2);
    ctx.moveTo(x2, y2 - c2);
    ctx.lineTo(x2, y2 + c2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x2 - c2, y2);
    ctx.lineTo(x2 + c2, y2);
    ctx.moveTo(x2, y2 - c2);
    ctx.lineTo(x2, y2 + c2);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = ink;
    ctx.arc(x2, y2, 1.75, 0, Math.PI * 2);
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
    this.syncPropsChrome();
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
    const stopFling = () => {
      if (this.flingRaf) {
        cancelAnimationFrame(this.flingRaf);
        this.flingRaf = 0;
      }
      this.scrollVelX = 0;
      this.scrollVelY = 0;
    };
    const flushPan = () => {
      this.panRaf = 0;
      if (this.panPendingX === 0 && this.panPendingY === 0) return;
      const dx = this.panPendingX;
      const dy = this.panPendingY;
      this.panPendingX = 0;
      this.panPendingY = 0;
      const gain = 1.12;
      this.scrollEl.scrollLeft += dx * gain;
      this.scrollEl.scrollTop += dy * gain;
    };
    const queuePan = (dx, dy) => {
      this.panPendingX += dx;
      this.panPendingY += dy;
      if (!this.panRaf) {
        this.panRaf = requestAnimationFrame(flushPan);
      }
    };
    const startFling = () => {
      stopFling();
      let vx = this.scrollVelX * 16 * 1.15;
      let vy = this.scrollVelY * 16 * 1.15;
      const maxV = 80;
      const sp = Math.hypot(vx, vy);
      if (sp < 1.2) return;
      if (sp > maxV) {
        const s2 = maxV / sp;
        vx *= s2;
        vy *= s2;
      }
      const friction = 0.92;
      const step = () => {
        vx *= friction;
        vy *= friction;
        if (Math.hypot(vx, vy) < 0.35) {
          this.flingRaf = 0;
          this.scrollVelX = 0;
          this.scrollVelY = 0;
          return;
        }
        this.scrollEl.scrollLeft += vx;
        this.scrollEl.scrollTop += vy;
        this.flingRaf = requestAnimationFrame(step);
      };
      this.flingRaf = requestAnimationFrame(step);
    };
    const endScroll = (ev) => {
      if (this.scrollTouchId !== ev.pointerId) return false;
      this.scrollTouchId = null;
      if (this.panRaf) {
        cancelAnimationFrame(this.panRaf);
        this.panRaf = 0;
        flushPan();
      }
      startFling();
      this.gestures.releasePointer(ev.pointerId, ev.pointerType);
      try {
        c2.releasePointerCapture(ev.pointerId);
      } catch {
      }
      return true;
    };
    const forceClearScroll = (reason) => {
      if (this.scrollTouchId == null) return;
      const id = this.scrollTouchId;
      this.scrollTouchId = null;
      stopFling();
      if (this.panRaf) {
        cancelAnimationFrame(this.panRaf);
        this.panRaf = 0;
        this.panPendingX = 0;
        this.panPendingY = 0;
      }
      this.gestures.releasePointer(id, "touch");
      try {
        c2.releasePointerCapture(id);
      } catch {
      }
      inkLog("E_SCROLL_STUCK", reason);
    };
    c2.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType === "pen") {
        stopFling();
        this.ensurePenChannelLive(ev);
      } else if (this.state !== "ready" && this.state !== "stroking") {
        return;
      }
      if (this.gestures.navigateMode && ev.pointerType !== "pen") return;
      if (this.scrollTouchId != null && this.scrollTouchId !== ev.pointerId) {
        forceClearScroll("new_pointer_down");
      }
      const rect = c2.getBoundingClientRect();
      const action = this.gestures.onDown(ev, rect);
      if (action.type === "scroll" && (ev.pointerType === "touch" || ev.pointerType === "mouse")) {
        stopFling();
        this.scrollTouchId = ev.pointerId;
        this.lastScrollY = ev.clientY;
        this.lastScrollX = ev.clientX;
        this.scrollLastT = performance.now();
        this.scrollVelX = 0;
        this.scrollVelY = 0;
        this.panPendingX = 0;
        this.panPendingY = 0;
        try {
          c2.setPointerCapture(ev.pointerId);
        } catch {
        }
        ev.preventDefault();
        return;
      }
      this.handleGesture(action, ev, rect);
    });
    c2.addEventListener("pointermove", (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        const samples = typeof ev.getCoalescedEvents === "function" && ev.getCoalescedEvents().length ? ev.getCoalescedEvents() : [ev];
        let lx = this.lastScrollX;
        let ly = this.lastScrollY;
        let t0 = this.scrollLastT || performance.now();
        let dxSum = 0;
        let dySum = 0;
        for (const s2 of samples) {
          const dx = lx - s2.clientX;
          const dy = ly - s2.clientY;
          dxSum += dx;
          dySum += dy;
          lx = s2.clientX;
          ly = s2.clientY;
        }
        const t1 = performance.now();
        const dt = Math.max(4, t1 - t0);
        const instVx = dxSum / dt;
        const instVy = dySum / dt;
        const a2 = 0.35;
        this.scrollVelX = this.scrollVelX * (1 - a2) + instVx * a2;
        this.scrollVelY = this.scrollVelY * (1 - a2) + instVy * a2;
        this.lastScrollX = lx;
        this.lastScrollY = ly;
        this.scrollLastT = t1;
        queuePan(dxSum, dySum);
        ev.preventDefault();
        return;
      }
      if (ev.pointerType === "pen" && ev.buttons > 0 && !this.gestures.navigateMode && !this.gestures.isDrawing() && (this.state === "ready" || this.state === "stroking")) {
        this.ensurePenChannelLive(ev);
        const rect2 = c2.getBoundingClientRect();
        this.gestures.clearActiveDraw();
        const down = this.gestures.onDown(ev, rect2);
        if (down.type === "draw-start" || down.type === "erase-start") {
          this.handleGesture(down, ev, rect2);
        } else if (!this.engine.isStroking()) {
          this.handleGesture({ type: "draw-start", pointerId: ev.pointerId }, ev, rect2);
        }
        ev.preventDefault();
        return;
      }
      if (this.gestures.navigateMode && ev.pointerType !== "pen" && !this.gestures.isDrawing())
        return;
      if ((ev.pointerType === "pen" || ev.pointerType === "mouse") && ev.buttons === 0 && !this.gestures.isDrawing()) {
        return;
      }
      const rect = c2.getBoundingClientRect();
      const action = this.gestures.onMove(ev, rect);
      this.handleGesture(action, ev, rect);
    });
    const up = (ev) => {
      if (endScroll(ev)) return;
      const rect = c2.getBoundingClientRect();
      const action = this.gestures.onUp(ev, rect);
      this.handleGesture(action, ev, rect);
    };
    c2.addEventListener("pointerup", up);
    c2.addEventListener("pointercancel", (ev) => {
      if (endScroll(ev)) {
        return;
      }
      const action = this.gestures.onCancel(ev);
      this.handleGesture(action, ev, c2.getBoundingClientRect());
    });
    c2.addEventListener("lostpointercapture", (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        forceClearScroll("lostpointercapture");
      }
      if (this.gestures.getActiveDrawId() === ev.pointerId) {
        const action = this.gestures.onCancel(ev);
        this.handleGesture(action, ev, c2.getBoundingClientRect());
      }
    });
    c2.addEventListener(
      "wheel",
      (ev) => {
        if (ev.ctrlKey || ev.metaKey) {
          if (this.plugin.settings.enablePinchZoom === false) return;
          const factor = ev.deltaY < 0 ? 1.08 : 1 / 1.08;
          this.setZoom(this.viewZoom * factor, ev.clientX, ev.clientY);
          ev.preventDefault();
          return;
        }
        this.scrollEl.scrollTop += ev.deltaY;
        this.scrollEl.scrollLeft += ev.deltaX;
        ev.preventDefault();
      },
      { passive: false }
    );
    const updateHover = (ev) => {
      if (this.dragBound) return;
      if (this.gestures.navigateMode) return;
      if (ev.pointerType === "touch") return;
      if (ev.pointerType !== "pen" && ev.pointerType !== "mouse") return;
      const rect = c2.getBoundingClientRect();
      const z = this.viewZoom || 1;
      this.cursorX = (ev.clientX - rect.left) / z;
      this.cursorY = (ev.clientY - rect.top) / z;
      this.cursorOn = true;
      if (typeof ev.pressure === "number" && ev.pressure > 0) {
        this.cursorPressure = ev.pressure;
      } else if (ev.buttons === 0) {
        this.cursorPressure = 0.5;
      }
      if (this.state === "ready" || this.state === "stroking") this.requestRedraw();
    };
    c2.addEventListener("pointermove", updateHover, { capture: true, passive: true });
    c2.addEventListener(
      "pointerrawupdate",
      updateHover,
      { capture: true, passive: true }
    );
    c2.addEventListener(
      "pointerenter",
      (ev) => {
        if (ev.pointerType === "pen" || ev.pointerType === "mouse") {
          this.cursorOn = true;
          updateHover(ev);
          this.updateCanvasCursor();
        }
      },
      { capture: true }
    );
    c2.addEventListener(
      "pointerleave",
      (ev) => {
        if (ev.pointerType === "touch") return;
        if (ev.buttons !== 0) return;
        this.cursorOn = false;
        this.requestRedraw();
      },
      { capture: true }
    );
    c2.addEventListener(
      "pointerover",
      (ev) => {
        if (ev.pointerType === "pen" || ev.pointerType === "mouse") updateHover(ev);
      },
      { capture: true }
    );
    this.updateCanvasCursor();
  }
  handleGesture(action, ev, rect) {
    switch (action.type) {
      case "scroll":
      case "ignore":
        return;
      case "pinch": {
        if (this.scrollTouchId != null) {
          const id = this.scrollTouchId;
          this.scrollTouchId = null;
          this.gestures.releasePointer(id, "touch");
          try {
            this.canvas.releasePointerCapture(id);
          } catch {
          }
        }
        this.setZoom(action.scale, action.centerClientX, action.centerClientY);
        ev.preventDefault();
        return;
      }
      case "pinch-end":
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
      case "pen-double-tap": {
        this.engine.cancel();
        this.gestures.clearActiveDraw();
        this.state = "ready";
        if (this.engine.canUndo()) {
          this.engine.undo();
          this.cacheValid = false;
          this.markDirty();
        }
        try {
          this.canvas.releasePointerCapture(action.pointerId);
        } catch {
        }
        this.runFingerAction(action.action);
        this.syncToolbar();
        this.requestRedraw();
        return;
      }
      case "pen-single-tap": {
        this.engine.cancel();
        this.gestures.clearActiveDraw();
        this.state = "ready";
        try {
          this.canvas.releasePointerCapture(action.pointerId);
        } catch {
        }
        if (action.action !== "none") {
          this.runFingerAction(action.action);
        }
        this.syncToolbar();
        this.requestRedraw();
        return;
      }
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
        if (changed) {
          this.markDirty();
          const finished = this.engine.takeLastFinished();
          const dpr = window.devicePixelRatio || 1;
          if (finished && this.cacheCanvas && this.cacheValid && this.cssW > 0) {
            this.engine.stampStrokeToCache(
              this.cacheCanvas,
              finished,
              this.cssW,
              this.cssH,
              dpr
            );
          } else {
            this.cacheValid = false;
          }
        }
        if (this.undoBtn) this.undoBtn.toggleAttribute("disabled", !this.engine.canUndo());
        if (this.redoBtn) this.redoBtn.toggleAttribute("disabled", !this.engine.canRedo());
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
    this.applyPageZoom();
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
      text: "Floating toolbar: pen tools, colors, size. Below: what each tap does."
    });
    containerEl.createEl("h3", { text: "Pen vs finger" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Apple Pencil = pointerType pen. Finger = touch. Strict mode keeps them on separate channels."
    });
    new import_obsidian3.Setting(containerEl).setName("Strict pen / finger separate").setDesc(
      "ON (recommended): Pencil only draws; finger only pans/zooms/gestures. Never mix channels."
    ).addToggle(
      (t2) => t2.setValue(this.plugin.settings.strictPenTouchSeparate !== false).onChange(async (v2) => {
        this.plugin.settings.strictPenTouchSeparate = v2;
        if (v2) {
          this.plugin.settings.penOnlyInk = true;
          this.plugin.settings.allowFingerDraw = false;
        }
        this.plugin.settings = sanitizeSettings(this.plugin.settings);
        await this.plugin.saveSettings();
        this.display();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Pen-only ink").setDesc("Finger never draws (forced ON when strict separate is ON).").addToggle(
      (t2) => t2.setValue(this.plugin.settings.penOnlyInk !== false).setDisabled(this.plugin.settings.strictPenTouchSeparate !== false).onChange(async (v2) => {
        this.plugin.settings.penOnlyInk = v2;
        if (v2) this.plugin.settings.allowFingerDraw = false;
        this.plugin.settings = sanitizeSettings(this.plugin.settings);
        await this.plugin.saveSettings();
        this.display();
      })
    );
    containerEl.createEl("h3", { text: "Zoom" });
    new import_obsidian3.Setting(containerEl).setName("Pinch zoom").setDesc("Two-finger pinch on the note (and Ctrl/\u2318 + scroll wheel on desktop).").addToggle(
      (t2) => t2.setValue(this.plugin.settings.enablePinchZoom !== false).onChange(async (v2) => {
        this.plugin.settings.enablePinchZoom = v2;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Min zoom").setDesc("Smallest scale (0.5 = 50%).").addSlider(
      (s2) => s2.setLimits(0.25, 1, 0.05).setValue(this.plugin.settings.minZoom ?? 0.5).setDynamicTooltip().onChange(async (v2) => {
        this.plugin.settings.minZoom = v2;
        this.plugin.settings = sanitizeSettings(this.plugin.settings);
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Max zoom").setDesc("Largest scale (3 = 300%).").addSlider(
      (s2) => s2.setLimits(1, 5, 0.1).setValue(this.plugin.settings.maxZoom ?? 3).setDynamicTooltip().onChange(async (v2) => {
        this.plugin.settings.maxZoom = v2;
        this.plugin.settings = sanitizeSettings(this.plugin.settings);
        await this.plugin.saveSettings();
      })
    );
    containerEl.createEl("h3", { text: "Apple Pencil (tip taps)" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Works with tip taps on the note inside Obsidian. iPadOS barrel/side double-tap is not sent to plugins."
    });
    this.pencilSingleDropdown(
      containerEl,
      "Pencil tip single tap",
      "Short tip tap (almost no drag). Default: draw. Other choices run a shortcut instead of leaving a mark.",
      this.plugin.settings.pencilSingleTapAction || "ink"
    );
    new import_obsidian3.Setting(containerEl).setName("Enable Pencil tip double-tap").setDesc("Two quick tip taps \u2192 double-tap action below.").addToggle(
      (t2) => t2.setValue(this.plugin.settings.enablePencilDoubleTap !== false).onChange(async (v2) => {
        this.plugin.settings.enablePencilDoubleTap = v2;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    this.actionDropdown(
      containerEl,
      "Pencil tip double-tap action",
      "What two quick tip taps do (default: cycle pen / marker / eraser).",
      "pencilDoubleTapAction",
      this.plugin.settings.pencilDoubleTapAction || "cycle_tool",
      !this.plugin.settings.enablePencilDoubleTap
    );
    containerEl.createEl("h3", { text: "Finger taps" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Finger only (not Pencil). Scrolling still works when you drag."
    });
    this.actionDropdown(
      containerEl,
      "Two-finger tap",
      "Short two-finger tap.",
      "twoFingerTapAction",
      this.plugin.settings.twoFingerTapAction
    );
    this.actionDropdown(
      containerEl,
      "Three-finger tap",
      "Short three-finger tap.",
      "threeFingerTapAction",
      this.plugin.settings.threeFingerTapAction
    );
    this.actionDropdown(
      containerEl,
      "Finger double-tap",
      "Two quick taps with one finger.",
      "doubleTapAction",
      this.plugin.settings.doubleTapAction
    );
    containerEl.createEl("h3", { text: "Storage" });
    new import_obsidian3.Setting(containerEl).setName("Annotations folder").setDesc("Where .pyoink.json files are stored (not under .obsidian).").addText(
      (t2) => t2.setValue(this.plugin.settings.annotationsFolder).onChange(async (v2) => {
        this.plugin.settings = sanitizeSettings({
          ...this.plugin.settings,
          annotationsFolder: v2
        });
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Idle auto-save").setDesc("Save after idle. Always saves when you leave ink view.").addDropdown((d2) => {
      d2.addOption("12", "12 seconds");
      d2.addOption("20", "20 seconds");
      d2.addOption("30", "30 seconds");
      const cur = String(Math.round((this.plugin.settings.debounceMs || 12e3) / 1e3));
      d2.setValue(["12", "20", "30"].includes(cur) ? cur : "12");
      d2.onChange(async (v2) => {
        this.plugin.settings.debounceMs = Number(v2) * 1e3;
        await this.plugin.saveSettings();
      });
    });
  }
  pencilSingleDropdown(containerEl, name, desc, value) {
    new import_obsidian3.Setting(containerEl).setName(name).setDesc(desc).addDropdown((d2) => {
      for (const [id, label] of Object.entries(PENCIL_SINGLE_TAP_LABELS)) {
        d2.addOption(id, label);
      }
      d2.setValue(value);
      d2.onChange(async (v2) => {
        this.plugin.settings.pencilSingleTapAction = v2;
        await this.plugin.saveSettings();
      });
    });
  }
  actionDropdown(containerEl, name, desc, key, value, disabled = false) {
    const setting = new import_obsidian3.Setting(containerEl).setName(name).setDesc(desc);
    setting.addDropdown((d2) => {
      for (const [id, label] of Object.entries(FINGER_ACTION_LABELS)) {
        d2.addOption(id, label);
      }
      d2.setValue(value);
      d2.setDisabled(disabled);
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
