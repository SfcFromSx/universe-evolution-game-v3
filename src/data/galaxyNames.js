import { SeededRandom } from '../utils/random.js';

const REAL_NAMES = [
  'Milky Way', 'Andromeda', 'Triangulum', 'Centaurus A', 'Sombrero',
  'Whirlpool', 'Pinwheel', 'Cartwheel', 'Sunflower', 'Black Eye',
  'Cigar', 'Sculptor', 'Fornax', 'Horologium', 'Antlia',
  'Coma Berenices', 'Virgo A', 'Perseus A', 'Cygnus A',
  'NGC 1300', 'NGC 4565', 'NGC 6872', 'IC 1101',
];

const PREFIXES = [
  'Eos', 'Nyx', 'Aether', 'Kronos', 'Helios', 'Selene', 'Gaia', 'Ouranos',
  'Thalassa', 'Erebus', 'Hemera', 'Aion', 'Phanes', 'Ananke', 'Khaos',
  'Moira', 'Lyra', 'Nova', 'Vega', 'Rigel', 'Altair', 'Deneb', 'Spica',
  'Antares', 'Sirius', 'Pollux', 'Mizar', 'Alcor', 'Castor', 'Betel',
  'Procyon', 'Achernar', 'Fomalhaut', 'Aldebaran', 'Regulus', 'Canopus',
];

const SUFFIXES = [
  'Prime', 'Major', 'Minor', 'Alpha', 'Beta', 'Gamma', 'Delta',
  'Nexus', 'Drift', 'Core', 'Reach', 'Deep', 'Veil', 'Arch',
  'Ring', 'Void', 'Spine', 'Gate', 'Haven', 'Apex',
];

let _nameRng = new SeededRandom(777);
let _usedNames = new Set();

export function generateGalaxyName(index) {
  if (index < REAL_NAMES.length) {
    return REAL_NAMES[index];
  }

  const nameRng = new SeededRandom(777 + index * 3571);
  let name;
  let attempts = 0;
  do {
    const prefix = PREFIXES[Math.floor(nameRng.next() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(nameRng.next() * SUFFIXES.length)];
    name = `${prefix} ${suffix}`;
    attempts++;
  } while (_usedNames.has(name) && attempts < 50);

  _usedNames.add(name);
  return name;
}

export function resetNameGenerator() {
  _nameRng = new SeededRandom(777);
  _usedNames.clear();
}
