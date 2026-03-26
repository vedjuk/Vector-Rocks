import * as Sound from '../audio/Sound.ts'
import { createBullet, updateBullet } from '../entities/Bullet.ts'
import { createShip, resetShip, updateShip } from '../entities/Ship.ts'
import { splitAsteroid, updateAsteroid } from '../entities/Asteroid.ts'
import { createSaucer, saucerFireToward, updateSaucer } from '../entities/Saucer.ts'
import { CanvasRenderer } from '../render/CanvasRenderer.ts'
import { circlesOverlap } from '../systems/Collision.ts'
import type { InputSystem } from '../systems/Input.ts'
import { spawnWaveAsteroids } from '../systems/Spawner.ts'
import type { Asteroid, Bullet, GamePhase, Particle, Saucer } from '../types.ts'
import {
  ASTEROID,
  GAME,
  HYPERSPACE,
  SAUCER,
  SHIELD,
  SHIP,
  STORAGE_KEY,
} from './constants.ts'

export class Game {
  width = 800
  height = 600
  phase: GamePhase = 'title'
  wave = 1
  score = 0
  lives = GAME.initialLives
  highScore = 0

  ship = createShip(400, 300)
  bullets: Bullet[] = []
  enemyBullets: Bullet[] = []
  asteroids: Asteroid[] = []
  saucers: Saucer[] = []
  particles: Particle[] = []

  fireCooldown = 0
  invuln = 0
  hyperspaceCd = 0
  saucerSpawnTimer = 3
  thrustSfxTimer = 0

