# COSMOPOEIA — Game Design Document
### *"What if you could hold the universe in your hands and ask it why?"*

**Version:** 1.3 (Reviewed x3)  
**Genre:** Interactive Cosmological Simulation / Philosophical Sandbox  
**Platform:** Web (HTML5/JavaScript, all modern browsers, responsive)  
**Target Audience:** Curious minds aged 14+, science enthusiasts, philosophy lovers, students  
**Session Length:** 15–60 minutes per session  
**Monetization:** Free / Open Source  

---

## 1. Vision Statement

Cosmopoeia is an interactive universe evolution simulator that merges hard cosmological science with philosophical inquiry. Players don't just watch the universe evolve — they shape it. By adjusting fundamental cosmic parameters (gravity, dark matter density, dark energy, expansion rate), players witness how even infinitesimal changes cascade through 14.1 billion years of cosmic history, altering the formation of galaxies, stars, elements, and ultimately, the conditions for consciousness itself.

The game poses a central philosophical question: **"Is our universe fine-tuned, or is complexity inevitable?"** Every simulation run becomes a personal experiment in answering that question.

---

## 2. Core Design Pillars

### 2.1 Emergent Complexity
Everything in the simulation emerges from a small set of fundamental parameters. Galaxy counts, elemental ratios, star formation rates, and cosmic structure all derive from the player's chosen constants — not from scripted outcomes.

### 2.2 Deep Accessibility
Complex astrophysics is presented through beautiful, intuitive visualizations. No textbook knowledge required. The UI teaches through interaction — hover any metric to understand it, click any galaxy to explore it.

### 2.3 Philosophical Resonance
At key cosmic milestones, the game surfaces philosophical questions and insights from thinkers across history — from Heraclitus to Hawking. The universe's story is also humanity's story of wondering "why."

### 2.4 Aesthetic Wonder
The visual language evokes the feeling of peering into deep space through advanced instruments. Dark backgrounds, luminous cyan/teal accents, glowing node graphs, and smooth animations create a sense of cosmic awe.

### 2.5 Meaningful Feedback
Every player action produces visible, understandable consequences. Parameter changes ripple through the simulation in ways that feel causal, not arbitrary. The universe responds; the player learns.

---

## 3. Onboarding & First Experience

### 3.1 Welcome Screen
On first launch, a brief cinematic text sequence:
> *"14.1 billion years ago, everything that would ever exist was compressed into a point smaller than an atom. Then it expanded. And from that expansion came hydrogen, stars, galaxies, planets, and — eventually — you, sitting here, wondering how it all works. Now it's your turn to try."*

A single "Begin" button drops the player into the Dashboard with canonical parameters pre-set.

### 3.2 Guided Tour (First Run Only)
- Subtle tooltip overlays highlight each panel in sequence (5 steps, ~30 seconds)
- Players can skip at any time
- Each tooltip explains what the panel does in one sentence
- Final tooltip: "Change any parameter and press Play to run your universe."

### 3.3 The First Simulation
- Auto-plays the canonical universe at 100x speed on first launch
- Player watches the whole timeline unfold in ~2 minutes
- At the end, a prompt: "That was our universe. Now make your own."
- This creates the emotional baseline for comparison

---

## 4. Game Loop

```
┌──────────────────────────────────────────────────┐
│                  MAIN GAME LOOP                  │
│                                                  │
│  ┌──────────┐    ┌───────────┐    ┌───────────┐ │
│  │  ADJUST  │───▶│  SIMULATE │───▶│  OBSERVE  │ │
│  │ Parameters│    │  Forward  │    │  Results  │ │
│  └──────────┘    └───────────┘    └───────────┘ │
│       ▲                                │         │
│       │         ┌───────────┐          │         │
│       └─────────│  REFLECT  │◀─────────┘         │
│                 │ & Compare │                    │
│                 └───────────┘                    │
└──────────────────────────────────────────────────┘
```

1. **ADJUST** — Modify cosmic parameters (gravity, dark matter, dark energy, expansion rate, star formation rate, photon density)
2. **SIMULATE** — Advance the universe through cosmic epochs, watching emergent behavior unfold
3. **OBSERVE** — Study the results via metrics panels, galactic web, elemental distribution, and epoch timeline
4. **REFLECT** — Compare your universe to the "canonical" universe; encounter philosophical prompts; decide what to change next

