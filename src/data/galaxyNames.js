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

let _nameIndex = 0;
let _usedNames = new Set();

export function generateGalaxyName(seed) {
  if (_nameIndex < REAL_NAMES.length && Math.random() < 0.3) {
    const name = REAL_NAMES[_nameIndex];
    if (!_usedNames.has(name)) {
      _usedNames.add(name);
      _nameIndex++;
      return name;
    }
  }

  let name;
  let attempts = 0;
  do {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    name = `${prefix} ${suffix}`;
    attempts++;
  } while (_usedNames.has(name) && attempts < 50);

  _usedNames.add(name);
  return name;
}

export function resetNameGenerator() {
  _nameIndex = 0;
  _usedNames.clear();
}
