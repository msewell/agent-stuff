# Use Case Recipes and Scaffolding

## Table of Contents

- [10. Use Case Recipes](#10-use-case-recipes)
- [11. Scaffolding a Panel From a User Description](#11-scaffolding-a-panel-from-a-user-description)

---

## 10. Use Case Recipes

### Animation Timing

Parameters to expose:
- `duration` (0–3s, step 0.05)
- `delay` (0–2s, step 0.05)
- `staggerDelay` (0–0.5s, step 0.01) for sequential animations
- `easing` — dropdown: ease-in, ease-out, ease-in-out, linear, or a spring config
- `spring` — spring editor (visualDuration + bounce, or stiffness + damping + mass)
- `loopCount` (1–10, step 1, or Infinity toggle)

Group into: Entrance, Exit, Hover, and Looping folders.

### Box Shadows and Elevation

Parameters to expose:
- `shadowOffsetX` (-30–30px)
- `shadowOffsetY` (0–30px)
- `shadowBlur` (0–60px)
- `shadowSpread` (-20–20px)
- `shadowColor` (color picker with alpha)
- Multiple shadow layers if needed (folder per layer)

### Typography Scale

Parameters to expose:
- `baseFontSize` (12–20px)
- `scaleRatio` (1.1–1.618, step 0.01) — for modular scales
- `lineHeight` (1.0–2.0, step 0.05)
- `letterSpacing` (-0.05–0.2em, step 0.005)
- `fontWeight` — dropdown: 100–900 in steps of 100
- `paragraphSpacing` (0–2em, step 0.1)

Wire these to CSS custom properties so all text updates simultaneously.

### Spacing and Layout

Parameters to expose:
- `containerMaxWidth` (600–1400px)
- `sectionPadding` (16–120px)
- `cardGap` (8–48px)
- `gridColumns` (1–6, step 1)
- `borderRadius` (0–32px)
- `aspectRatio` — dropdown: 1/1, 4/3, 16/9, 3/2, or custom slider

### Color Theme Exploration

Parameters to expose:
- `primaryColor` (color picker)
- `secondaryColor` (color picker)
- `backgroundColor` (color picker)
- `surfaceColor` (color picker)
- `textColor` (color picker)
- `accentHue` (0–360, step 1) — for HSL-based theme generation
- `saturation` (0–100%)
- `contrastRatio` (slider, for calculating accessible text colors)

### Motion / Physics Simulation

Parameters to expose:
- `gravity` (0–20, step 0.1)
- `friction` (0–1, step 0.01)
- `restitution` / `bounciness` (0–1, step 0.01)
- `initialVelocityX`, `initialVelocityY` (-500–500)
- `mass` (0.1–10)

### Data Visualization

Parameters to expose:
- `curveType` — dropdown: linear, monotone, cardinal, step
- `curveTension` (0–1, step 0.01)
- `pointRadius` (0–10)
- `strokeWidth` (0.5–5, step 0.5)
- `axisPadding` (0–50px)
- `tickCount` (2–20, step 1)
- `animationDuration` (0–2s)

---

## 11. Scaffolding a Panel From a User Description

When a user asks you to build a tuning panel, follow this process:

### Step 1: Read the Existing Code

Before writing anything, read the files the user is working on. Identify:
- All hardcoded numeric values in styles, animation configs, and layout props
- Color values (hex, rgb, hsl)
- Boolean flags that toggle visual states
- String enums that switch between modes
- Spring/easing configurations

### Step 2: Choose the Right Library

Check what's already in the project:
- If `motion` or `framer-motion` is installed → prefer **DialKit**
- If React but no motion library → prefer **Leva**
- If `tweakpane` or `lil-gui` is already installed → use what's there
- If no package manager / vanilla HTML → use the **native HTML panel** pattern
- If the user specifies a library → use that

If no library is installed and the project uses a package manager, ask the user which they prefer or recommend one based on the decision matrix above.

### Step 3: Determine Parameter Ranges

For each parameter:
1. Use the current value as the default
2. Consult `SKILL.md` → "Control ranges defaults" for baseline heuristics
3. If uncertain, use a range of roughly [currentValue * 0.25, currentValue * 3] for positive numbers, centered on currentValue
4. Pick a step that gives ~50-200 distinct positions across the range

### Step 4: Group Parameters Logically

Organize into folders/sections:
- Group by visual concern (animation, colors, layout, typography)
- Put the most important/frequently-tweaked parameters first and at the top level
- Put secondary parameters in collapsed folders

### Step 5: Wire It Up

Connect each control to the actual value it affects:
- In React: use the returned values from the hook directly in JSX
- In vanilla JS: update the DOM in the change handler
- For CSS properties: set CSS custom properties on `:root` or the relevant element

### Step 6: Add Export

Include a way to get the values out:
- DialKit has built-in copy
- For other libraries, add a "Copy" button that writes JSON to the clipboard
- Log values to the console as a fallback

### Example: User Says "Add sliders to tune this card animation"

Given this existing code:

```tsx
<motion.div
  animate={{ y: -8, scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  style={{
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    borderRadius: 12,
  }}
>
```

You would produce:

```tsx
const p = useDialKit('Card Hover', {
  y: [-8, -50, 0],
  scale: [1.02, 1.0, 1.2],
  spring: { type: 'spring', stiffness: 300, damping: 20, mass: 1 },
  shadow: {
    offsetY: [8, 0, 30],
    blur: [24, 0, 60],
    opacity: [0.15, 0, 0.5],
  },
  borderRadius: [12, 0, 32],
});

<motion.div
  animate={{ y: p.y, scale: p.scale }}
  transition={p.spring}
  style={{
    boxShadow: `0 ${p.shadow.offsetY}px ${p.shadow.blur}px rgba(0,0,0,${p.shadow.opacity})`,
    borderRadius: p.borderRadius,
  }}
>
```

Every hardcoded value is now a live control. The user can drag sliders to explore the parameter space, save presets to compare variations, and copy the final values back into the code.

---