---

## 5. Screens & Navigation

### 5.1 Navigation Sidebar (Left Edge)
A narrow vertical icon-based sidebar (collapsed by default, ~50px wide) with the game logo/icon at top. Hovering expands to show labels (~180px). Active view is highlighted with a cyan accent bar.

| Icon | Label | Description |
|------|-------|-------------|
| Logo | Cosmopoeia | Game branding mark — a stylized spiral galaxy 'C' |
| Grid | Dashboard | Main simulation view (shown in reference UI) |
| Chart | Data | Raw data tables: galaxy catalog, star populations, element abundances |
| Doc | Reports | Auto-generated narrative reports about the current universe state |
| Flask | Simulations | Manage saved simulations, compare side-by-side, fork/branch |
| Lightbulb | Insights | Philosophical reflections triggered by simulation milestones |
| Gear | Settings | Visual preferences, simulation speed, accessibility options |

Each panel header has a "..." context menu offering: Expand to Full Screen, Export Data, Reset to Default, and Help.

### 5.2 Dashboard (Main View — Reference UI)
The primary gameplay screen, divided into:

#### A. Universal Metrics Panel (Top-Left)
- **Total Entropy Graph** — Line chart showing entropy (S/kB) vs cosmic time (BYA). Tracks the thermodynamic arrow of time.
- **Thermodynamic State** — Waveform/spectral visualization showing current energy distribution.
- **CMB Fluctuation** — Visual representation of Cosmic Microwave Background anisotropy pattern.

#### B. Elemental Distribution Panel (Mid-Left)
- Interactive donut/pie chart showing current elemental composition:
  - Hydrogen (H): ~74%
  - Helium (He): ~25%
  - Heavy Elements: ~1%
- Visual atom representations with orbital animations
- Ratios update dynamically as the simulation progresses through nucleosynthesis epochs

#### C. Stats Bar (Below Elemental)
Three key metrics in large display format:
- **Galaxies Formed** — e.g., "198.4 T" (trillions)
- **Average Temperature** — e.g., "2.72 K"
- **Stars Created** — e.g., "1.2 Q" (quadrillions)

#### D. Galactic Web Visualization (Center)
The centerpiece of the dashboard. A force-directed node graph showing:
- **Nodes** = Galaxies (sized by mass, colored by type)
- **Edges** = Gravitational/cosmic web filament connections
- **Labels** = Galaxy name, redshift (Z value), and selected property
- **Node properties** shown on hover: Mass, Star Count, Redshift, Type, Age
- **View modes toggle**: Node-Graph (default), Heatmap, 3D Projection
- **Cluster identification** — Current cluster labeled (e.g., "Cluster-7")
- Supports zoom, pan, and galaxy selection for detail drilling

#### E. Cosmic Parameters Panel (Top-Right)
Interactive controls that define the universe's fundamental constants:

| Parameter | Display | Control Type | Range |
|-----------|---------|-------------|-------|
| Gravity Strength | Circular gauge (e.g., 1.01 G) | Dial | 0–2.0 |
| Dark Matter Density | Circular gauge (e.g., 26.8%) | Dial | 0–50% |
| Cosmic Expansion Rate (H₀) | Value display + animation | Slider | 0–150 km/s/Mpc |
| Star Formation Rate | Horizontal slider | Slider | 0.0x–2.5x |
| Photon Density | Horizontal slider | Slider | 100k–1.5x |
| Dark Energy (Λ) | Horizontal slider | Slider | 20–80 |

Changing any parameter triggers a re-simulation from the current epoch forward.

#### F. Epoch Chronology Timeline (Bottom)
A horizontal timeline spanning Big Bang (0) → 14.1 BYA (Present):

