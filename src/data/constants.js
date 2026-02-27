export const CANONICAL_PARAMS = {
  gravity: 1.0,
  darkMatterDensity: 0.268,
  expansionRate: 73.2,
  starFormationRate: 1.0,
  photonDensity: 1.0,
  darkEnergy: 1.0,
};

export const PARAM_RANGES = {
  gravity:           { min: 0.0,  max: 2.0,  step: 0.01, unit: 'G',       label: 'Gravity' },
  darkMatterDensity: { min: 0.0,  max: 0.50, step: 0.002, unit: '%',      label: 'Dark Matter' },
  expansionRate:     { min: 0,    max: 150,  step: 0.5,  unit: 'km/s/Mpc', label: 'Expansion Rate' },
  starFormationRate: { min: 0.0,  max: 2.5,  step: 0.1,  unit: 'x',       label: 'Star Formation Rate' },
  photonDensity:     { min: 0.1,  max: 1.5,  step: 0.05, unit: 'x',       label: 'Photon Density' },
  darkEnergy:        { min: 0.0,  max: 2.0,  step: 0.05, unit: 'x',       label: 'Dark Energy (Λ)' },
};

export const PHYSICS = {
  G: 6.674e-11,
  c: 3e8,
  kB: 1.381e-23,
  hbar: 1.055e-34,
  sigmaT: 6.652e-29,
  mH: 1.673e-27,
  Tcmb0: 2.725,
  H0_SI: 2.37e-18,
  AGE_UNIVERSE: 14.1,
  CRITICAL_DENSITY: 9.47e-27,
};

export const COLORS = {
  bgPrimary: '#0a0e17',
  bgSecondary: '#0d1117',
  bgTertiary: '#111820',
  bgPanel: '#0f1923',
  borderPrimary: '#1a2a3a',
  accentCyan: '#00d4ff',
  accentBlue: '#4488ff',
  accentGold: '#ffaa00',
  textPrimary: '#e0e8f0',
  textSecondary: '#6b7b8d',
  textTertiary: '#4a5568',
  success: '#00ff88',
  warning: '#ff8844',
  danger: '#ff4466',
  hydrogen: '#00d4ff',
  helium: '#ffaa00',
  heavy: '#ff4466',
  nodeDefault: '#00d4ff',
  edgeDefault: 'rgba(0, 212, 255, 0.2)',
  edgeHighlight: 'rgba(0, 212, 255, 0.6)',
};
