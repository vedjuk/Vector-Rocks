import { GAME } from '../game/constants.ts'
import { createAsteroid } from '../entities/Asteroid.ts'
import type { Asteroid } from '../types.ts'

export function spawnWaveAsteroids(wave: number, width: number, height: number): Asteroid[] {
  const count = Math.min(12, 3 + wave)
  const list: Asteroid[] = []
  const margin = GAME.edgeMargin

  for (let i = 0; i < count; i++) {
    const edge = Math.floor(Math.random() * 4)
    let x = 0
    let y = 0
    if (edge === 0) {
      x = Math.random() * width
      y = -50
    } else if (edge === 1) {
      x = width + 50
      y = Math.random() * height
    } else if (edge === 2) {
      x = Math.random() * width
      y = height + 50
    } else {
      x = -50
      y = Math.random() * height
    }

    const ax = Math.max(margin, Math.min(width - margin, x))
    const ay = Math.max(margin, Math.min(height - margin, y))
    const a = createAsteroid(ax, ay, 0)
    const cx = width / 2
    const cy = height / 2
    const dx = cx - a.x
    const dy = cy - a.y
    const d = Math.hypot(dx, dy) || 1
    if (d < 160) {
      a.vx = (a.x - cx) / d * (120 + wave * 8)
      a.vy = (a.y - cy) / d * (120 + wave * 8)
    }
    list.push(a)
  }
  return list
}
