/**
 * The Radiant mark, from identity lab v28 (radiant-logo/radiant-v28.html):
 * three rounded plates on a cube around a light that lives inside. This module
 * holds the geometry, the light and the motion; RadiantMark draws them.
 */

export type Face = 'top' | 'left' | 'right'
export type GlowName = 'upperLeft' | 'upperRight' | 'lower'
type Vec3 = [number, number, number]
type Point = [number, number]
/** A path command and its coordinates, such as ['Q', cx, cy, x, y]. */
type Command = [string, ...number[]]

export interface Pose {
  yaw: number
  pitch: number
  open: number
  press: number
  energy: number
  drift: number
}

export const FACES: Face[] = ['top', 'left', 'right']
export const GLOW_NAMES: GlowName[] = ['upperLeft', 'upperRight', 'lower']
const byFace = <T>(fn: (face: Face) => T) =>
  Object.fromEntries(FACES.map(face => [face, fn(face)])) as Record<Face, T>
const byGlow = <T>(fn: (name: GlowName) => T) =>
  Object.fromEntries(GLOW_NAMES.map(name => [name, fn(name)])) as Record<GlowName, T>
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const num = (n: number) => Number(n.toFixed(3))

/* Geometry */

/**
 * Three plates, each a rounded square on one face of a cube, drawn in plane
 * coordinates u, v ∈ [-1, 1] with the cube's inner corner at (1, 1). The seam
 * between plates is the same width all the way along, and widening it never
 * moves a plate off its face, so the silhouette is always the same cube.
 * Every corner of a plate shares one radius.
 */
const GAP = 0.11
const RADIUS = 0.2
// How much the seam widens per unit of `open`.
const OPENING = 0.5
const PLANE: Record<Face, (u: number, v: number) => Vec3> = {
  top: (u, v) => [u, 1, v],
  left: (u, v) => [u, v, 1],
  right: (u, v) => [1, v, u]
}
// The light lives in a smaller cube inside, so its edge sits behind the plates
// and only shows, softly, deep inside each slit.
const INNER = 0.8
// A warm-white core sits on the cube's diagonal at (s, s, s): at rest it
// projects onto the junction, and pressing draws it forward.
const SOURCE = { rest: 0.12, pressed: 0.5 }
// One coloured glow under each slit, just behind its edge of the Y, so it
// slides behind the plates when you tilt.
const GLOWS: Record<GlowName, Vec3> = {
  upperLeft: [-0.5, 0.62, 0.62],
  upperRight: [0.62, 0.62, -0.5],
  lower: [0.62, -0.5, 0.62]
}
// Idle sway: each glow drifts along its own slit (`along` is that axis), rises
// and sinks a little in depth, and breathes in brightness. Phases are spread so
// the three never move in unison, and no colour ever leaves its slit.
const SWAY: Record<GlowName, { along: number; phase: number }> = {
  upperLeft: { along: 0, phase: 0 },
  upperRight: { along: 2, phase: 2.1 },
  lower: { along: 1, phase: 4.2 }
}
// The cube's outline in this range of views, clockwise from the top vertex.
const HULL: Vec3[] = [
  [-1, 1, -1],
  [1, 1, -1],
  [1, -1, -1],
  [1, -1, 1],
  [-1, -1, 1],
  [-1, 1, 1]
]

/** The resting pose: a three-quarter turn with the seam just widened. */
export const REST: Readonly<Pose> = {
  yaw: 0.1615,
  pitch: 0,
  open: 0.02,
  press: 0,
  energy: 0.57,
  drift: 0
}

function swayed(name: GlowName, t: number) {
  const { along, phase } = SWAY[name]
  const p = GLOWS[name].slice()
  p[along] += 0.36 * Math.sin(3 * t + phase)
  const depth = 0.12 * Math.sin(2 * t + phase + 1)
  return {
    point: p.map((v, i) => (i === along ? v : v + depth)),
    level: 0.84 + 0.16 * Math.sin(5 * t + phase + 2)
  }
}

