import { ASTEROID } from '../game/constants.ts'
import type { Asteroid, AsteroidSize } from '../types.ts'

function randRange(a: number, b: number): number {
  return a + Math.random() * (b - a)
}

function makeVerts(count: number): number[] {
  const verts: number[] = []
  for (let i = 0; i < count; i++) {
    const jitter = randRange(0.78, 1.05)
    verts.push(jitter)
  }
  return verts
}

export function createAsteroid(
  x: number,
  y: number,
  size: AsteroidSize,
  vx?: number,
  vy?: number,
): Asteroid {
  const radius = ASTEROID.radii[size]
  let spMin: number
  let spMax: number
  if (size === 0) {
    spMin = ASTEROID.speedLarge[0]
    spMax = ASTEROID.speedLarge[1]
  } else if (size === 1) {
    spMin = ASTEROID.speedMed[0]
    spMax = ASTEROID.speedMed[1]
  } else {
    spMin = ASTEROID.speedSmall[0]
    spMax = ASTEROID.speedSmall[1]
  }
  const speed = randRange(spMin, spMax)
  const dir = randRange(0, Math.PI * 2)
  return {
    x,
    y,
    vx: vx ?? Math.cos(dir) * speed,
    vy: vy ?? Math.sin(dir) * speed,
    size,
    rot: randRange(0, Math.PI * 2),
    rotSpeed: randRange(ASTEROID.rotSpeed[0], ASTEROID.rotSpeed[1]),
    radius,
    verts: makeVerts(9 + Math.floor(Math.random() * 4)),
  }
}

export function updateAsteroid(a: Asteroid, dt: number, width: number, height: number): void {
  a.x += a.vx * dt
  a.y += a.vy * dt
  a.rot += a.rotSpeed * dt

  const wrap = (v: number, max: number) => {
    if (v < 0) return v + max
    if (v >= max) return v - max
    return v
  }
  a.x = wrap(a.x, width)
  a.y = wrap(a.y, height)
}

export function splitAsteroid(parent: Asteroid): Asteroid[] {
  if (parent.size >= 2) return []
  const next = (parent.size + 1) as AsteroidSize
  const baseAngle = Math.atan2(parent.vy, parent.vx)
  const spread = randRange(0.4, 0.9)
  const s = randRange(ASTEROID.speedMed[0], ASTEROID.speedSmall[1])
  const a1 = baseAngle + spread
  const a2 = baseAngle - spread
  return [
    createAsteroid(parent.x, parent.y, next, Math.cos(a1) * s, Math.sin(a1) * s),
    createAsteroid(parent.x, parent.y, next, Math.cos(a2) * s, Math.sin(a2) * s),
  ]
}
