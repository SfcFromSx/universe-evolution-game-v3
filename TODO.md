# COSMOPOEIA — Development Task List

## Phase 1: Foundation & Infrastructure
- [x] Write Game Design Document (GDD)
- [x] Review GDD (3 passes)
- [ ] **1.1 Project Setup**
  - [ ] Create project directory structure
  - [ ] Create `index.html` entry point
  - [ ] Create `package.json` with metadata and dev scripts
  - [ ] Set up CSS variables and global styles (`main.css`, `typography.css`)
  - [ ] Set up layout grid system (`layout.css`)
  - [ ] Create animation keyframes (`animations.css`)
- [ ] **1.2 Core Architecture**
  - [ ] Implement `EventBus.js` — pub/sub event system
  - [ ] Implement `StateStore.js` — centralized state management
  - [ ] Implement `Engine.js` — main game loop (tick, update, render cycle)
  - [ ] Create `constants.js` — physical constants & default parameters
  - [ ] Create `epochs.js` — epoch definitions with metadata

## Phase 2: Simulation Engine
- [ ] **2.1 Physics & Cosmology**
  - [ ] Implement `Physics.js` — Friedmann equations, scale factor evolution
  - [ ] Implement temperature evolution model
  - [ ] Implement density evolution (matter, radiation, dark energy)
  - [ ] Implement entropy calculation
- [ ] **2.2 Universe State**
  - [ ] Implement `Universe.js` — master universe state object
  - [ ] Implement `EpochManager.js` — epoch detection & transition logic
  - [ ] Implement time-stepping (variable dt based on epoch)
- [ ] **2.3 Galaxy & Structure Formation**
  - [ ] Implement `Nucleosynthesis.js` — elemental abundance calculation
  - [ ] Implement `GalaxyGenerator.js` — procedural galaxy creation
  - [ ] Implement `CosmicWeb.js` — filament & cluster generation
  - [ ] Create `galaxyNames.js` — name pool for generated galaxies

## Phase 3: UI Framework
- [ ] **3.1 App Shell**
  - [ ] Implement `App.js` — root component, view routing
  - [ ] Implement `Sidebar.js` — navigation sidebar with icons
  - [ ] Style sidebar (`sidebar.css`)
  - [ ] Implement view switching logic
- [ ] **3.2 Reusable Components**
  - [ ] Implement `Graph.js` — canvas-based line/area chart
  - [ ] Implement `Gauge.js` — circular gauge component
  - [ ] Implement `Slider.js` — custom horizontal slider
  - [ ] Implement `DonutChart.js` — donut/pie chart
  - [ ] Implement `NodeGraph.js` — force-directed graph renderer
  - [ ] Implement `Tooltip.js` — hover tooltip component
  - [ ] Implement `Modal.js` — modal dialog
  - [ ] Style all controls (`controls.css`)

## Phase 4: Dashboard Panels
- [ ] **4.1 Universal Metrics Panel**
  - [ ] Build entropy line chart (Total Entropy S/kB vs BYA)
  - [ ] Build thermodynamic state waveform visualization
  - [ ] Build CMB fluctuation visualization
  - [ ] Style panel (`panels.css`)
- [ ] **4.2 Elemental Distribution Panel**
  - [ ] Build donut chart with H/He/Heavy segments
  - [ ] Build atom visualization with orbital animations
  - [ ] Dynamic updates from simulation state
- [ ] **4.3 Stats Bar**
  - [ ] Build three-metric display (Galaxies, Temperature, Stars)
  - [ ] Implement animated number counters
  - [ ] Number formatting utilities (T, Q, K suffixes)
- [ ] **4.4 Galactic Web (Center Panel)**
  - [ ] Build force-directed node layout engine
  - [ ] Render galaxy nodes (sized by mass, colored by type)
  - [ ] Render filament edges with glow effects
  - [ ] Add labels (galaxy name, redshift, property)
  - [ ] Implement zoom, pan, and selection
  - [ ] Add node hover details
  - [ ] Add view mode toggle (Node-Graph dropdown)
  - [ ] Add cluster identification label
- [ ] **4.5 Cosmic Parameters Panel**
  - [ ] Build gravity strength gauge
  - [ ] Build dark matter density gauge
  - [ ] Build cosmic expansion rate display (H₀ animation)
  - [ ] Build star formation rate slider
  - [ ] Build photon density slider
  - [ ] Build dark energy (Λ) slider
  - [ ] Wire parameter changes to simulation re-run
- [ ] **4.6 Epoch Timeline**
  - [ ] Build horizontal timeline bar with epoch markers
  - [ ] Build draggable scrubber/playhead
  - [ ] Build epoch cards below timeline with stats
  - [ ] Add play/pause/speed controls
  - [ ] Implement epoch click-to-jump
  - [ ] Style timeline (`timeline.css`)

## Phase 5: Secondary Views
- [ ] **5.1 Data View**
  - [ ] Build sortable data table component
  - [ ] Populate with galaxy catalog data
  - [ ] Add filtering and search
  - [ ] Add column sorting
- [ ] **5.2 Reports View**
  - [ ] Build report card component
  - [ ] Auto-generate milestone reports from simulation
  - [ ] Build comparative report (vs canonical universe)
- [ ] **5.3 Simulations View**
  - [ ] Build save/load UI
  - [ ] Implement localStorage persistence
  - [ ] Build simulation comparison grid
  - [ ] Build parameter diff display
- [ ] **5.4 Insights View**
  - [ ] Create `philosophicalQuotes.js` — curated quotes by epoch
  - [ ] Build insight card component
  - [ ] Build discovery journal
  - [ ] Build achievement display

## Phase 6: Visual Polish & Effects
- [ ] **6.1 Rendering Pipeline**
  - [ ] Implement `CanvasRenderer.js` — multi-layer canvas management
  - [ ] Implement `ParticleSystem.js` — background cosmic dust
  - [ ] Implement `GlowEffect.js` — bloom/glow for nodes and edges
  - [ ] Implement `Animations.js` — tweening library (lerp, easeInOut)
- [ ] **6.2 Visual Refinement**
  - [ ] Add smooth data transitions (counters, graphs, gauges)
  - [ ] Add epoch transition "cosmic flash" effect
  - [ ] Add subtle pulsing on interactive elements
  - [ ] Polish color consistency across all panels
  - [ ] Responsive layout adjustments

## Phase 7: Onboarding & Game Feel
- [ ] **7.1 Welcome Experience**
  - [ ] Build welcome screen with cinematic text
  - [ ] Build guided tour tooltip system
  - [ ] Implement first-run auto-simulation
- [ ] **7.2 Achievements & Discoveries**
  - [ ] Implement discovery detection system
  - [ ] Build achievement unlock notifications
  - [ ] Implement achievement persistence
- [ ] **7.3 Philosophical Integration**
  - [ ] Trigger philosophical prompts at epoch milestones
  - [ ] Build insight notification system
  - [ ] Connect quotes to simulation events

## Phase 8: Testing & Final Polish
- [ ] **8.1 Testing**
  - [ ] Test all parameter ranges for simulation stability
  - [ ] Test edge cases (extreme parameters, rapid changes)
  - [ ] Test all view transitions
  - [ ] Cross-browser testing
- [ ] **8.2 Performance**
  - [ ] Profile and optimize canvas rendering
  - [ ] Optimize simulation calculations
  - [ ] Ensure 60fps during normal interaction
- [ ] **8.3 Final Polish**
  - [ ] Review all text for clarity
  - [ ] Verify all panel interactions
  - [ ] Final visual consistency pass
  - [ ] Add keyboard shortcuts
