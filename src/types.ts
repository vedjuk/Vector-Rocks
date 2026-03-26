export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover'

export type AsteroidSize = 0 | 1 | 2

export interface Ship {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  shieldEnergy: number
  shieldDrainBoost: number
}

export interface Bullet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  from: 'player' | 'saucer'
}

export interface Asteroid {
  x: number
  y: number
  vx: number
  vy: number
  size: AsteroidSize
  rot: number
  rotSpeed: number
  radius: number
  verts: number[]
}

export interface Saucer {
  x: number
  y: number
  vx: number
  alive: boolean
  kind: 'large' | 'small'
  shootCooldown: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}
