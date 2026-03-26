import { SAUCER } from '../game/constants.ts'
import type { Bullet, Saucer } from '../types.ts'

export function createSaucer(
  y: number,
  width: number,
  wave: number,
): Saucer {
  const fromLeft = Math.random() < 0.5
  const kind: Saucer['kind'] = wave >= 4 && Math.random() < 0.45 ? 'small' : 'large'
  const speed = kind === 'small' ? SAUCER.smallSpeed : SAUCER.largeSpeed
  return {
    x: fromLeft ? -SAUCER.radius : width + SAUCER.radius,
    y,
    vx: fromLeft ? speed : -speed,
    alive: true,
    kind,
    shootCooldown: kind === 'small' ? SAUCER.smallShootEvery * 0.4 : SAUCER.largeShootEvery * 0.5,
  }
}

export function updateSaucer(s: Saucer, dt: number, width: number): void {
  if (!s.alive) return
  s.x += s.vx * dt
  if (s.x < -80 || s.x > width + 80) {
    s.alive = false
  }
  s.shootCooldown -= dt
}

export function saucerFireToward(
  s: Saucer,
  tx: number,
  ty: number,
): Bullet | null {
  if (!s.alive || s.shootCooldown > 0) return null
  const dx = tx - s.x
  const dy = ty - s.y
  const inaccuracy = s.kind === 'large' ? (Math.random() - 0.5) * 0.85 : (Math.random() - 0.5) * 0.18
  const base = Math.atan2(dy, dx) + inaccuracy
  const vx = Math.cos(base) * SAUCER.bulletSpeed
  const vy = Math.sin(base) * SAUCER.bulletSpeed
  s.shootCooldown = s.kind === 'small' ? SAUCER.smallShootEvery : SAUCER.largeShootEvery
  return {
    x: s.x,
    y: s.y,
    vx,
    vy,
    life: 2.4,
    from: 'saucer',
  }
}