/** One plate in its own plane, starting along the outer edge v = -1. */
function outline(gap: number): Command[] {
  const r = RADIUS
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
function project(point: readonly number[], pose: Pose): Point {
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

const coordinatesOf = ([, ...coords]: Command) => coords
const pathData = (commands: Command[]) =>
  commands.map(command => `${command[0]}${coordinatesOf(command).map(num).join(' ')}`).join(' ')

/**
 * The inner cube's outline, with every corner rounded like the plates': the
 * same radius in each face's plane, scaled with the cube. Built in cube space
 * and projected, so the rounding foreshortens exactly as the plates' does.
 */
function coreOutline(pose: Pose) {
  const corners = HULL.map(p => p.map(v => v * INNER))
  // Hull edges are one cube edge long, 2 plane units, so the curve starts radius / 2 along it.
  const toward = (from: number[], to: number[]) =>
    from.map((c, k) => c + ((to[k] - c) * RADIUS) / 2)
  const commands = corners.flatMap((v, i): Command[] => [
    [i ? 'L' : 'M', ...project(toward(v, corners[(i + 5) % 6]), pose)],
    ['Q', ...project(v, pose), ...project(toward(v, corners[(i + 1) % 6]), pose)]
  ])
  return pathData([...commands, ['Z']])
}

export interface Frame {
  origin: Point
  u: number[]
  v: number[]
}

export interface Geometry {
  paths: Record<Face, string>
  /** Each plate's own axes on screen, for anything drawn in the plate's plane. */
  frames: Record<Face, Frame>
  aperture: string
  core: string
  source: Point
  center: Point
  glows: Record<GlowName, Point>
  glowLevels: Record<GlowName, number>
  /** Screen pixels per cube unit, measured across the line of sight. */
  unit: number
}

export function getGeometry(pose: Pose): Geometry {
  const at = (p: readonly number[]) => project(p, pose)
  const shape = outline(GAP + OPENING * pose.open)
  const commands = byFace(face =>
    shape.map(command => {
      const coords = coordinatesOf(command)
      const out: Command = [command[0]]
      for (let i = 0; i < coords.length; i += 2)
        out.push(...at(PLANE[face](coords[i], coords[i + 1])))
      return out
    })
  )
  const end = (face: Face, i: number) => coordinatesOf(commands[face][i]).slice(-2)
  const ctrl = (face: Face, i: number) => coordinatesOf(commands[face][i]).slice(0, 2)
  /** A plate's edge from the end of command `from` to the end of command `to`, either way round. */
  const walk = (face: Face, from: number, to: number) => {
    const out: Command[] = []
    if (from < to) for (let i = from + 1; i <= to; i++) out.push(commands[face][i])
    else
      for (let i = from; i > to; i--)
        out.push(
          commands[face][i][0] === 'Q'
            ? ['Q', ...ctrl(face, i), ...end(face, i - 1)]
            : ['L', ...end(face, i - 1)]
        )
    return out
  }
  // The light's opening walks the plates' inner edges, so it fills exactly the
  // gap they leave, and crosses each tip between two plates' outer corners.
  const aperture = pathData([
    ['M', ...end('top', 5)],
    ...walk('top', 5, 1),
    ['L', ...end('right', 6)],
    ...walk('right', 6, 1),
    ['L', ...end('left', 1)],
    ...walk('left', 1, 6),
    ['L', ...end('top', 6)],
    ...walk('top', 6, 5),
    ['Z']
  ])

  const origin = at([0, 0, 0])
  const axis = (i: number) => at([0, 1, 2].map(k => (k === i ? 1 : 0))).map((c, k) => c - origin[k])
  const across = axis(0).map((c, k) => c - axis(2)[k])
  const s = SOURCE.rest + (SOURCE.pressed - SOURCE.rest) * clamp(pose.press, 0, 1)
  return {
    paths: byFace(face => pathData(commands[face])),
    frames: byFace(face => {
      const o = at(PLANE[face](0, 0))
      const along = (u: number, v: number) => at(PLANE[face](u, v)).map((c, k) => c - o[k])
      return { origin: o, u: along(1, 0), v: along(0, 1) }
    }),
    aperture,
    core: coreOutline(pose),
    source: at([s, s, s]),
    center: origin,
    glows: byGlow(name => at(swayed(name, pose.drift).point)),
    glowLevels: byGlow(name => swayed(name, pose.drift).level),
    unit: Math.hypot(...across) / Math.SQRT2
  }
}

/* Light */

/*
 * The inside of the cube is a glowing volume, not a set of walls: a white core
 * and three coloured glows, each a soft disc that overlaps the others, so the
 * colours meet in continuous blends and nothing inside has an edge. A glow
 * keeps its own colour as it fades and loses opacity, never brightness, so it
 * thins into whatever is behind the mark without passing through a darker
 * shade. Towards its centre it lifts toward white, the way bright light reads.
 */
const PALETTE: Record<GlowName, string> = {
  upperLeft: '#ff8e61',
  upperRight: '#6a72ff',
  lower: '#c25cf6'
}
// Gradient reach, in cube units: the glows overlap well past each other's centres.
export const GLOW_RADIUS = 1.8
const GLOW_CORE = 0.4
export const HAZE_RADIUS = 1.9
const HAZE_LENGTH = 0.4
// Light runs a touch richer than the colour it is given, so the band between a
// glow's hot centre and its tail reads vivid rather than flat.
const VIVID = 1.3
const CORE: Vec3 = [1, 0.985, 0.96]

/*
 * Colour maths runs in OKLab, where mixing toward white keeps hue and
 * vividness instead of greying out. Each colour is fitted to Display P3 for
 * screens that have it, so the vivid band can run past sRGB, and to sRGB as
 * the fallback everywhere else.
 */
const decode = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const encode = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
function toOklab(rgb: readonly number[]): Vec3 {
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
function linearSrgb([L, a, b]: Vec3): Vec3 {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ]
}
function linearP3(lab: Vec3): Vec3 {
  const [r, g, b] = linearSrgb(lab)
  return [
    0.8224621 * r + 0.177538 * g,
    0.0331941 * r + 0.9668058 * g,
    0.0170827 * r + 0.0723974 * g + 0.9105199 * b
  ]
}
const inGamut = (rgb: Vec3) => rgb.every(c => c >= -1e-6 && c <= 1 + 1e-6)
/** Pull chroma in, keeping lightness and hue, until the colour fits the gamut. */
function fit([L, a, b]: Vec3, toLinear: (lab: Vec3) => Vec3) {
  if (inGamut(toLinear([L, a, b]))) return toLinear([L, a, b])
  let lo = 0
  let hi = 1
  for (let i = 0; i < 18; i++) {
    const k = (lo + hi) / 2
    if (inGamut(toLinear([L, a * k, b * k]))) lo = k
    else hi = k
  }
  return toLinear([L, a * lo, b * lo])
}
const toHex = (rgb: number[]) =>
  '#' +
  rgb
    .map(v =>
      Math.round(clamp(v, 0, 1) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
/** Mix toward white in OKLab, so hue holds all the way to the white-hot centre. */
const towardWhite = ([L, a, b]: Vec3, t: number): Vec3 => [
  L + (1 - L) * t,
  a * (1 - t),
  b * (1 - t)
]
const GLOW_COLORS = byGlow((name): Vec3 => {
  const n = parseInt(PALETTE[name].slice(1), 16)
  const [L, a, b] = toOklab([n >> 16, (n >> 8) & 255, n & 255].map(v => v / 255))
  return [L, a * VIVID, b * VIVID]
})

/** One gradient stop: an sRGB hex fallback, and a Display P3 colour where supported. */
export interface Stop {
  offset: number
  color: string
  p3: string
  opacity: number
}
function stop(offset: number, lab: Vec3, opacity: number): Stop {
  const p3 = fit(lab, linearP3).map(c => encode(clamp(c, 0, 1)))
  return {
    offset,
    color: toHex(fit(lab, linearSrgb).map(c => encode(clamp(c, 0, 1)))),
    p3: `color(display-p3 ${p3.map(c => c.toFixed(4)).join(' ')})`,
    opacity
  }
}

/** The gradients for one level of energy; they do not change with the pose. */
export function lightStops(energy: number) {
  // How far each glow's centre lifts toward white, and how bright the core's haze is.
  const lift = 0.3 + 0.16 * energy
  const haze = 0.12 * (1 + 1.2 * energy)
  // A glow seen edge-on: a soft core, then a long tail that thins, not darkens.
  const glowEdge = (1 + (GLOW_RADIUS / GLOW_CORE) ** 2) ** -1.4
  const glow = (name: GlowName) =>
    Array.from({ length: 18 }, (_, i) => {
      const t = i / 17
      const falloff =
        ((1 + ((t * GLOW_RADIUS) / GLOW_CORE) ** 2) ** -1.4 - glowEdge) / (1 - glowEdge)
      // White-hot only at the very centre: the lift falls off much faster than the colour.
      return stop(t, towardWhite(GLOW_COLORS[name], lift * falloff ** 3), falloff ** 0.45)
    })
  // In-scatter along a sight line passing d from the core: ∝ atan(L/d)/d.
  const scatter = (d: number) => Math.atan(HAZE_LENGTH / d) / d
  const core = toOklab(CORE)
  return {
    glows: byGlow(glow),
    haze: Array.from({ length: 18 }, (_, i) => {
      const t = (i / 17) ** 2
      const x = haze * (scatter(Math.hypot(t * HAZE_RADIUS, 0.03)) - scatter(HAZE_RADIUS))
      return stop(t, core, 1 - Math.exp(-x / 3.2))
    })
  }
}

/** A wider seam shows more light, so bloom eases off to hold the total steady. */
export const bloom = (pose: Pose) => (0.4 + 0.18 * pose.energy) / (1 + 2 * Math.max(0, pose.open))

/* Motion */

export interface Input {
  /** The pointer, from -1 to 1 on each axis, relative to the mark. */
  x: number
  y: number
  active: boolean
  pressed: boolean
}
export const IDLE: Input = { x: 0, y: 0, active: false, pressed: false }

interface Spring {
  value: number
  target: number
  velocity: number
  stiffness: number
  damping: number
}
const spring = (value: number, stiffness: number, damping: number): Spring => ({
  value,
  target: value,
  velocity: 0,
  stiffness,
  damping
})
const snap = (s: Spring) => {
  s.value = s.target
  s.velocity = 0
}

/**
 * Exact solution of x'' + c x' + k (x - target) = 0 over a time step, so a
 * dropped frame never changes the path. Every spring here is underdamped. A
 * new target keeps the velocity, so pointer reversals do not restart an ease.
 */
function step(s: Spring, dt: number) {
  const a = s.damping / 2
  const w = Math.sqrt(s.stiffness)
  const wd = Math.sqrt(w * w - a * a)
  const x = s.value - s.target
  const e = Math.exp(-a * dt)
  const cos = Math.cos(wd * dt)
  const sin = Math.sin(wd * dt)
  const b = (s.velocity + a * x) / wd
  const position = e * (x * cos + b * sin)
  s.velocity = e * ((-a * x + b * wd) * cos + (-a * b - x * wd) * sin)
  s.value = s.target + position
  if (Math.abs(position) < 0.00004 && Math.abs(s.velocity) < 0.0004) snap(s)
}

// The colours sway through one full cycle every 36 seconds.
const DRIFT_SPEED = (2 * Math.PI) / 36

/** Springs from the pointer to a pose. */
export function createMotion() {
  const springs = {
    yaw: spring(REST.yaw, 170, 22),
    pitch: spring(REST.pitch, 170, 22),
    open: spring(REST.open, 210, 20),
    press: spring(REST.press, 260, 24),
    // A little looser, so a press lands with a small pulse of light.
    energy: spring(REST.energy, 170, 15)
  }
  const all = Object.values(springs)
  let drift = REST.drift
  return {
    /** Reduced motion holds the geometry at rest; only the light still responds. */
    aim(input: Input, reduced: boolean) {
      const r = Math.min(1, Math.hypot(input.x, input.y))
      const moving = input.active && !reduced
      const pressed = moving && input.pressed
      springs.yaw.target = REST.yaw + (moving ? input.x * 0.19 : 0)
      springs.pitch.target = REST.pitch + (moving ? -input.y * 0.13 : 0)
      springs.open.target = pressed ? -0.01 : REST.open + (moving ? r * 0.035 : 0)
      springs.press.target = pressed ? 1 : 0
      springs.energy.target = REST.energy + (input.active ? (input.pressed ? 0.55 : 0.2 * r) : 0)
      if (reduced) all.forEach(snap)
    },
    step(dt: number, reduced: boolean): Pose {
      for (const s of all) step(s, dt)
      if (!reduced) drift = (drift + dt * DRIFT_SPEED) % (2 * Math.PI)
      return {
        yaw: springs.yaw.value,
        pitch: springs.pitch.value,
        open: springs.open.value,
        press: springs.press.value,
        energy: springs.energy.value,
        drift
      }
    },
    get settled() {
      return all.every(s => s.value === s.target && s.velocity === 0)
    }
  }
}
