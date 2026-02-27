export const QUOTES_BY_EPOCH = {
  planck: [
    { text: 'Before time, what was there?', author: 'Augustine of Hippo' },
    { text: 'The Tao that can be told is not the eternal Tao.', author: 'Lao Tzu' },
    { text: 'In the beginning was the Word, and the Word was with God.', author: 'Gospel of John' },
  ],
  grand_unification: [
    { text: 'All is one.', author: 'Parmenides' },
    { text: 'The One remains, the many change and pass.', author: 'Shelley' },
  ],
  electroweak: [
    { text: 'Nature uses only the longest threads to weave her patterns.', author: 'Richard Feynman' },
    { text: 'Everything flows and nothing abides.', author: 'Heraclitus' },
  ],
  nucleosynthesis: [
    { text: 'We are star stuff harvesting sunlight.', author: 'Carl Sagan' },
    { text: 'The nitrogen in our DNA was made in the interiors of collapsing stars.', author: 'Carl Sagan' },
  ],
  recombination: [
    { text: 'Let there be light.', author: 'Genesis 1:3' },
    { text: 'In the right light, at the right time, everything is extraordinary.', author: 'Aaron Rose' },
  ],
  dark_ages: [
    { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
    { text: 'The darkest hour has only sixty minutes.', author: 'Morris Mandel' },
    { text: 'Even darkness must pass. A new day will come.', author: 'J.R.R. Tolkien' },
  ],
  first_stars: [
    { text: 'The cosmos is within us. We are made of star-stuff.', author: 'Carl Sagan' },
    { text: 'To see a world in a grain of sand and a heaven in a wild flower.', author: 'William Blake' },
  ],
  reionization: [
    { text: 'Light thinks it travels faster than anything, but it is wrong.', author: 'Terry Pratchett' },
  ],
  galaxy_formation: [
    { text: 'The eternal silence of these infinite spaces frightens me.', author: 'Blaise Pascal' },
    { text: 'Two things are infinite: the universe and human stupidity.', author: 'Albert Einstein' },
    { text: 'Form is emptiness, emptiness is form.', author: 'Heart Sutra' },
  ],
  stellar_evolution: [
    { text: 'Every atom in your body came from a star that exploded.', author: 'Lawrence Krauss' },
    { text: 'We are a way for the cosmos to know itself.', author: 'Carl Sagan' },
  ],
  present: [
    { text: 'The most incomprehensible thing about the universe is that it is comprehensible.', author: 'Albert Einstein' },
    { text: 'The universe is not only queerer than we suppose, but queerer than we can suppose.', author: 'J.B.S. Haldane' },
    { text: 'Not only is the universe stranger than we imagine, it is stranger than we can imagine.', author: 'Arthur Eddington' },
    { text: 'The cosmos is all that is, or ever was, or ever will be.', author: 'Carl Sagan' },
    { text: 'Equipped with his five senses, man explores the universe around him and calls the adventure Science.', author: 'Edwin Hubble' },
  ],
};

export const ACHIEVEMENTS = [
  { id: 'first_sim', name: 'Primordial Thinker', condition: 'Complete first simulation', quote: 'The beginning of wisdom is wonder.', author: 'Socrates' },
  { id: 'fine_tuner', name: 'Fine Tuner', condition: 'Match canonical universe within 5%', quote: 'God does not play dice with the universe.', author: 'Albert Einstein' },
  { id: 'destroyer', name: 'Destroyer of Worlds', condition: 'Create a collapsing universe', quote: 'Now I am become Death, the destroyer of worlds.', author: 'J. Robert Oppenheimer' },
  { id: 'star_forger', name: 'Star Forger', condition: 'Create 1Q+ stars', quote: 'Every atom in your body came from a star that exploded.', author: 'Lawrence Krauss' },
  { id: 'void_walker', name: 'Void Walker', condition: 'Set dark energy above 1.8x', quote: 'The silence of the void speaks volumes.', author: 'Lao Tzu (paraphrase)' },
  { id: 'cosmic_gardener', name: 'Cosmic Gardener', condition: 'Achieve life-compatible conditions', quote: 'The universe is not only queerer than we suppose, but queerer than we can suppose.', author: 'J.B.S. Haldane' },
  { id: 'entropy_master', name: 'Entropy Master', condition: 'Reach maximum entropy', quote: 'Nothing is lost, nothing is created, everything is transformed.', author: 'Antoine Lavoisier' },
  { id: 'minimalist', name: 'The Minimalist', condition: 'Run simulation with all parameters at minimum', quote: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
];

export function getQuoteForEpoch(epochId) {
  const quotes = QUOTES_BY_EPOCH[epochId];
  if (!quotes || quotes.length === 0) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