**Major Epochs:**
1. **Planck Epoch** (0 – 10⁻⁴³ s) — Quantum gravity, all forces unified
2. **Grand Unification Epoch** (10⁻⁴³ – 10⁻³⁶ s) — Strong force separates
3. **Electroweak Epoch** (10⁻³⁶ – 10⁻¹² s) — Inflation occurs
4. **Quark Epoch** (10⁻¹² – 10⁻⁶ s) — Quarks and gluons dominate
5. **Hadron Epoch** (10⁻⁶ – 1 s) — Protons and neutrons form
6. **Lepton Epoch** (1 – 10 s) — Neutrino decoupling
7. **Nucleosynthesis** (10 s – 20 min) — Light elements form
8. **Photon Epoch** (3 min – 380,000 yr) — Universe opaque to light
9. **Recombination** (380,000 yr) — CMB released, "first light"
10. **Dark Ages** (380,000 yr – 150M yr) — No stars yet
11. **First Stars** (150M – 1B yr) — Population III stars ignite
12. **Reionization** (150M – 1B yr) — Starlight reionizes hydrogen
13. **Galaxy Formation** (1B – 6B yr) — Galaxies assemble
14. **Stellar Evolution** (6B – 10B yr) — Star generations, heavy elements
15. **Present Era** (10B – 14.1B yr) — Solar system, planets, life

**Timeline Features:**
- Draggable scrubber to navigate through time
- Epoch cards below with key statistics at each era
- Click any epoch to jump to it
- "Play" button for auto-advancing simulation
- Speed controls (1x, 10x, 100x, 1000x)

### 5.3 Data View
- Sortable, filterable tables of all galaxies in the simulation
- Columns: Name, Mass, Star Count, Distance, Redshift, Type, Age, Metallicity
- Export functionality (CSV/JSON)
- Advanced search and filtering

### 5.4 Reports View
- Auto-generated narrative summaries of the universe's evolution
- Key milestone reports (e.g., "First Galaxy Formed", "Heavy Element Threshold Reached")
- Comparative reports: "Your Universe vs. Canonical Universe"
- Shareable report cards with key statistics

### 5.5 Simulations View
- Save/load simulation states
- Branch simulations (fork from any epoch)
- Side-by-side comparison of up to 4 simulations
- Parameter diff view showing what changed between runs

### 5.6 Insights View
- Philosophical prompts tied to cosmic milestones:
  - *Planck Epoch*: "Before time, what was there? — Augustine of Hippo"
  - *Nucleosynthesis*: "We are star stuff. — Carl Sagan"
  - *First Stars*: "The cosmos is within us. — Neil deGrasse Tyson"
  - *Galaxy Formation*: "The eternal silence of these infinite spaces frightens me. — Pascal"
  - *Present*: "The most incomprehensible thing about the universe is that it is comprehensible. — Einstein"
- Player can journal their own reflections
- "What if?" thought experiments linked to parameter changes
- Eastern philosophy integration: Tao Te Ching on the void, Buddhist impermanence, Hindu cosmic cycles
- Western philosophy: Pre-Socratics on arche, Kant on the sublime, Nietzsche on eternal recurrence

---

## 6. Simulation Model

### 6.1 Core Physics Engine
The simulation uses simplified but scientifically grounded models:

#### Friedmann Equations (Simplified)
The expansion of the universe is governed by:
```
H² = (8πG/3)ρ - k/a² + Λ/3
```
Where:
- H = Hubble parameter (expansion rate)
- G = gravitational constant (player-adjustable)
- ρ = total energy density
- k = curvature parameter
- a = scale factor
- Λ = cosmological constant (dark energy, player-adjustable)

#### Matter/Energy Density Evolution
```
ρ_matter ∝ a⁻³
ρ_radiation ∝ a⁻⁴
ρ_dark_energy = constant (Λ)
```

#### Structure Formation
- Jeans mass calculation determines when gas clouds collapse into structures
- Press-Schechter formalism (simplified) for halo mass function
- Merger trees for galaxy assembly
- Star formation rate follows Kennicutt-Schmidt law

#### Nucleosynthesis
- Big Bang Nucleosynthesis (BBN) determines initial H/He/Li ratios
- Stellar nucleosynthesis adds heavier elements over time
- Ratios depend on baryon density and expansion rate

### 6.2 Galaxy Generation
Galaxies are procedurally generated based on:
- Dark matter halo mass (from structure formation)
- Gas accretion rate
- Merger history
- Star formation efficiency
- Naming: Procedural names with occasional real galaxy names (Milky Way, Andromeda) for familiar reference

### 6.3 Cosmic Web
- Large-scale structure emerges from initial density fluctuations
- Filaments connect galaxy clusters
- Voids form between filaments
- Visualized as a force-directed graph with physics-based positioning

