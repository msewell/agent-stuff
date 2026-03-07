---
name: building-tuning-panels
description: Builds live parameter tuning panels as floating developer overlays with sliders, toggles, color pickers, dropdowns, and spring controls wired to app values for real-time visual exploration. Selects suitable panel libraries by stack (DialKit, Leva, Tweakpane, lil-gui, native HTML), maps hardcoded values to controls with sensible ranges, adds export/presets, and strips panel code from production builds. Use when users ask to add debug sliders, a variables panel, a tuning panel/GUI, or live tweak controls for animation, styling, layout, typography, color, physics, or chart parameters.
category: Software Engineering
---

# Building Tuning Panels

## Quick start workflow

1. Read the target code and extract tunable values:
   - numeric literals in styling/animation/layout
   - color literals
   - booleans for visual variants
   - enums/modes
   - spring/easing configs
2. Choose one default panel library using the routing rules below.
3. Create controls with defaults set to current code values.
4. Infer sensible ranges and steps (see [Control ranges](#control-ranges-defaults)).
5. Wire controls directly to rendered values so updates are immediate.
6. Add one export path (JSON copy button preferred; console fallback).
7. Gate panel to development-only and keep runtime behavior unchanged without it.

## Library routing defaults

Choose a single default; do not list many options unless needed:

1. If React + Motion/Framer Motion is present: use **DialKit**.
2. Else if React: use **Leva**.
3. Else if project already has `tweakpane` or `lil-gui`: use the installed one.
4. Else if vanilla/no framework: use **Tweakpane**.
5. Else if no package manager / zero-dependency requirement: use native HTML controls + CSS custom properties.
6. Use Theatre.js only when timeline/keyframe editing is explicitly required.

For detailed selection criteria and library capabilities, read:
- [references/01-concepts-and-library-selection.md](references/01-concepts-and-library-selection.md)

## Control mapping defaults

Map value types to controls:

- Number with clear bounds → slider (`min`, `max`, `step` required)
- Number without practical bounds → numeric input
- Integer → slider with `step=1`
- 0–1 number → slider with `step=0.01`
- Boolean → toggle
- Color string (hex/rgb/hsl) → color picker + text value
- Enum string → select/dropdown
- Free text → text input
- Action/callback → button
- Related parameters → collapsible folder/group

Always show current numeric values near sliders.

## Control ranges defaults

When user does not specify ranges, infer from context and current value:

| Parameter | Min | Max | Step |
|---|---:|---:|---:|
| Duration (s) | 0 | 5 | 0.05 |
| Delay (s) | 0 | 3 | 0.05 |
| Opacity | 0 | 1 | 0.01 |
| Scale | 0 | 3 | 0.01 |
| Rotation (deg) | -360 | 360 | 1 |
| Blur (px) | 0 | 100 | 1 |
| Border radius (px) | 0 | 100 | 1 |
| Font size (px) | 8 | 120 | 1 |
| Line height | 0.8 | 3 | 0.05 |
| Gap / spacing (px) | 0 | 200 | 1 |
| Spring stiffness | 1 | 1000 | 1 |
| Spring damping | 1 | 100 | 1 |
| Spring mass | 0.1 | 10 | 0.1 |
| Hue (deg) | 0 | 360 | 1 |
| Count/grid columns | 1 | 12 | 1 |

Fallback when uncertain for positive values: roughly `[current*0.25, current*3]`, then choose a step that yields ~50–200 positions.

## Wiring rules

- Keep controls close to where values are consumed.
- In React, use returned control values directly in JSX/style/animation props.
- In vanilla JS, update DOM/CSS variables in change handlers.
- Ensure live feedback while dragging; debounce only expensive operations.

Implementation examples by stack:
- [references/02-implementation-patterns.md](references/02-implementation-patterns.md)

## Panel UX defaults

- Float panel in a corner (top-right default), 260–300px width.
- Make panel collapsible.
- Group controls by concern: animation, layout, typography, color.
- Put high-frequency controls at top level; start secondary groups collapsed.
- Allow precision editing (typed numeric input) in addition to dragging.

More UX and performance guidance:
- [references/03-ux-production-presets.md](references/03-ux-production-presets.md)

## Export and presets defaults

Always provide at least one export path:

1. Preferred: copy current state as JSON.
2. Optional: copy as CSS vars or code snippet.
3. Fallback: log current values object to console.

When exploration is broad, add presets for side-by-side comparison.

## Production stripping

Treat panel code as a development tool:

- Gate mounting and setup to development environment.
- Keep app behavior correct when panel is absent.
- Prefer dead-code-eliminable dynamic imports when available.

## Scaffolding behavior for user requests

When user asks "add sliders/tuning panel/debug controls":

1. Inspect relevant files first.
2. List candidate parameters and proposed controls.
3. State chosen library and why (one-line rationale).
4. Implement minimal panel with top-priority controls first.
5. Add folders for secondary controls.
6. Add export button/logging.
7. Gate for development-only.
8. Summarize where tuned values live and how to commit them.

## Delivery checklist

Before finalizing, verify all items:

- [ ] Selected exactly one default library with a clear rationale
- [ ] Mapped each hardcoded tunable value to an appropriate control type
- [ ] Set defaults from current code values
- [ ] Chosen sensible ranges and steps
- [ ] Wired live updates with acceptable performance
- [ ] Added at least one export path (JSON preferred)
- [ ] Grouped controls and collapsed secondary sections
- [ ] Gated panel code to development-only behavior

For extended recipes and end-to-end scaffolding examples, read:
- [references/04-recipes-and-scaffolding.md](references/04-recipes-and-scaffolding.md)
