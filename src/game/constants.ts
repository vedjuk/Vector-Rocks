/** Tuning knobs — adjust feel here */
export const FIXED_DT = 1 / 60

export const COLORS = {
  vector: '#7dffc4',
  dim: '#3d8062',
  shield: '#6ee7ff',
  saucerShot: '#ff6b6b',
  hud: '#7dffc4',
} as const

export const SHIP = {
  turnSpeed: 5.2,
  thrust: 520,
  maxSpeed: 480,
  friction: 0.988,
  radius: 12,
  bulletSpeed: 640,
  fireInterval: 0.12,
  maxBullets: 4,
} as const

export const SHIELD = {
  maxEnergy: 1,
  rechargePerSec: 0.35,
  drainPerSec: 0.55,
  contactDrain: 0.22,
  minToActivate: 0.08,
} as const

export const HYPERSPACE = {
  cooldown: 2.2,
  badJumpChance: 0.18,
} as const

export const ASTEROID = {
  radii: [42, 22, 11] as const,
  speedLarge: [60, 140] as const,
  speedMed: [80, 200] as const,
  speedSmall: [120, 280] as const,
  rotSpeed: [-2.2, 2.2] as const,
  score: [20, 50, 100] as const,
} as const

export const SAUCER = {
  spawnIntervalMin: 8,
  spawnIntervalMax: 16,
  largeSpeed: 140,
  smallSpeed: 220,
  largeShootEvery: 1.1,
  smallShootEvery: 0.55,
  bulletSpeed: 380,
  radius: 18,
  scoreLarge: 200,
  scoreSmall: 1000,
} as const

export const GAME = {
  initialLives: 3,
  respawnInvuln: 2.8,
  edgeMargin: 48,
} as const

export const STORAGE_KEY = 'vector-rocks-high-score'