### 6.4 Epoch Transitions
Each epoch transition is a discrete event that:
1. Updates the physics rules (e.g., nucleosynthesis starts/stops)
2. Triggers visual changes in the dashboard
3. Updates all metric panels
4. May trigger a philosophical insight
5. Plays a subtle transition animation

---

## 7. Art Direction & Visual Design

### 7.1 Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Background | Near-black | #0a0e17 |
| Panel Background | Dark navy | #0d1117 |
| Panel Border | Subtle teal | #1a2a3a |
| Primary Accent | Bright cyan | #00d4ff |
| Secondary Accent | Electric blue | #4488ff |
| Tertiary Accent | Warm gold | #ffaa00 |
| Text Primary | Off-white | #e0e8f0 |
| Text Secondary | Muted blue-gray | #6b7b8d |
| Success/Positive | Green | #00ff88 |
| Warning | Orange | #ff8844 |
| Danger/Critical | Red | #ff4466 |
| Graph Lines | Gradient cyan-to-blue | #00d4ff → #4488ff |
| Node Glow | Teal with bloom | #00d4ff @ 50% opacity |

### 7.2 Typography
- **Headers**: Inter or Space Grotesk — geometric, clean, slightly futuristic
- **Body Text**: Inter — highly legible at small sizes
- **Data Values**: JetBrains Mono or Fira Code — monospaced for numerical data
- **Accent Text**: Small caps tracking for labels (e.g., "GALAXIES FORMED")

### 7.3 Visual Effects
- **Glow effects** on active nodes and connections in the galactic web
- **Particle systems** for ambient cosmic dust in the background
- **Smooth interpolation** on all value changes (counters, gauges, graphs)
- **Subtle pulsing** on interactive elements
- **Parallax depth** hints in the galactic web (larger nodes slightly overlap smaller ones)

### 7.4 Animation Principles
- All transitions are eased (ease-out for appearing, ease-in for disappearing)
- Graph data animates along curves, not jumps
- Epoch transitions use a brief "cosmic flash" effect
- Slider interactions provide immediate visual feedback

---

## 8. Audio Design

### 8.1 Ambient Soundscape
- Generative ambient music that evolves with the epoch
- Early universe: deep drones, low frequencies
- Middle eras: emerging melodic fragments
- Present era: full harmonic textures
- All audio is optional and starts muted by default

### 8.2 Interaction Sounds
- Slider adjustments: soft analog synth sweeps
- Epoch transitions: crystalline chime + subtle whoosh
- Galaxy selection: resonant ping
- Parameter reset: gentle descending tone
- Data panel open/close: soft click

---

## 9. Technical Architecture

### 9.1 Technology Stack
- **Rendering**: HTML5 Canvas + CSS3 for UI chrome
- **Charts**: Custom canvas-based charting (lightweight, no heavy dependencies)
- **Node Graph**: Force-directed layout with custom physics (D3-force-inspired, custom implementation)
- **State Management**: Custom event-driven state store
- **Module System**: ES6 modules with a simple build pipeline
- **No heavy frameworks**: Vanilla JS for performance and bundle size

### 9.2 Performance Targets
- 60 FPS on modern browsers during normal interaction
- < 100ms response time for parameter changes
- < 2s initial load time
- Simulation calculations run in Web Worker to avoid UI blocking
- Canvas rendering uses requestAnimationFrame with dirty-rect optimization

### 9.3 Data Architecture
```
GameState
├── cosmicParameters      // Player-adjustable constants
│   ├── gravity           // 0 – 2.0
│   ├── darkMatterDensity // 0 – 0.50
│   ├── expansionRate     // 0 – 150 km/s/Mpc
│   ├── starFormationRate // 0.0 – 2.5x
│   ├── photonDensity     // 0.1 – 1.5x
│   └── darkEnergy        // 0.2 – 0.8
├── universeState
│   ├── currentEpoch      // Index into epoch list
│   ├── currentTime       // BYA (billions of years ago)
│   ├── scaleFactor       // a(t)
│   ├── temperature       // K
│   ├── entropy           // S/kB
│   └── density           // kg/m³
├── elementalDistribution
│   ├── hydrogen          // fraction
│   ├── helium            // fraction
│   └── heavyElements     // fraction
├── galaxies[]
│   ├── id, name
│   ├── mass, starCount
│   ├── position {x, y, z}
│   ├── redshift
│   ├── type (spiral, elliptical, irregular)
│   ├── connections[]     // edges to other galaxies
│   └── metallicity
├── metrics
│   ├── totalGalaxies
│   ├── totalStars
│   ├── avgTemperature
│   └── entropyHistory[]  // for graph
└── simulations[]         // saved states
```

