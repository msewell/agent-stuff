# Concepts and Library Selection

## Table of Contents

- [1. What Is a Tuning Panel](#1-what-is-a-tuning-panel)
- [2. When to Build One](#2-when-to-build-one)
- [3. The Iteration Workflow](#3-the-iteration-workflow)
- [4. Library Selection Guide](#4-library-selection-guide)

---

## 1. What Is a Tuning Panel

A tuning panel is a **developer-facing floating GUI** that exposes hardcoded or state-driven values as interactive controls. Instead of changing a value in source code, saving, and waiting for a rebuild, the user drags a slider and sees the result immediately.

The pattern originates from creative coding, game development, and motion design tools — environments where parameters like spring tension, shadow blur, or font size need rapid visual exploration. The core idea: **separate the act of choosing a value from the act of writing code**.

A tuning panel is NOT:
- A production settings UI for end users
- A component library or design system tool
- A replacement for Storybook (though it complements it)

It IS:
- A temporary, disposable development aid
- A visual feedback loop accelerator
- A way to explore a parameter space quickly, then commit the chosen values

---

## 2. When to Build One

Build a tuning panel when the user is working on something where **the correct value is found by eye, not by calculation**. Key signals:

| Signal | Examples |
|--------|----------|
| **Animation timing** | Spring stiffness, duration, delay, easing curves, bounce |
| **Visual styling** | Shadow blur/spread/offset, border radius, opacity, gradients |
| **Layout tuning** | Spacing, padding, gap, max-width, aspect ratio |
| **Typography** | Font size, line height, letter spacing, font weight |
| **Color exploration** | Accent colors, background tints, overlay opacity |
| **Physics / motion** | Velocity, damping, mass, friction, gravity |
| **Responsive breakpoints** | Testing how a layout feels at different container widths |
| **Data visualization** | Axis ranges, tick counts, curve tension, point sizes |
| **Audio / video** | Playback rate, volume curves, crossfade duration |

Do NOT build a tuning panel when:
- The value is computed (e.g., derived from data)
- The value is a business rule (e.g., max retries = 3)
- The user just needs to change one constant once — a code edit is faster

---

## 3. The Iteration Workflow

The tuning panel enables a tight loop:

```
1. Identify parameters    — Find magic numbers, style values, animation configs
2. Wire up the panel      — Expose them as controls with sensible ranges
3. Tweak live             — Drag sliders, toggle options, pick colors
4. Compare variations     — Use presets to save and switch between candidates
5. Export / commit values — Copy the final values back into source code
6. Remove the panel       — Strip it out or gate it behind a dev flag
```

### Step 1: Identify Parameters

Scan the relevant code for:
- Numeric literals in style objects, animation configs, or layout calculations
- Color hex/rgb strings
- Boolean flags controlling visual variants
- String enums selecting between modes or styles
- Spring/easing configurations

### Step 5: Export Values

The goal is to get the chosen values back into source code. Approaches:
- **Copy JSON** — Most panel libraries support copying current values as JSON. The user pastes this into their config.
- **Copy as code** — Some libraries (like DialKit) can copy values formatted as a prompt or code snippet.
- **Console log** — Log the final values object on change so the user can grab it from devtools.
- **URL params** — Encode values in the URL hash for shareable states.

---

## 4. Library Selection Guide

### Decision Matrix

```
Is the project React-based?
  YES -> Does it use Motion (Framer Motion) for animations?
    YES -> DialKit (purpose-built for this, has spring editor, presets, agent-friendly export)
    NO  -> Leva (most mature React GUI, hooks-based, broadest control types)
  NO  -> Is it a specific framework?
    Svelte  -> Svelte Tweakpane UI (native Svelte bindings for Tweakpane)
    Solid   -> DialKit (has Solid support via createDialKit)
    Vue / Angular / Other -> Tweakpane (vanilla JS, framework-agnostic)
    Vanilla JS -> Tweakpane (best vanilla API) or lil-gui (simplest, dat.gui successor)
  Need full timeline/keyframe editing?
    YES -> Theatre.js (visual sequence editor, keyframes, curve editor)
  Working within Storybook already?
    YES -> Use the built-in Controls addon for component-level parameter exploration
  Need zero dependencies? Extremely lightweight?
    YES -> Build a custom panel with native HTML range inputs + CSS custom properties
```

### Library Comparison

| Library | Stack | Weekly Downloads | Key Strength | Best For |
|---------|-------|-----------------|--------------|----------|
| **DialKit** | React, Solid, Svelte | New (2025) | Spring editor, presets, agent-friendly copy, auto-detection | Animation-heavy React projects, AI-agent workflows |
| **Leva** | React | ~212K | Broadest React integration, hooks API, plugin system, theming | General-purpose React tuning |
| **Tweakpane** | Vanilla JS | ~205K | Clean API, rich plugin ecosystem, zero deps, framework-agnostic | Non-React projects, vanilla JS, any framework |
| **lil-gui** | Vanilla JS | ~118K | Simplest API, drop-in dat.gui replacement | Quick prototyping, Three.js projects |
| **Theatre.js** | Any | Moderate | Full timeline editor, keyframes, curve editor, sequence scrubbing | Complex choreographed animations, cinematic sequences |
| **Storybook Controls** | Any (via Storybook) | N/A (bundled) | Auto-generated from component props/args | Component-level exploration within Storybook |

### Library Details

#### DialKit
- Install: `npm install dialkit motion`
- Mount `<DialRoot />` at app root, import `dialkit/styles.css`
- Primary hook: `useDialKit(name, config, options?)`
- Auto-detects control types from values: numbers become sliders, booleans become toggles, hex strings become color pickers
- Spring editor with time mode (visualDuration + bounce) and physics mode (stiffness + damping + mass)
- Built-in preset/version system with save, load, and auto-save
- Copy button exports current values as JSON
- Supports React, Solid (`createDialKit`), and Svelte
- Folders via nested objects; `_collapsed: true` to start closed
- Action buttons for triggering callbacks

#### Leva
- Install: `npm install leva`
- Primary hook: `useControls(schema)` — auto-generates panel
- Optional `<Leva>` component for panel configuration
- Transient updates via `onChange` (no re-render) for performance
- Controlled inputs via setter function from `useControls`
- Plugin system for custom input types
- Folder support, conditional rendering, theming

#### Tweakpane
- Install: `npm install tweakpane`
- Imperative API: `new Pane()`, then `pane.addBinding(obj, 'key', opts)`
- "Blade" architecture — each row is a blade (input, monitor, separator, folder)
- Plugin system: `@tweakpane/plugin-essentials` adds interval, FPS graph, radio grid
- ES modules from v4; CommonJS users should use v3
- TypeScript support with blade type casting

#### lil-gui
- Install: `npm install lil-gui`
- Simplest API: `new GUI()`, then `gui.add(obj, 'key', min, max)`
- Drop-in replacement for dat.gui
- `onChange` (continuous) and `onFinishChange` (debounced) handlers
- Folder support via `gui.addFolder('name')`

#### Theatre.js
- Install: `npm install @theatre/core @theatre/studio`
- Studio is the visual editor; core is the runtime player
- Full keyframe timeline with sequence scrubbing
- Graph/curve editor for easing
- Exports animation state as JSON for version control
- Heavier than other options — use when you need true timeline/sequencing

---

