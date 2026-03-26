import { COLORS, SAUCER, SHIP } from '../game/constants.ts'
import type { Asteroid, Bullet, GamePhase, Particle, Saucer, Ship } from '../types.ts'

function fract(n: number): number {
  return n - Math.floor(n)
}

/** Decorrelated x/y — avoids diagonal stripes from paired LCG-style values */
function starAt(
  i: number,
  w: number,
  h: number,
): { x: number; y: number; a: number; big: boolean } {
  const u = fract(Math.sin(i * 12.9898 + 78.233) * 43758.5453123)
  const v = fract(Math.sin(i * 78.233 + 19.9898) * 23421.631592)
  const a = fract(Math.sin(i * 45.164 + 94.615) * 31415.92653)
  return {
    x: u * w,
    y: v * h,
    a: 0.1 + a * 0.42,
    big: a > 0.82,
  }
}

export class CanvasRenderer {
  private stars: { x: number; y: number; a: number; big: boolean }[] = []
  /** Logical size (CSS px) — must match setTransform(dpr) user space, not canvas.width */
  private viewW = 800
  private viewH = 600
  private readonly ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  resize(width: number, height: number): void {
    this.viewW = width
    this.viewH = height
    this.stars = Array.from({ length: 160 }, (_, i) => starAt(i, width, height))
  }

  clear(width: number, height: number): void {
    const { ctx } = this
    ctx.fillStyle = '#030805'
    ctx.fillRect(0, 0, width, height)
  }

  drawStarfield(width: number, height: number): void {
    const { ctx } = this
    for (const s of this.stars) {
      if (s.x > width || s.y > height) continue
      ctx.fillStyle = `rgba(125,255,196,${s.a})`
      const sz = s.big ? 2 : 1
      ctx.fillRect(s.x, s.y, sz, sz)
    }
  }