### 9.4 Persistence & Storage
- All simulation states saved to localStorage
- Auto-save on epoch transitions and parameter changes
- Export/import simulation as JSON for sharing
- Maximum 20 saved simulations (oldest auto-pruned with warning)
- Settings and preferences persisted separately

### 9.5 Error Handling
- Simulation divergence detection: if values go to NaN/Infinity, gracefully reset to last stable state
- Parameter validation: all inputs clamped to valid ranges
- Graceful degradation: if Canvas performance drops, disable particles and reduce node count
- Offline-capable: no server dependency, everything runs client-side

### 9.6 Project Structure
```
v3/
├── GDD.md                    # This document
├── TODO.md                   # Development task list
├── index.html                # Entry point
├── package.json              # Dependencies & scripts
├── src/
│   ├── main.js               # App initialization
│   ├── core/
│   │   ├── Engine.js          # Main game loop & tick
│   │   ├── EventBus.js        # Pub/sub event system
│   │   └── StateStore.js      # Centralized state management
│   ├── simulation/
│   │   ├── Universe.js        # Universe state & evolution
│   │   ├── Physics.js         # Friedmann equations, cosmological calc
│   │   ├── GalaxyGenerator.js # Procedural galaxy creation
│   │   ├── CosmicWeb.js       # Large-scale structure/filament generation
│   │   ├── Nucleosynthesis.js # Element formation logic
│   │   └── EpochManager.js    # Epoch definitions & transitions
│   ├── ui/
│   │   ├── App.js             # Root UI component, layout manager
│   │   ├── Sidebar.js         # Navigation sidebar
│   │   ├── panels/
│   │   │   ├── UniversalMetrics.js    # Entropy graph, thermo state, CMB
│   │   │   ├── ElementalDistribution.js # Element pie chart & atoms
│   │   │   ├── StatsBar.js            # Key metric display
│   │   │   ├── CosmicParameters.js    # Parameter controls
│   │   │   └── EpochTimeline.js       # Bottom timeline
│   │   ├── views/
│   │   │   ├── DashboardView.js  # Main dashboard layout
│   │   │   ├── DataView.js       # Data tables
│   │   │   ├── ReportsView.js    # Generated reports
│   │   │   ├── SimulationsView.js # Saved simulations
│   │   │   └── InsightsView.js   # Philosophical insights
│   │   └── components/
│   │       ├── Gauge.js          # Circular gauge component
│   │       ├── Slider.js         # Custom slider component
│   │       ├── Graph.js          # Line/area chart component
│   │       ├── NodeGraph.js      # Force-directed graph renderer
│   │       ├── DonutChart.js     # Donut/pie chart component
│   │       ├── Tooltip.js        # Hover tooltip
│   │       └── Modal.js          # Modal dialog
│   ├── rendering/
│   │   ├── CanvasRenderer.js    # Main canvas management
│   │   ├── ParticleSystem.js    # Background cosmic particles
│   │   ├── GlowEffect.js       # Bloom/glow post-processing
│   │   └── Animations.js       # Tweening & animation utilities
│   ├── data/
│   │   ├── epochs.js            # Epoch definitions & metadata
│   │   ├── constants.js         # Physical constants
│   │   ├── philosophicalQuotes.js # Curated quotes by epoch
│   │   └── galaxyNames.js      # Name pool for galaxy generation
│   └── utils/
│       ├── math.js              # Math helpers (lerp, clamp, etc.)
│       ├── format.js            # Number formatting (T, Q, K, etc.)
│       ├── color.js             # Color manipulation
│       └── random.js            # Seeded random number generator
├── styles/
│   ├── main.css                 # Global styles & CSS variables
│   ├── layout.css               # Grid/flexbox layout
│   ├── sidebar.css              # Sidebar styles
│   ├── panels.css               # Panel component styles
│   ├── controls.css             # Sliders, gauges, buttons
│   ├── timeline.css             # Epoch timeline styles
│   ├── typography.css           # Font definitions
│   └── animations.css           # CSS keyframe animations
└── assets/
    └── fonts/                   # Self-hosted fonts
```

