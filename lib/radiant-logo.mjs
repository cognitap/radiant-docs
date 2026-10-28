/**
 * The Radiant mark: three rounded plates on a cube around a light that lives
 * inside. Taken unchanged from identity lab v28 (radiant-logo/radiant-v28.html).
 * No runtime dependencies.
 */
const Geometry = (() => {
  /**
   * Three plates, each a rounded square on one face of a cube, drawn in plane
   * coordinates u, v ∈ [-1, 1] with the cube's inner corner at (1, 1). The seam
   * between plates is the same width all the way along, and widening it never
   * moves a plate off its face, so the silhouette is always the same cube.
   * Every corner of a plate shares one radius.
   */
  const CUTS = Object.freeze({
    display: { gap: 0.11, radius: 0.2 },
    // A wider seam and tighter corners so the Y survives at 16px.
    small: { gap: 0.2, radius: 0.14 }
  })
  // How much the seam widens per unit of `open`.
  const OPENING = 0.5
  const PLANE = { top: (u, v) => [u, 1, v], left: (u, v) => [u, v, 1], right: (u, v) => [1, v, u] }
  // The light lives in a smaller cube inside, so its edge sits behind the plates
  // and only shows, softly, deep inside each slit.
  const INNER = 0.8
  /**
   * A warm-white core sits on the cube's diagonal at (s, s, s): at rest it
   * projects onto the junction, and pressing draws it forward.
   */
  const SOURCE = Object.freeze({ rest: 0.12, pressed: 0.5 })
  /**
   * One coloured glow under each slit, named for where the slit sits. Each is a
   * point in the cube just behind its edge of the Y, so it slides behind the
   * plates when you tilt.
   */
  const GLOWS = Object.freeze({
    upperLeft: [-0.5, 0.62, 0.62],
    upperRight: [0.62, 0.62, -0.5],
    lower: [0.62, -0.5, 0.62]
  })
  /**
   * Idle sway: each glow drifts in and out along its own slit, rises and sinks
   * a little in depth, and breathes in brightness. Phases are spread so the
   * three never move in unison, and no colour ever leaves its slit.
   */
  const SWAY = Object.freeze({
    upperLeft: { along: 0, phase: 0 },
    upperRight: { along: 2, phase: 2.1 },
    lower: { along: 1, phase: 4.2 }
  })
  function swayed(name, t) {
    const { along, phase } = SWAY[name]
    const p = GLOWS[name].slice()
    p[along] += 0.36 * Math.sin(3 * t + phase)
    const depth = 0.12 * Math.sin(2 * t + phase + 1)
    return {
      point: p.map((v, i) => (i === along ? v : v + depth)),
      level: 0.84 + 0.16 * Math.sin(5 * t + phase + 2)
    }
  }
  // The cube's outline in this range of views, clockwise from the top vertex.
  const HULL = [
    [-1, 1, -1],
    [1, 1, -1],
    [1, -1, -1],
    [1, -1, 1],
    [-1, -1, 1],
    [-1, 1, 1]
  ]
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
  const num = n => Number(n.toFixed(3))

  /** One plate in its own plane, starting along the outer edge v = -1. */
  function outline({ gap, radius: r }) {
    const edge = 1 - gap
    return [
      ['M', -1 + r, -1],
      ['L', 1 - gap - r, -1],
      ['Q', edge, -1, edge, -1 + r],
      ['L', edge, edge - r],
      ['Q', edge, edge, edge - r, edge],
      ['L', -1 + r, edge],
      ['Q', -1, edge, -1, 1 - gap - r],
      ['L', -1, -1 + r],
      ['Q', -1, -1, -1 + r, -1],
      ['Z']
    ]
  }

  /** Orthographic view of a point in cube coordinates. */
  function project(point, pose) {
    let [x, y, z] = point
    const cy = Math.cos(pose.yaw)
    const sy = Math.sin(pose.yaw)
    const nx = cy * x + sy * z
    z = -sy * x + cy * z
    x = nx
    // Pitch around the camera's horizontal axis, not the world's X axis.
    const q = Math.SQRT1_2
    const cp = Math.cos(pose.pitch)
    const sp = Math.sin(pose.pitch)
    const dot = q * (x - z)
    const rx = x * cp + q * y * sp + q * dot * (1 - cp)
    const ry = y * cp - q * (x + z) * sp
    const rz = z * cp + q * y * sp - q * dot * (1 - cp)
    const scale = 1 - pose.press * 0.018
    return [300 + (rx - rz) * 77 * scale, 304 + (rx + rz - 2 * ry) * 44 * scale]
  }

  function faceCommands(face, pose, outlineCommands) {
    return outlineCommands.map(([cmd, ...coords]) => {
      const out = [cmd]
      for (let i = 0; i < coords.length; i += 2) {
        out.push(...project(PLANE[face](coords[i], coords[i + 1]), pose))
      }
      return out
    })
  }

  function pathData(commands) {
    return commands.map(([cmd, ...coords]) => `${cmd}${coords.map(num).join(' ')}`).join(' ')
  }

  // The resting pose: a three-quarter turn with the seam just widened. Every
  // export, Still mode and the springs' home all use it.
  const REST = Object.freeze({
    yaw: 0.1615,
    pitch: 0,
    open: 0.02,
    press: 0,
    energy: 0.57,
    drift: 0
  })

  /**
   * The inner cube's outline, with every corner rounded like the plates': the
   * same radius in each face's plane, scaled with the cube. Built in cube space
   * and projected, so the rounding foreshortens exactly as the plates' does.
   */
  function coreOutline(state, radius) {
    const corners = HULL.map(p => p.map(v => v * INNER))
    // Hull edges are one cube edge long, 2 plane units, so the curve starts radius / 2 along it.
    const toward = (from, to) => from.map((c, k) => c + ((to[k] - c) * radius) / 2)
    const commands = corners.flatMap((v, i) => {
      const before = toward(v, corners[(i + 5) % 6])
      const after = toward(v, corners[(i + 1) % 6])
      return [
        [i ? 'L' : 'M', ...project(before, state)],
        ['Q', ...project(v, state), ...project(after, state)]
      ]
    })
    return pathData([...commands, ['Z']])
  }

  function interior(state, radius) {
    const s = SOURCE.rest + (SOURCE.pressed - SOURCE.rest) * clamp(state.press, 0, 1)
    const at = p => project(p, state)
    const origin = at([0, 0, 0])
    const axis = i => at([0, 1, 2].map(k => (k === i ? 1 : 0))).map((c, k) => c - origin[k])
    // Screen pixels per cube unit, measured across the line of sight.
    const across = axis(0).map((c, k) => c - axis(2)[k])
    return {
      source: at([s, s, s]),
      center: origin,
      glows: Object.fromEntries(
        Object.keys(GLOWS).map(name => [name, at(swayed(name, state.drift).point)])
      ),
      glowLevels: Object.fromEntries(
        Object.keys(GLOWS).map(name => [name, swayed(name, state.drift).level])
      ),
      hull: HULL.map(at),
      core: coreOutline(state, radius),
      unit: Math.hypot(...across) / Math.SQRT2
    }
  }

  /**
   * Everything the renderer needs for one pose. The aperture walks the plates'
   * own edges, so the light fills exactly the gap the plates leave, and closes
   * each tip between the two plates' outer corners. The light never reaches
   * that line: it ends, softly, at the smaller inner cube.
   */
  function getGeometry(pose = {}, cut = 'display') {
    if (!CUTS[cut]) throw new TypeError(`Unknown cut: ${cut}`)
    const state = { ...REST, ...pose }
    for (const key of Object.keys(REST)) {
      if (!Number.isFinite(state[key])) throw new TypeError(`Non-finite pose: ${key}`)
    }
    state.yaw = clamp(state.yaw, -0.2, 0.45)
    state.pitch = clamp(state.pitch, -0.23, 0.23)
    state.open = clamp(state.open, -0.012, 0.24)
    state.press = clamp(state.press, -0.2, 1.2)
    const shape = outline({ ...CUTS[cut], gap: CUTS[cut].gap + OPENING * state.open })
    const faces = Object.keys(PLANE)
    const commands = Object.fromEntries(faces.map(face => [face, faceCommands(face, state, shape)]))
    const paths = Object.fromEntries(faces.map(face => [face, pathData(commands[face])]))

    const end = (face, i) => commands[face][i].slice(-2)
    const ctrl = (face, i) => commands[face][i].slice(1, 3)
    const aperture = pathData([
      ['M', ...end('top', 5)],
      ['L', ...end('top', 4)],
      ['Q', ...ctrl('top', 4), ...end('top', 3)],
      ['L', ...end('top', 2)],
      ['Q', ...ctrl('top', 2), ...end('top', 1)],
      ['L', ...end('right', 6)],
      ['Q', ...ctrl('right', 6), ...end('right', 5)],
      ['L', ...end('right', 4)],
      ['Q', ...ctrl('right', 4), ...end('right', 3)],
      ['L', ...end('right', 2)],
      ['Q', ...ctrl('right', 2), ...end('right', 1)],
      ['L', ...end('left', 1)],
      ['Q', ...ctrl('left', 2), ...end('left', 2)],
      ['L', ...end('left', 3)],
      ['Q', ...ctrl('left', 4), ...end('left', 4)],
      ['L', ...end('left', 5)],
      ['Q', ...ctrl('left', 6), ...end('left', 6)],
      ['L', ...end('top', 6)],
      ['Q', ...ctrl('top', 6), ...end('top', 5)],
      ['Z']
    ])

    // Each plate's own axes on screen, for anything drawn in the plate's plane.
    const frames = Object.fromEntries(
      faces.map(face => {
        const origin = project(PLANE[face](0, 0), state)
        const axis = (u, v) => project(PLANE[face](u, v), state).map((c, k) => c - origin[k])
        return [face, { origin, u: axis(1, 0), v: axis(0, 1) }]
      })
    )

    return { paths, frames, aperture, interior: interior(state, CUTS[cut].radius), pose: state }
  }

  return { REST, getGeometry }
})()

