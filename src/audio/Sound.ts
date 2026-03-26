let audio: AudioContext | null = null

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audio) {
    try {
      audio = new AudioContext()
    } catch {
      return null
    }
  }
  return audio
}

function beep(freq: number, duration: number, type: OscillatorType = 'square', gain = 0.06): void {
  const c = ctx()
  if (!c || c.state === 'suspended') {
    void c?.resume()
  }
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  o.connect(g)
  g.connect(c.destination)
  o.start()
  o.stop(c.currentTime + duration + 0.02)
}

export function resumeAudio(): void {
  void ctx()?.resume()
}

export function playShoot(): void {
  beep(660, 0.045, 'square', 0.05)
}

export function playThrust(): void {
  beep(120, 0.028, 'sawtooth', 0.018)
}

export function playExplosion(): void {
  const c = ctx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(220, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.2)
  g.gain.value = 0.08
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22)
  o.connect(g)
  g.connect(c.destination)
  o.start()
  o.stop(c.currentTime + 0.25)
}

export function playSaucer(): void {
  beep(180, 0.12, 'triangle', 0.04)
}

export function playShieldHit(): void {
  beep(420, 0.06, 'square', 0.035)
}

export function playHyperspace(): void {
  beep(880, 0.08, 'sine', 0.04)
  beep(220, 0.12, 'sine', 0.03)
}