---

## 10. Gameplay Scenarios

### 10.1 Scenario: "The Standard Universe"
Player starts with canonical parameters (matching our universe). They observe the "expected" evolution and learn what each epoch means. This is the tutorial path.

### 10.2 Scenario: "Crank Up Gravity"
Player increases gravity strength to 1.5G. Result: Universe collapses into massive black holes early. Few galaxies survive. Stars are short-lived giants. Heavy elements are abundant but scattered. Philosophical insight: "Too much attraction and nothing can stand apart long enough to become complex."

### 10.3 Scenario: "No Dark Energy"
Player sets dark energy to zero. Result: Expansion slows, eventually halts. Universe begins contracting. Galaxies merge into mega-clusters. The Big Crunch approaches. Insight: "Without the push of the void, everything falls back into the unity it came from."

### 10.4 Scenario: "Maximize Star Formation"
Player pushes star formation to 2.5x. Result: Gas is consumed quickly. Early galaxy populations are enormous but burn through fuel. Late universe is filled with stellar remnants. Fewer young stars exist in the present era.

### 10.5 Scenario: "The Philosopher's Universe"
Player discovers parameters that produce a universe eerily similar to ours, raising the fine-tuning question. The game records how many attempts it took, how close they got, and presents the anthropic principle.

---

## 11. Progression & Engagement

### 11.1 Discovery System
- First time a player achieves certain outcomes, they unlock "Discoveries"
- Examples: "First Black Hole", "Element Heavier Than Iron", "Life-Compatible Zone"
- Discoveries accumulate in a journal accessible from the Insights view

### 11.2 Philosophical Achievements
| Achievement | Condition | Quote |
|------------|-----------|-------|
| Primordial Thinker | Complete first simulation | "The beginning of wisdom is wonder. — Socrates" |
| Fine Tuner | Match canonical universe within 5% | "God does not play dice. — Einstein" |
| Destroyer of Worlds | Create a universe that collapses | "Now I am become Death. — Oppenheimer" |
| Star Forger | Create 1Q+ stars | "Every atom in your body came from a star that exploded. — Krauss" |
| Void Walker | Create a universe with >90% dark energy | "The silence of the void speaks volumes. — Lao Tzu" |
| Cosmic Gardener | Achieve life-compatible conditions | "The universe is not only queerer than we suppose, but queerer than we can suppose. — Haldane" |

### 11.3 Comparison Mode
- After each simulation, player can compare their universe to the canonical model
- Side-by-side statistics and visual comparison
- Highlights which parameters most affected the outcome

---

## 12. Accessibility

- Full keyboard navigation for all controls
- High-contrast mode option
- Screen reader descriptions for all visualizations
- Colorblind-safe palette alternative
- Adjustable text size
- Reduced motion mode (disables particles and animations)

---

## 13. Future Expansion Possibilities

- **Multiplayer Universes**: Players share and compare simulations online
- **Zooming In**: Drill down from galaxy → solar system → planet
- **Life Emergence Module**: When conditions are right, simulate emergence of life
- **Custom Epochs**: Player-defined events injected into the timeline
- **VR Mode**: Immersive 3D galactic web exploration
- **AI Narrator**: Dynamic narration of the universe's story as it unfolds

---

## 14. Success Metrics

- Player spends >15 minutes on first session
- Player creates >3 different simulation configurations
- Player reads >5 philosophical insights
- Player returns for a second session within a week
- Player shares a simulation result

---

## 15. Summary

Cosmopoeia transforms the abstract grandeur of cosmology into a tangible, interactive experience. By giving players the power to reshape fundamental constants and watching 14.1 billion years of consequences unfold, the game creates genuine moments of wonder and philosophical reflection. It's not just a simulation — it's a conversation with the universe.

---

*"The universe is under no obligation to make sense to you. But what if, by playing with its rules, you start to understand it anyway?"*