  drawShip(
    ship: Ship,
    shieldActive: boolean,
    invulnerable: boolean,
    blinkOn: boolean,
  ): void {
    if (invulnerable && !blinkOn) return
    const { ctx } = this
    ctx.save()
    ctx.translate(ship.x, ship.y)
    ctx.rotate(ship.angle)
    ctx.strokeStyle = COLORS.vector
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(SHIP.radius * 1.45, 0)
    ctx.lineTo(SHIP.radius * -0.82, SHIP.radius * 0.78)
    ctx.lineTo(SHIP.radius * -0.55, 0)
    ctx.lineTo(SHIP.radius * -0.82, -SHIP.radius * 0.78)
    ctx.closePath()
    ctx.stroke()

    if (shieldActive && ship.shieldEnergy > 0.02) {
      ctx.strokeStyle = COLORS.shield
      ctx.lineWidth = 1.5
      ctx.globalAlpha = 0.35 + ship.shieldEnergy * 0.45
      ctx.beginPath()
      ctx.arc(0, 0, SHIP.radius + 14 + Math.sin(performance.now() / 120) * 2, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  drawBullet(b: Bullet): void {
    const { ctx } = this
    ctx.fillStyle = b.from === 'saucer' ? COLORS.saucerShot : COLORS.vector
    ctx.fillRect(b.x - 2, b.y - 2, 4, 4)
  }

  drawAsteroid(a: Asteroid): void {
    const { ctx } = this
    const n = a.verts.length
    ctx.save()
    ctx.translate(a.x, a.y)
    ctx.rotate(a.rot)
    ctx.strokeStyle = COLORS.vector
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= n; i++) {
      const idx = i % n
      const ang = (idx / n) * Math.PI * 2
      const r = a.radius * a.verts[idx]
      const px = Math.cos(ang) * r
      const py = Math.sin(ang) * r
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
  }

  drawSaucer(s: Saucer): void {
    if (!s.alive) return
    const { ctx } = this
    const r = SAUCER.radius
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.strokeStyle = s.kind === 'small' ? COLORS.vector : COLORS.dim
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-r, 0)
    ctx.lineTo(-r * 0.45, -r * 0.35)
    ctx.lineTo(r * 0.45, -r * 0.35)
    ctx.lineTo(r, 0)
    ctx.lineTo(r * 0.45, r * 0.35)
    ctx.lineTo(-r * 0.45, r * 0.35)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-r * 0.55, 0)
    ctx.lineTo(r * 0.55, 0)
    ctx.stroke()
    ctx.restore()
  }

  drawParticle(p: Particle): void {
    const { ctx } = this
    const a = Math.max(0, p.life * 2.2)
    ctx.fillStyle = `rgba(125,255,196,${a})`
    ctx.fillRect(p.x - 1, p.y - 1, 2, 2)
  }

  drawHud(
    phase: GamePhase,
    score: number,
    lives: number,
    wave: number,
    high: number,
    ship: Ship,
  ): void {
    const { ctx } = this
    ctx.save()
    ctx.fillStyle = COLORS.hud
    ctx.font = '16px "Courier New", Courier, monospace'
    ctx.textBaseline = 'top'
    if (phase === 'playing' || phase === 'paused') {
      ctx.fillText(`SCORE ${score}`, 16, 14)
      ctx.fillText(`HI ${high}`, 16, 34)
      ctx.fillText(`WAVE ${wave}`, 16, 54)
      ctx.fillText(`SHIPS ${lives}`, 16, 74)
      const bw = 120
      ctx.strokeStyle = COLORS.dim
      ctx.strokeRect(16, 96, bw, 8)
      ctx.fillStyle = COLORS.vector
      ctx.fillRect(17, 97, Math.max(0, (bw - 2) * ship.shieldEnergy), 6)
    }
    ctx.restore()
  }

  drawTitle(): void {
    const { ctx } = this
    const w = this.viewW
    const h = this.viewH
    const cx = w / 2
    const cy = h / 2
    ctx.save()
    ctx.fillStyle = COLORS.hud
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const titlePx = Math.max(26, Math.min(44, Math.floor(w * 0.095)))
    ctx.font = `bold ${titlePx}px "Courier New", Courier, monospace`
    ctx.fillText('VECTOR ROCKS', cx, cy - 120)
    ctx.font = '16px "Courier New", Courier, monospace'
    ctx.fillStyle = COLORS.dim
    ctx.fillText('Deluxe-style vector shooter — fan tribute', cx, cy - 72)
    ctx.fillStyle = COLORS.hud
    ctx.font = '15px "Courier New", Courier, monospace'
    const line = 26
    let y = cy - 28
    ctx.fillText('[SPACE] or [ENTER] — START GAME', cx, y)
    y += line
    ctx.fillText('[P] — PAUSE / RESUME', cx, y)
    y += line
    ctx.fillText('[X] — HYPERSPACE   |   [SHIFT] — SHIELD', cx, y)
    y += line
    ctx.fillText('[←] [→] — ROTATE     [↑] — THRUST', cx, y)
    y += line
    ctx.fillText('[SPACE] — FIRE (max 4 shots)', cx, y)
    y += line + 8
    ctx.fillStyle = COLORS.dim
    ctx.font = '13px "Courier New", Courier, monospace'
    ctx.fillText('Also: [A][D] rotate, [W] thrust', cx, y)
    ctx.restore()
  }

  drawPaused(): void {
    const { ctx } = this
    const w = this.viewW
    const h = this.viewH
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = COLORS.hud
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '28px "Courier New", Courier, monospace'
    ctx.fillText('PAUSED', w / 2, h / 2)
    ctx.font = '16px "Courier New", Courier, monospace'
    ctx.fillStyle = COLORS.dim
    ctx.fillText('[P] RESUME', w / 2, h / 2 + 36)
    ctx.restore()
  }

  drawGameOver(score: number, high: number): void {
    const { ctx } = this
    const w = this.viewW
    const h = this.viewH
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = COLORS.hud
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '32px "Courier New", Courier, monospace'
    ctx.fillText('GAME OVER', w / 2, h / 2 - 28)
    ctx.font = '18px "Courier New", Courier, monospace'
    ctx.fillText(`SCORE ${score}`, w / 2, h / 2 + 12)
    ctx.fillText(`HI SCORE ${high}`, w / 2, h / 2 + 40)
    ctx.fillStyle = COLORS.dim
    ctx.fillText('[R] OR SPACE TO RESTART', w / 2, h / 2 + 76)
    ctx.restore()
  }

  drawHelpFooter(): void {
    const { ctx } = this
    ctx.save()
    ctx.fillStyle = COLORS.dim
    ctx.font = '12px "Courier New", Courier, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    const bottomPad = 24
    ctx.fillText(
      'Inspired by classic vector coin-ops — not affiliated.',
      this.viewW / 2,
      this.viewH - bottomPad,
    )
    ctx.restore()
  }
}