const Light = (() => {
  /**
   * The inside of the cube is a glowing volume, not a set of walls: a white
   * core and three coloured glows, each a soft disc that overlaps the others,
   * so the colours meet in continuous blends and nothing inside has an edge.
   *
   * It adapts to any background and any three colours. A glow keeps its own
   * colour as it fades and loses opacity, never brightness, so it thins into
   * whatever is behind the mark, black, paper or anything between, without
   * passing through a darker shade on the way. Towards its centre it lifts
   * toward white, the way bright light reads. The colours are used as given:
   * nothing here is tuned to a particular hue.
   */
  const PALETTE = Object.freeze(['#ff8e61', '#6a72ff', '#c25cf6'])
  // The slits, in the order `colors` lists them.
  const SLITS = ['upperLeft', 'upperRight', 'lower']
  // Gradient reach, in cube units: the glows overlap well past each other's centres.
  const GLOW_RADIUS = 1.8
  const GLOW_CORE = 0.4
  const HAZE_RADIUS = 1.9
  const HAZE_LENGTH = 0.4
  // Light runs a touch richer than the colour it is given, so the band between a
  // glow's hot centre and its tail reads vivid rather than flat.
  const VIVID = 1.3
  const CORE = [1, 0.985, 0.96]
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const toHex = rgb =>
    '#' +
    rgb
      .map(v =>
        Math.round(clamp(v, 0, 1) * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')

  /*
   * Colour maths runs in OKLab/OKLCH, where mixing toward white keeps hue and
   * vividness instead of greying out, and chroma is real perceptual
   * saturation. Each colour is then fitted to two gamuts: Display P3 for screens
   * that have it, so the vivid band can run past what sRGB can show, and sRGB as
   * the fallback everywhere else.
   */
  const decode = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const encode = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  function toOklab(rgb) {
    const [r, g, b] = rgb.map(decode)
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ]
  }
  function linearSrgb([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ]
  }
  const linearP3 = lab => {
    const [r, g, b] = linearSrgb(lab)
    return [
      0.8224621 * r + 0.177538 * g,
      0.0331941 * r + 0.9668058 * g,
      0.0170827 * r + 0.0723974 * g + 0.9105199 * b
    ]
  }
  const inGamut = rgb => rgb.every(c => c >= -1e-6 && c <= 1 + 1e-6)
  /** Pull chroma in, keeping lightness and hue, until the colour fits the gamut. */
  function fit([L, a, b], toLinear) {
    if (inGamut(toLinear([L, a, b]))) return toLinear([L, a, b])
    let lo = 0,
      hi = 1
    for (let i = 0; i < 18; i++) {
      const k = (lo + hi) / 2
      if (inGamut(toLinear([L, a * k, b * k]))) lo = k
      else hi = k
    }
    return toLinear([L, a * lo, b * lo])
  }
  /** A colour as an sRGB hex fallback and a Display P3 CSS colour. */
  function paint(lab) {
    const p3 = fit(lab, linearP3).map(c => encode(clamp(c, 0, 1)))
    return {
      color: toHex(fit(lab, linearSrgb).map(c => encode(clamp(c, 0, 1)))),
      p3: `color(display-p3 ${p3.map(c => c.toFixed(4)).join(' ')})`
    }
  }
  /** Scale chroma, the perceptual saturation, keeping lightness and hue. */
  const saturate = ([L, a, b], k) => [L, a * k, b * k]
  /** Mix toward white in OKLab, so hue holds all the way to the white-hot centre. */
  const towardWhite = ([L, a, b], t) => [L + (1 - L) * t, a * (1 - t), b * (1 - t)]

  function parseColor(hex) {
    const match = /^#?([0-9a-f]{6})$/i.exec(String(hex))
    if (!match) throw new TypeError(`Colour must be #rrggbb: ${hex}`)
    const n = parseInt(match[1], 16)
    return [n >> 16, (n >> 8) & 255, n & 255].map(v => v / 255)
  }

  function levels(pose, { chroma = 1, glow = 1, colors = PALETTE } = {}) {
    const e = clamp(pose.energy, 0, 1.5)
    // A wider seam shows more light; hold total bloom roughly steady.
    const open = Math.max(0, pose.open)
    return {
      colors: Object.fromEntries(
        SLITS.map((name, i) => [
          name,
          saturate(toOklab(parseColor(colors[i])), clamp(chroma, 0.4, 1.35) * VIVID)
        ])
      ),
      palette: `${colors.join('')}${chroma}`,
      // How far each glow's centre lifts toward white.
      lift: 0.3 + 0.16 * e,
      haze: 0.12 * (1 + 1.2 * e),
      bloom: ((0.4 + 0.18 * e) * glow) / (1 + 2 * open)
    }
  }

  /** A glow seen edge-on: a soft core, then a long tail that thins, not darkens. */
  function glowStops(name, { colors, lift }) {
    const edge = (1 + (GLOW_RADIUS / GLOW_CORE) ** 2) ** -1.4
    return Array.from({ length: 18 }, (_, i) => {
      const t = i / 17
      const d = t * GLOW_RADIUS
      const falloff = ((1 + (d / GLOW_CORE) ** 2) ** -1.4 - edge) / (1 - edge)
      // White-hot only at the very centre: the lift falls off much faster than the colour.
      return {
        offset: t,
        ...paint(towardWhite(colors[name], lift * falloff ** 3)),
        opacity: falloff ** 0.45
      }
    })
  }

  /** In-scatter along a sight line passing d from the core: ∝ atan(L/d)/d. */
  function hazeStops({ haze }) {
    const scatter = d => Math.atan(HAZE_LENGTH / d) / d
    const edge = scatter(HAZE_RADIUS)
    return Array.from({ length: 18 }, (_, i) => {
      const t = (i / 17) ** 2
      const x = haze * (scatter(Math.hypot(t * HAZE_RADIUS, 0.03)) - edge)
      return { offset: t, ...paint(toOklab(CORE)), opacity: 1 - Math.exp(-x / 3.2) }
    })
  }

  // The attribute is the sRGB fallback; the style, where supported, wins with P3.
  const STOPS = stops =>
    stops
      .map(
        s =>
          `<stop offset="${s.offset.toFixed(4)}" stop-color="${s.color}" stop-opacity="${Number(s.opacity.toFixed(3))}" style="stop-color:${s.p3}"/>`
      )
      .join('')

  return {
    PALETTE,
    SLITS,
    GLOW_RADIUS,
    HAZE_RADIUS,
    levels,
    glowStops,
    hazeStops,
    parseColor,
    STOPS
  }
})()

const Motion = (() => {
  // Exact solution of m*x'' + c*x' + k*(x-target) = 0 over a time step.
  // A target change preserves velocity, so pointer reversals do not restart an ease.
  class Spring {
    constructor(value = 0, stiffness = 190, damping = 22, mass = 1) {
      if (
        ![value, stiffness, damping, mass].every(Number.isFinite) ||
        stiffness <= 0 ||
        damping <= 0 ||
        mass <= 0
      ) {
        throw new TypeError(
          'Spring requires finite values and positive stiffness, damping and mass'
        )
      }
      this.value = value
      this.target = value
      this.velocity = 0
      this.stiffness = stiffness
      this.damping = damping
      this.mass = mass
    }
    snap(value = this.target) {
      this.value = this.target = value
      this.velocity = 0
    }
    step(dt) {
      if (!(dt > 0)) return
      const w = Math.sqrt(this.stiffness / this.mass)
      const a = this.damping / (2 * this.mass)
      const x = this.value - this.target
      const v = this.velocity
      let position, velocity
      if (Math.abs(a - w) < 1e-5) {
        const e = Math.exp(-w * dt)
        const b = v + w * x
        position = e * (x + b * dt)
        velocity = e * (v - w * b * dt)
      } else if (a < w) {
        const wd = Math.sqrt(w * w - a * a)
        const e = Math.exp(-a * dt)
        const c = Math.cos(wd * dt)
        const s = Math.sin(wd * dt)
        const b = (v + a * x) / wd
        position = e * (x * c + b * s)
        velocity = e * ((-a * x + b * wd) * c + (-a * b - x * wd) * s)
      } else {
        const d = Math.sqrt(a * a - w * w)
        const r1 = -a + d
        const r2 = -a - d
        const c1 = (v - r2 * x) / (r1 - r2)
        const c2 = x - c1
        position = c1 * Math.exp(r1 * dt) + c2 * Math.exp(r2 * dt)
        velocity = c1 * r1 * Math.exp(r1 * dt) + c2 * r2 * Math.exp(r2 * dt)
      }
      this.value = this.target + position
      this.velocity = velocity
      if (Math.abs(position) < 0.00004 && Math.abs(velocity) < 0.0004) this.snap()
    }
    get settled() {
      return this.value === this.target && this.velocity === 0
    }
  }

  return { Spring }
})()

const Render = (() => {
  const { getGeometry } = Geometry
  const {
    levels,
    glowStops,
    hazeStops,
    STOPS,
    SLITS: glows,
    GLOW_RADIUS,
    HAZE_RADIUS,
    PALETTE
  } = Light
  const faces = ['top', 'left', 'right']
  const num = n => Number(n.toFixed(3))
  const esc = s =>
    String(s).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]
    )
  const pts = points => points.map(p => p.map(num).join(',')).join(' ')
  // Map a plate's own (u, v) coordinates onto the screen, so a circle drawn in
  // that plane becomes the correctly foreshortened ellipse.
  const faceMatrix = f => `matrix(${[...f.u, ...f.v, ...f.origin].map(num).join(' ')})`
  // Light dims gently toward the cube's edge, in cube units from the centre.
  const FADE = 1.75

  /**
   * A studio softbox reflected in each plate, placed in the plate's own plane.
   * It slides against the tilt while the light behind the plates slides with
   * depth: two motions that tell surface from interior.
   */
  function sheen(face, { yaw, pitch }) {
    const k = 1.8
    if (face === 'top')
      return { cx: -0.5 - k * (yaw - pitch), cy: -0.35 + k * (yaw + pitch), r: 1.25, opacity: 0.1 }
    if (face === 'left') return { cx: -0.35 - k * yaw, cy: 0.7 - k * pitch, r: 1, opacity: 0.055 }
    return { cx: -0.35 + k * yaw, cy: 0.7 - k * pitch, r: 1, opacity: 0.045 }
  }

  /**
   * Layers, back to front: the glowing inner cube seen through the seam, the
   * plate faces with their reflections, then bloom of whatever light is visible.
   * Bloom blends normally, so it reads the same over the plates and over any
   * background, and reaches over the plate edges so light and plates share the
   * same air. The inner cube is smaller than the plates and its edge is soft,
   * so near each corner the light dims away inside the slit and the open end
   * shows what is behind the cube.
   */
  function sceneMarkup(prefix, g = getGeometry(), options = {}) {
    const id = n => `${prefix}-${n}`
    const ref = n => `url(#${id(n)})`
    const it = g.interior
    const look = levels(g.pose, options)
    const [sx, sy] = it.source.map(num)
    const [ox, oy] = it.center.map(num)
    const glowRadius = num(GLOW_RADIUS * it.unit)
    const hazeRadius = num(HAZE_RADIUS * it.unit)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 78 440 440" width="440" height="440" role="img" aria-labelledby="${id('title')}" focusable="false" data-radiant-svg="" style="display:block;width:100%;height:100%;overflow:visible">
<title id="${id('title')}">${esc(options.label || 'Radiant')}</title>
<defs>
<linearGradient id="${id('top-fill')}" gradientUnits="userSpaceOnUse" x1="300" y1="130" x2="300" y2="300"><stop stop-color="#36333f"/><stop offset="1" stop-color="#24222c"/></linearGradient>
<linearGradient id="${id('left-fill')}" gradientUnits="userSpaceOnUse" x1="220" y1="235" x2="220" y2="470"><stop stop-color="#211f29"/><stop offset="1" stop-color="#141319"/></linearGradient>
<linearGradient id="${id('right-fill')}" gradientUnits="userSpaceOnUse" x1="380" y1="235" x2="380" y2="470"><stop stop-color="#1b1a23"/><stop offset="1" stop-color="#0f0f14"/></linearGradient>
${faces
  .map(face => {
    const s = sheen(face, g.pose)
    return `<radialGradient id="${id(`${face}-sheen`)}" gradientUnits="userSpaceOnUse" cx="${num(s.cx)}" cy="${num(s.cy)}" r="${s.r}" gradientTransform="${faceMatrix(g.frames[face])}"><stop stop-color="#f1ebf8" stop-opacity="${s.opacity}"/><stop offset=".55" stop-color="#f1ebf8" stop-opacity="${num(s.opacity * 0.35)}"/><stop offset="1" stop-color="#f1ebf8" stop-opacity="0"/></radialGradient>`
  })
  .join('\n')}
${glows.map(name => `<radialGradient id="${id(`${name}-light`)}" gradientUnits="userSpaceOnUse" cx="${num(it.glows[name][0])}" cy="${num(it.glows[name][1])}" r="${glowRadius}">${STOPS(glowStops(name, look))}</radialGradient>`).join('\n')}
<radialGradient id="${id('haze-light')}" gradientUnits="userSpaceOnUse" cx="${sx}" cy="${sy}" r="${hazeRadius}">${STOPS(hazeStops(look))}</radialGradient>
<radialGradient id="${id('fade')}" gradientUnits="userSpaceOnUse" cx="${ox}" cy="${oy}" r="${num(FADE * it.unit)}"><stop stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset=".85" stop-color="#dcdcdc"/><stop offset="1" stop-color="#c8c8c8"/></radialGradient>
<filter id="${id('bloom-filter')}" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="600" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="2.6" result="near"/><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="mid"/><feGaussianBlur in="SourceGraphic" stdDeviation="28" result="far"/><feComposite in="near" in2="mid" operator="arithmetic" k2=".55" k3=".75" result="nearmid"/><feComposite in="nearmid" in2="far" operator="arithmetic" k2="1" k3="1"/></filter>
<filter id="${id('core-filter')}" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><feGaussianBlur stdDeviation="4"/></filter>
${faces.map(face => `<path id="${id(face)}" d="${g.paths[face]}"/>`).join('\n')}
<path id="${id('aperture')}" d="${g.aperture}"/>
<polygon id="${id('hull')}" points="${pts(it.hull)}"/>
<path id="${id('core')}" d="${it.core}"/>
<mask id="${id('core-mask')}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><use href="#${id('core')}" fill="#fff" filter="${ref('core-filter')}"/></mask>
<clipPath id="${id('aperture-clip')}"><use href="#${id('aperture')}"/></clipPath>
<mask id="${id('fade-mask')}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><rect x="0" y="0" width="600" height="600" fill="${ref('fade')}"/></mask>
<mask id="${id('bloom-mask')}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><rect x="0" y="0" width="600" height="600" fill="#fff"/>${faces.map(face => `<use href="#${id(face)}" fill="#a0a0a0"/>`).join('')}</mask>
<g id="${id('interior')}" mask="${ref('core-mask')}" style="isolation:isolate">
<g mask="${ref('fade-mask')}">
${glows.map(name => `<circle id="${id(`${name}-glow`)}" cx="${num(it.glows[name][0])}" cy="${num(it.glows[name][1])}" r="${glowRadius}" fill="${ref(`${name}-light`)}" opacity="${num(it.glowLevels[name])}" style="mix-blend-mode:screen"/>`).join('\n')}
<circle id="${id('haze')}" cx="${sx}" cy="${sy}" r="${hazeRadius}" fill="${ref('haze-light')}" style="mix-blend-mode:screen"/>
</g>
</g>
<g id="${id('emitter')}" clip-path="${ref('aperture-clip')}"><use href="#${id('interior')}"/></g>
</defs>
<g id="${id('material')}">
<use href="#${id('emitter')}"/>
${['left', 'right', 'top'].map(face => `<use href="#${id(face)}" fill="${ref(`${face}-fill`)}"/><use href="#${id(face)}" fill="${ref(`${face}-sheen`)}"/>`).join('')}
<g mask="${ref('bloom-mask')}"><use id="${id('bloom')}" href="#${id('emitter')}" filter="${ref('bloom-filter')}" opacity="${num(look.bloom)}"/></g>
</g>
<g id="${id('xray')}" display="none">
<use href="#${id('interior')}"/>
${faces.map(face => `<use href="#${id(face)}" fill="#d9d3e6" fill-opacity=".05" stroke="#ece6f5" stroke-opacity=".55" stroke-width=".9"/>`).join('')}
<use href="#${id('hull')}" fill="none" stroke="#ece6f5" stroke-opacity=".25" stroke-width=".8" stroke-dasharray="3 4"/>
<circle id="${id('source-marker')}" cx="${sx}" cy="${sy}" r="3.2" fill="none" stroke="#ffffff" stroke-width="1.2"/>
${glows.map(name => `<circle id="${id(`${name}-marker`)}" cx="${num(it.glows[name][0])}" cy="${num(it.glows[name][1])}" r="2.4" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="1"/>`).join('')}
</g>
<g id="${id('ink')}" fill="currentColor" display="none">${faces.map(face => `<use href="#${id(face)}"/>`).join('')}</g>
</svg>`
  }

  /** Returns draw(geometry, options), which updates the mounted scene in place each frame. */
  function connectScene(svg, prefix) {
    const n = name => svg.querySelector(`#${prefix}-${name}`)
    const nodes = Object.fromEntries(
      [
        ...faces.flatMap(f => [f, `${f}-sheen`]),
        'aperture',
        'hull',
        'core',
        'haze',
        'haze-light',
        'fade',
        'bloom',
        'material',
        'xray',
        'ink',
        'source-marker',
        ...glows.flatMap(w => [`${w}-glow`, `${w}-light`, `${w}-marker`])
      ].map(name => [name, n(name)])
    )
    const stopsOf = name => Array.from(nodes[name].querySelectorAll('stop'))
    const glowStopNodes = Object.fromEntries(glows.map(w => [w, stopsOf(`${w}-light`)]))
    const hazeStopNodes = stopsOf('haze-light')
    const attrs = (el, dict) =>
      Object.entries(dict).forEach(([k, v]) =>
        el.setAttribute(k, typeof v === 'number' ? num(v) : v)
      )
    const paint = (node, stop) => {
      attrs(node, { 'stop-color': stop.color, 'stop-opacity': stop.opacity })
      node.style.stopColor = stop.p3
    }
    // Gradient stops only change with the palette and the light's level, not
    // with the pose, so they are repainted only when those change.
    let toneKey = ''
    return (g, config) => {
      const it = g.interior
      const look = levels(g.pose, config)
      const [cx, cy] = it.source
      for (const f of faces) {
        nodes[f].setAttribute('d', g.paths[f])
        const s = sheen(f, g.pose)
        attrs(nodes[`${f}-sheen`], {
          cx: s.cx,
          cy: s.cy,
          gradientTransform: faceMatrix(g.frames[f])
        })
      }
      nodes.aperture.setAttribute('d', g.aperture)
      nodes.hull.setAttribute('points', pts(it.hull))
      nodes.core.setAttribute('d', it.core)
      const glowRadius = GLOW_RADIUS * it.unit
      for (const w of glows) {
        const [x, y] = it.glows[w]
        attrs(nodes[`${w}-glow`], { cx: x, cy: y, r: glowRadius, opacity: it.glowLevels[w] })
        attrs(nodes[`${w}-light`], { cx: x, cy: y, r: glowRadius })
        attrs(nodes[`${w}-marker`], { cx: x, cy: y })
      }
      const hazeRadius = HAZE_RADIUS * it.unit
      attrs(nodes['haze-light'], { cx, cy, r: hazeRadius })
      attrs(nodes.haze, { cx, cy, r: hazeRadius })
      attrs(nodes['source-marker'], { cx, cy })
      attrs(nodes.fade, { cx: it.center[0], cy: it.center[1], r: FADE * it.unit })
      const key = [look.lift, look.haze].map(v => Math.round(v * 60)).join(',') + look.palette
      if (key !== toneKey) {
        toneKey = key
        for (const w of glows) glowStops(w, look).forEach((s, i) => paint(glowStopNodes[w][i], s))
        hazeStops(look).forEach((s, i) => paint(hazeStopNodes[i], s))
      }
      attrs(nodes.bloom, { opacity: look.bloom })
      const mode = config.appearance
      nodes.material.setAttribute('display', mode === 'material' ? 'inline' : 'none')
      nodes.xray.setAttribute('display', mode === 'xray' ? 'inline' : 'none')
      nodes.ink.setAttribute('display', mode === 'ink' ? 'inline' : 'none')
    }
  }

  const VARIANTS = ['digital', 'icon', 'black', 'white', 'small', 'small-white']

  /**
   * Export static vector geometry without runtime scripts or external assets.
   * `icon` is the illuminated mark on the small-size cut, for app icons and
   * anything under about 64px; `small` and `small-white` are its one-colour forms.
   */
  function getStaticSVG({
    variant = 'digital',
    label = 'Radiant',
    prefix = 'radiant-static',
    pose = {},
    chroma = 1,
    glow = 1,
    colors = PALETTE
  } = {}) {
    if (!VARIANTS.includes(variant)) throw new TypeError('Unknown SVG variant')
    const small = variant === 'icon' || variant.startsWith('small')
    const g = getGeometry(small ? {} : pose, small ? 'small' : 'display')
    if (variant !== 'digital' && variant !== 'icon') {
      const fill = variant.endsWith('white') ? '#ffffff' : '#000000'
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="106 114 388 388" width="388" height="388" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><g fill="${fill}">${faces.map(f => `<path d="${g.paths[f]}"/>`).join('')}</g></svg>`
    }
    return sceneMarkup(prefix, g, { label, chroma, glow, colors })
      .replace(
        'viewBox="80 78 440 440" width="440" height="440"',
        'viewBox="90 100 420 420" width="420" height="420"'
      )
      .replace(/<g id="[^"]+-xray"[\s\S]*?<\/g>/, '')
      .replace(' style="display:block;width:100%;height:100%;overflow:visible"', '')
  }

  return { sceneMarkup, connectScene, getStaticSVG }
})()

const Engine = (() => {
  /** Radiant interactive identity. No runtime dependencies. */
  const { getGeometry, REST } = Geometry
  const { Spring } = Motion
  const { sceneMarkup, connectScene, getStaticSVG } = Render
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
  let instance = 0

  /**
   * Mount into an empty, sized element. This is decorative by default: no extra
   * focus stop. Use a real button/link outside the host for meaningful actions.
   * @returns {{setInput: Function, reset: Function, setOptions: Function,
   *            previewPose: Function, getState: Function, exportSVG: Function,
   *            destroy: Function}}
   */
  function createRadiantLogo(host, options = {}) {
    if (!host || host.nodeType !== 1) throw new TypeError('Radiant needs a host element')
    const doc = host.ownerDocument
    const win = doc.defaultView
    if (!win) throw new Error('Radiant requires a browser window')
    const cfg = {
      intensity: 1,
      spread: 0,
      glow: 1,
      chroma: 1,
      interactive: true,
      motion: 'auto',
      appearance: 'material',
      colors: [...Light.PALETTE],
      decorative: true,
      label: 'Radiant',
      ...options
    }
    const validate = opt => {
      if (!['auto', 'reduced', 'off'].includes(opt.motion))
        throw new TypeError('motion must be auto, reduced, or off')
      if (!['material', 'xray', 'ink'].includes(opt.appearance))
        throw new TypeError('appearance must be material, xray or ink')
      if (!Array.isArray(opt.colors) || opt.colors.length !== 3)
        throw new TypeError('colors must be three #rrggbb colours')
      opt.colors.forEach(Light.parseColor)
      for (const [key, min, max] of [
        ['spread', 0, 1],
        ['glow', 0, 1.7],
        ['chroma', 0.4, 1.35]
      ]) {
        if (!Number.isFinite(opt[key]) || opt[key] < min || opt[key] > max)
          throw new RangeError(`${key} must be between ${min} and ${max}`)
      }
      if (!Number.isFinite(opt.intensity) || opt.intensity < 0 || opt.intensity > 1.5)
        throw new RangeError('intensity must be between 0 and 1.5')
    }
    validate(cfg)
    const prefix = `radiant-${++instance}`
    const original = Array.from(host.childNodes)
    host.innerHTML = sceneMarkup(prefix, getGeometry(), cfg)
    const svg = host.querySelector('svg')
    const get = name => svg.querySelector(`#${prefix}-${name}`)
    const draw = connectScene(svg, prefix)
    // Energy is a little underdamped, so a press lands with a small pulse.
    const springs = {
      yaw: new Spring(REST.yaw, 170, 22),
      pitch: new Spring(REST.pitch, 170, 22),
      open: new Spring(REST.open, 210, 20),
      press: new Spring(REST.press, 260, 24),
      energy: new Spring(REST.energy, 170, 15)
    }
    let input = { x: 0, y: 0, active: false, pressed: false }
    let pointerId = null
    let frame = 0
    let previous = 0
    let destroyed = false
    let intersecting = true
    let renderedFrames = 0
    const mql = win.matchMedia('(prefers-reduced-motion: reduce)')
    const reduced = () => cfg.motion !== 'auto' || mql.matches
    // Drives the colours' idle sway; Still and reduced motion hold it.
    const DRIFT_SPEED = (2 * Math.PI) / 36
    let drift = REST.drift
    const visible = () => doc.visibilityState !== 'hidden' && intersecting
    const springPose = () =>
      Object.fromEntries(Object.entries(springs).map(([key, s]) => [key, s.value]))
    const cleanups = []
    const listen = (target, event, fn, opt) => {
      target.addEventListener(event, fn, opt)
      cleanups.push(() => target.removeEventListener(event, fn, opt))
    }

    function semantics() {
      get('title').textContent = cfg.label
      if (cfg.decorative) {
        svg.setAttribute('aria-hidden', 'true')
        svg.removeAttribute('role')
        svg.removeAttribute('aria-labelledby')
      } else {
        svg.removeAttribute('aria-hidden')
        svg.setAttribute('role', 'img')
        svg.setAttribute('aria-labelledby', `${prefix}-title`)
      }
      svg.setAttribute('focusable', 'false')
    }

    function render() {
      draw(getGeometry({ ...springPose(), drift }), cfg)
      renderedFrames++
    }

    function stop() {
      if (frame) win.cancelAnimationFrame(frame)
      frame = 0
      previous = 0
    }
    function tick(time) {
      frame = 0
      if (destroyed || !visible()) return
      const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 1 / 60
      previous = time
      for (const s of Object.values(springs)) s.step(dt)
      if (!reduced()) drift = (drift + dt * DRIFT_SPEED) % (2 * Math.PI)
      render()
      if (!reduced() || Object.values(springs).some(s => !s.settled))
        frame = win.requestAnimationFrame(tick)
      else previous = 0
    }
    function wake() {
      if (!destroyed && visible() && !frame) frame = win.requestAnimationFrame(tick)
    }
    function applyInput() {
      const r = Math.min(1, Math.hypot(input.x, input.y))
      const active = input.active && cfg.interactive && cfg.motion !== 'off'
      const motionOff = reduced()
      const intensity = cfg.intensity
      // Everything is relative to the resting pose, which reduced motion keeps.
      const moving = !motionOff && active
      const targets = {
        yaw: REST.yaw + (moving ? input.x * 0.19 * intensity : 0),
        pitch: REST.pitch + (moving ? -input.y * 0.13 * intensity : 0),
        open: motionOff
          ? REST.open
          : moving && input.pressed
            ? -0.01
            : REST.open + cfg.spread * 0.16 + (moving ? r * 0.035 * intensity : 0),
        press: moving && input.pressed ? 1 : 0,
        // A non-spatial, immediate light response remains in reduced-motion mode.
        energy:
          REST.energy +
          (cfg.motion === 'off'
            ? 0
            : (active ? (input.pressed ? 0.55 : 0.2 * r) * intensity : 0) +
              (motionOff ? 0 : cfg.spread * 0.45))
      }
      for (const [key, value] of Object.entries(targets)) springs[key].target = value
      if (motionOff) {
        stop()
        for (const s of Object.values(springs)) s.snap()
        if (visible()) render()
      } else wake()
    }
    function coordinates(e) {
      const box = host.getBoundingClientRect()
      return {
        x: clamp(((e.clientX - box.left) / Math.max(1, box.width)) * 2 - 1, -1, 1),
        y: clamp(((e.clientY - box.top) / Math.max(1, box.height)) * 2 - 1, -1, 1)
      }
    }
    function setInput(next) {
      if (destroyed) return
      if (
        (next.x !== undefined && !Number.isFinite(next.x)) ||
        (next.y !== undefined && !Number.isFinite(next.y))
      )
        throw new TypeError('Pointer coordinates must be finite')
      input = { ...input, ...next }
      input.x = clamp(input.x, -1, 1)
      input.y = clamp(input.y, -1, 1)
      applyInput()
    }
    function reset({ immediate = false } = {}) {
      if (destroyed) return
      input = { x: 0, y: 0, active: false, pressed: false }
      if (pointerId !== null && host.hasPointerCapture?.(pointerId))
        host.releasePointerCapture(pointerId)
      pointerId = null
      if (immediate) {
        stop()
        for (const [key, s] of Object.entries(springs)) s.snap(REST[key])
        if (visible()) render()
      } else applyInput()
    }

    listen(host, 'pointerenter', e => {
      if (e.pointerType !== 'touch' && pointerId === null)
        setInput({ ...coordinates(e), active: true })
    })
    listen(host, 'pointermove', e => {
      if (!e.isPrimary || (pointerId !== null && pointerId !== e.pointerId)) return
      if (e.pointerType === 'touch' && pointerId === null) return
      setInput({ ...coordinates(e), active: true })
    })
    listen(host, 'pointerdown', e => {
      if (!e.isPrimary || e.button !== 0 || pointerId !== null) return
      pointerId = e.pointerId
      host.setPointerCapture?.(pointerId)
      setInput({ ...coordinates(e), active: true, pressed: true })
      // Never preventDefault: decorative interaction must not hijack page scrolling.
    })
    listen(host, 'pointerup', e => {
      if (pointerId !== e.pointerId) return
      const box = host.getBoundingClientRect()
      const inside =
        e.clientX >= box.left &&
        e.clientX <= box.right &&
        e.clientY >= box.top &&
        e.clientY <= box.bottom
      pointerId = null
      if (host.hasPointerCapture?.(e.pointerId)) host.releasePointerCapture(e.pointerId)
      setInput({ ...coordinates(e), pressed: false, active: e.pointerType !== 'touch' && inside })
    })
    listen(host, 'pointerleave', () => {
      if (pointerId === null) reset()
    })
    listen(host, 'pointercancel', () => reset())
    listen(host, 'lostpointercapture', () => {
      if (pointerId !== null) reset()
    })
    listen(win, 'blur', () => reset({ immediate: true }))
    listen(mql, 'change', applyInput)
    listen(doc, 'visibilitychange', () => {
      if (!visible()) {
        reset({ immediate: true })
        stop()
      } else {
        render()
        applyInput()
      }
    })
    let observer
    if ('IntersectionObserver' in win) {
      observer = new win.IntersectionObserver(entries => {
        intersecting = entries[0].isIntersecting
        if (!intersecting) {
          reset({ immediate: true })
          stop()
        } else {
          render()
          applyInput()
        }
      })
      observer.observe(host)
    }
    semantics()
    render()
    applyInput()

    return {
      setInput,
      reset,
      setOptions(next) {
        if (destroyed) return
        const proposed = { ...cfg, ...next }
        validate(proposed)
        Object.assign(cfg, proposed)
        semantics()
        applyInput()
        if (visible()) render()
      },
      /** Deterministic preview pose. Does not override reduced-motion preferences. */
      previewPose(next = {}) {
        if (destroyed) return
        const pose = getGeometry(next).pose
        stop()
        for (const [key, s] of Object.entries(springs))
          s.snap(reduced() && key !== 'energy' ? REST[key] : pose[key])
        if (visible()) render()
      },
      getState() {
        return {
          pose: { ...springPose(), drift },
          targets: Object.fromEntries(Object.entries(springs).map(([key, s]) => [key, s.target])),
          running: frame !== 0,
          reducedMotion: reduced(),
          visible: visible(),
          renderedFrames,
          options: { ...cfg }
        }
      },
      exportSVG(variant = 'digital') {
        return getStaticSVG({
          variant,
          label: cfg.label,
          chroma: cfg.chroma,
          glow: cfg.glow,
          colors: cfg.colors
        })
      },
      destroy() {
        if (destroyed) return
        reset({ immediate: true })
        destroyed = true
        stop()
        cleanups.forEach(cleanup => cleanup())
        observer?.disconnect()
        host.replaceChildren(...original)
      }
    }
  }

  return { createRadiantLogo, getStaticSVG }
})()

export const { createRadiantLogo, getStaticSVG } = Engine
export const { sceneMarkup } = Render
export const { getGeometry } = Geometry