  private readonly renderer: CanvasRenderer
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly input: InputSystem

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    input: InputSystem,
  ) {
    this.canvas = canvas
    this.ctx = ctx
    this.input = input
    this.renderer = new CanvasRenderer(ctx)
    this.highScore = this.loadHighScore()
    this.applySize()
    window.addEventListener('resize', () => this.applySize())
  }

  private applySize(): void {
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    this.canvas.width = Math.floor(w * dpr)
    this.canvas.height = Math.floor(h * dpr)
    this.canvas.style.width = `${w}px`
    this.canvas.style.height = `${h}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.width = w
    this.height = h
    this.renderer.resize(w, h)
  }

  private loadHighScore(): number {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v == null) return 0
      const n = Number.parseInt(v, 10)
      return Number.isFinite(n) ? n : 0
    } catch {
      return 0
    }
  }

  private saveHighScore(): void {
    if (this.score <= this.highScore) return
    this.highScore = this.score
    try {
      localStorage.setItem(STORAGE_KEY, String(this.highScore))
    } catch {
      /* ignore */
    }
  }

  private startPlaying(): void {
    Sound.resumeAudio()
    this.phase = 'playing'
    this.wave = 1
    this.score = 0
    this.lives = GAME.initialLives
    this.bullets = []
    this.enemyBullets = []
    this.saucers = []
    this.particles = []
    resetShip(this.ship, this.width / 2, this.height / 2)
    this.invuln = GAME.respawnInvuln
    this.fireCooldown = 0
    this.hyperspaceCd = 0
    this.saucerSpawnTimer = 2 + Math.random() * 4
    this.asteroids = spawnWaveAsteroids(this.wave, this.width, this.height)
  }

  private nextWave(): void {
    this.wave += 1
    this.asteroids.push(...spawnWaveAsteroids(this.wave, this.width, this.height))
  }

  private spawnParticles(x: number, y: number, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const s = 40 + Math.random() * 220
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.35 + Math.random() * 0.35,
      })
    }
  }

  private tryHyperspace(): void {
    if (this.hyperspaceCd > 0) return
    this.hyperspaceCd = HYPERSPACE.cooldown
    Sound.playHyperspace()
    const bad = Math.random() < HYPERSPACE.badJumpChance
    let nx: number
    let ny: number
    if (bad) {
      nx = GAME.edgeMargin + Math.random() * (this.width - GAME.edgeMargin * 2)
      ny = GAME.edgeMargin + Math.random() * (this.height - GAME.edgeMargin * 2)
    } else {
      let bestX = this.width / 2
      let bestY = this.height / 2
      for (let t = 0; t < 28; t++) {
        const tx =
          GAME.edgeMargin + Math.random() * (this.width - GAME.edgeMargin * 2)
        const ty =
          GAME.edgeMargin + Math.random() * (this.height - GAME.edgeMargin * 2)
        let ok = true
        for (const a of this.asteroids) {
          if (circlesOverlap(tx, ty, SHIP.radius + 30, a.x, a.y, a.radius + 20)) {
            ok = false
            break
          }
        }
        if (ok) {
          bestX = tx
          bestY = ty
          break
        }
        bestX = tx
        bestY = ty
      }
      nx = bestX
      ny = bestY
    }
    this.ship.x = nx
    this.ship.y = ny
    this.ship.vx = 0
    this.ship.vy = 0
    if (bad && Math.random() < 0.35) {
      this.hitShip(true)
    }
  }

  private hitShip(fromHyperspaceMalfunction = false): void {
    if (this.invuln > 0 && !fromHyperspaceMalfunction) return
    const shieldOn =
      this.input.snapshot().shield &&
      this.ship.shieldEnergy > SHIELD.minToActivate &&
      this.ship.shieldEnergy > 0
    if (shieldOn && !fromHyperspaceMalfunction) {
      this.ship.shieldEnergy = Math.max(0, this.ship.shieldEnergy - 0.45)
      this.ship.shieldDrainBoost = 1.2
      Sound.playShieldHit()
      return
    }
    Sound.playExplosion()
    this.spawnParticles(this.ship.x, this.ship.y, 28)
    this.lives -= 1
    if (this.lives <= 0) {
      this.phase = 'gameover'
      this.saveHighScore()
      return
    }
    resetShip(this.ship, this.width / 2, this.height / 2)
    this.invuln = GAME.respawnInvuln
    this.bullets = []
  }

  private breakAsteroidByIndex(index: number, addScore: boolean): void {
    const a = this.asteroids[index]
    if (!a) return
    if (addScore) {
      this.score += ASTEROID.score[a.size]
      this.saveHighScore()
    }
    this.spawnParticles(a.x, a.y, 10 + Math.floor(Math.random() * 8))
    Sound.playExplosion()
    this.asteroids.splice(index, 1)
    this.asteroids.push(...splitAsteroid(a))
  }

  update(dt: number): void {
    const inp = this.input.snapshot()

    if (this.phase === 'title') {
      if (this.input.confirmEdge()) this.startPlaying()
      return
    }

    if (this.phase === 'gameover') {
      if (this.input.confirmEdge() || this.input.restartEdge()) this.startPlaying()
      return
    }

    if (this.input.pauseEdge()) {
      if (this.phase === 'playing') this.phase = 'paused'
      else if (this.phase === 'paused') this.phase = 'playing'
    }

    if (this.phase === 'paused') return

    if (this.phase !== 'playing') return

    this.fireCooldown = Math.max(0, this.fireCooldown - dt)
    this.invuln = Math.max(0, this.invuln - dt)
    this.hyperspaceCd = Math.max(0, this.hyperspaceCd - dt)
    this.thrustSfxTimer -= dt

    const shieldHeld = inp.shield
    updateShip(this.ship, inp, dt, this.width, this.height, shieldHeld)

    if (inp.thrust && this.thrustSfxTimer <= 0) {
      this.thrustSfxTimer = 0.09
      Sound.playThrust()
    }

    if (this.input.hyperspaceEdge()) this.tryHyperspace()

    if (
      inp.fire &&
      this.fireCooldown <= 0 &&
      this.bullets.filter((b) => b.from === 'player').length < SHIP.maxBullets
    ) {
      this.fireCooldown = SHIP.fireInterval
      const vx = Math.cos(this.ship.angle) * SHIP.bulletSpeed + this.ship.vx
      const vy = Math.sin(this.ship.angle) * SHIP.bulletSpeed + this.ship.vy
      this.bullets.push(
        createBullet(
          this.ship.x + Math.cos(this.ship.angle) * (SHIP.radius + 4),
          this.ship.y + Math.sin(this.ship.angle) * (SHIP.radius + 4),
          vx,
          vy,
          'player',
        ),
      )
      Sound.playShoot()
    }

    for (const a of this.asteroids) updateAsteroid(a, dt, this.width, this.height)

    const shieldActive =
      shieldHeld &&
      this.ship.shieldEnergy > SHIELD.minToActivate &&
      this.ship.shieldEnergy > 0

    if (shieldActive) {
      for (const a of this.asteroids) {
        if (
          circlesOverlap(
            this.ship.x,
            this.ship.y,
            SHIP.radius + 12,
            a.x,
            a.y,
            a.radius,
          )
        ) {
          this.ship.shieldEnergy = Math.max(
            0,
            this.ship.shieldEnergy - SHIELD.contactDrain * dt * 12,
          )
          this.ship.shieldDrainBoost = Math.max(this.ship.shieldDrainBoost, 0.8)
          Sound.playShieldHit()
        }
      }
    }

    for (const s of this.saucers) updateSaucer(s, dt, this.width)

    this.saucers = this.saucers.filter((s) => s.alive)

    this.saucerSpawnTimer -= dt
    if (this.saucerSpawnTimer <= 0) {
      this.saucerSpawnTimer =
        SAUCER.spawnIntervalMin + Math.random() * (SAUCER.spawnIntervalMax - SAUCER.spawnIntervalMin)
      const y = GAME.edgeMargin + Math.random() * (this.height - GAME.edgeMargin * 2)
      this.saucers.push(createSaucer(y, this.width, this.wave))
      Sound.playSaucer()
    }

    for (const s of this.saucers) {
      if (!s.alive) continue
      const b = saucerFireToward(s, this.ship.x, this.ship.y)
      if (b) this.enemyBullets.push(b)
    }

    for (const b of this.bullets) updateBullet(b, dt, this.width, this.height)
    for (const b of this.enemyBullets) updateBullet(b, dt, this.width, this.height)

    for (const b of this.bullets) {
      if (b.from !== 'player' || b.life <= 0) continue
      const ai = this.asteroids.findIndex((a) =>
        circlesOverlap(b.x, b.y, 3, a.x, a.y, a.radius),
      )
      if (ai >= 0) {
        b.life = 0
        this.breakAsteroidByIndex(ai, true)
      }
    }

    for (const b of this.bullets) {
      if (b.from !== 'player' || b.life <= 0) continue
      for (const s of this.saucers) {
        if (!s.alive) continue
        if (circlesOverlap(b.x, b.y, 3, s.x, s.y, SAUCER.radius)) {
          b.life = 0
          s.alive = false
          this.score += s.kind === 'small' ? SAUCER.scoreSmall : SAUCER.scoreLarge
          this.spawnParticles(s.x, s.y, 16)
          Sound.playExplosion()
          break
        }
      }
    }

    for (const b of this.enemyBullets) {
      if (circlesOverlap(b.x, b.y, 3, this.ship.x, this.ship.y, SHIP.radius)) {
        b.life = 0
        if (this.invuln <= 0) {
          const sh =
            shieldHeld &&
            this.ship.shieldEnergy > SHIELD.minToActivate &&
            this.ship.shieldEnergy > 0
          if (sh) {
            this.ship.shieldEnergy = Math.max(0, this.ship.shieldEnergy - 0.35)
            Sound.playShieldHit()
          } else {
            this.hitShip()
          }
        }
      }
    }

    for (const b of this.enemyBullets) {
      if (b.life <= 0) continue
      const ai = this.asteroids.findIndex((a) =>
        circlesOverlap(b.x, b.y, 3, a.x, a.y, a.radius),
      )
      if (ai >= 0) {
        b.life = 0
        this.breakAsteroidByIndex(ai, false)
      }
    }

    this.bullets = this.bullets.filter((b) => b.life > 0)
    this.enemyBullets = this.enemyBullets.filter((b) => b.life > 0)

    if (this.invuln <= 0) {
      for (const a of this.asteroids) {
        if (circlesOverlap(this.ship.x, this.ship.y, SHIP.radius, a.x, a.y, a.radius)) {
          if (shieldActive) {
            this.ship.shieldEnergy = Math.max(
              0,
              this.ship.shieldEnergy - SHIELD.contactDrain * 8 * dt,
            )
            Sound.playShieldHit()
          } else {
            this.hitShip()
          }
          break
        }
      }
    }

    if (this.invuln <= 0) {
      for (const s of this.saucers) {
        if (!s.alive) continue
        if (circlesOverlap(this.ship.x, this.ship.y, SHIP.radius, s.x, s.y, SAUCER.radius)) {
          if (shieldActive) {
            this.ship.shieldEnergy = Math.max(0, this.ship.shieldEnergy - 0.5)
            s.alive = false
            this.score += s.kind === 'small' ? SAUCER.scoreSmall : SAUCER.scoreLarge
            this.spawnParticles(s.x, s.y, 14)
            Sound.playExplosion()
          } else {
            this.hitShip()
          }
          break
        }
      }
    }

    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)

    if (this.asteroids.length === 0) this.nextWave()
  }

  render(): void {
    const w = this.width
    const h = this.height
    this.renderer.clear(w, h)
    this.renderer.drawStarfield(w, h)

    if (this.phase === 'title') {
      this.renderer.drawTitle()
      this.renderer.drawHelpFooter()
      return
    }

    for (const a of this.asteroids) this.renderer.drawAsteroid(a)
    for (const s of this.saucers) this.renderer.drawSaucer(s)
    for (const b of this.bullets) this.renderer.drawBullet(b)
    for (const b of this.enemyBullets) this.renderer.drawBullet(b)
    for (const p of this.particles) this.renderer.drawParticle(p)

    const blink = Math.floor(performance.now() / 100) % 2 === 0
    const shieldVisual =
      this.input.snapshot().shield && this.ship.shieldEnergy > 0.02
    this.renderer.drawShip(
      this.ship,
      shieldVisual,
      this.invuln > 0,
      blink,
    )

    this.renderer.drawHud(
      this.phase,
      this.score,
      this.lives,
      this.wave,
      this.highScore,
      this.ship,
    )

    if (this.phase === 'paused') this.renderer.drawPaused()
    if (this.phase === 'gameover') {
      this.renderer.drawGameOver(this.score, Math.max(this.highScore, this.score))
    }
    this.renderer.drawHelpFooter()
  }

  dispose(): void {
    this.input.dispose()
  }
}
