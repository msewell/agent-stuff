# UX, Production Stripping, and Presets

## Table of Contents

- [7. UX Best Practices](#7-ux-best-practices)
- [8. Production Stripping](#8-production-stripping)
- [9. Preset and Export Patterns](#9-preset-and-export-patterns)

---

## 7. UX Best Practices

### Panel Design

- **Float the panel** — Position it fixed in a corner (top-right is conventional). It must not block the content being tuned.
- **Make it collapsible** — The panel should minimize to an icon/button so the user can see the full result without obstruction.
- **Dark theme** — Tuning panels conventionally use dark backgrounds to visually separate them from the content being designed. This also reduces visual interference with the thing being tuned.
- **Group related controls into folders** — Nest animation params in one folder, colors in another, layout in a third. Start secondary groups collapsed.
- **Order controls by importance** — Put the most-tuned parameters at the top.
- **Keep the panel narrow** — 260-300px wide is standard. This leaves most of the viewport for the content.

### Slider UX

- **Always pair sliders with a displayed value** — Show the current numeric value next to the slider label.
- **Allow direct text editing** — Let users click the value to type a precise number. Sliders are for exploration; text input is for precision.
- **Choose appropriate step values** — Too fine (0.001 for pixels) makes sliders twitchy. Too coarse (10 for opacity) makes them useless. Match the step to the parameter's perceptible granularity.
- **Use sensible ranges** — The range should cover the useful design space. Too wide and the slider becomes imprecise in the useful zone. Too narrow and the user hits the walls.
- **Provide immediate visual feedback** — The controlled element must update in real time as the user drags. If the update is expensive, debounce to ~16ms (one frame) rather than skipping frames.

### Performance

- **Use transient/non-rendering updates where possible** — Leva's `onChange` handler and Tweakpane's `change` event can update DOM directly without triggering a React re-render.
- **Debounce expensive operations** — If changing a parameter triggers a layout recalculation, WebGL re-render, or network request, use `onFinishChange` (fires when the user releases the slider) instead of continuous updates.
- **Avoid re-creating the panel on every render** — In React, define the schema outside the component or memoize it. DialKit and Leva both handle this, but manual setups can accidentally recreate panels.

### Accessibility During Development

Even though this is a dev tool, basic accessibility helps usability:
- Sliders should be keyboard-navigable (native `<input type="range">` handles this)
- Labels should clearly describe what each control affects
- Color pickers should show the hex/rgb value, not just a swatch

---

## 8. Production Stripping

Tuning panels are development tools. They must not ship to production. Approaches, from simplest to most robust:

### Environment Check (Simplest)

```tsx
// React
function App() {
  return (
    <>
      <MyContent />
      {process.env.NODE_ENV === 'development' && <DialRoot />}
    </>
  );
}
```

This works for the panel root component. The `useDialKit` / `useControls` hooks will return default values when the panel isn't mounted, so the application code still works.

### Dynamic Import (Better Tree Shaking)

```tsx
// Only import the panel library in development
let TuningPanel = () => null;
if (process.env.NODE_ENV === 'development') {
  TuningPanel = React.lazy(() => import('./TuningPanel'));
}
```

### Separate Entry Point (Most Robust)

Create a `dev.tsx` wrapper that adds the panel, and a `prod.tsx` that doesn't. Configure your bundler to use the appropriate entry point.

### Build-Time Removal

For non-React projects, wrap the entire panel setup in a block that bundlers can eliminate:

```js
if (process.env.NODE_ENV !== 'production') {
  const { Pane } = await import('tweakpane');
  const pane = new Pane({ title: 'Tuning' });
  // ... setup controls
}
```

Modern bundlers (Vite, webpack in production mode, Rspack) will dead-code-eliminate the entire block and tree-shake the unused import.

### Key Principle

The application code should use the tuned values via normal variables or state. The panel is an *input mechanism* for those variables, not a dependency. When the panel is removed, the variables keep their default/committed values and the app works identically.

---

## 9. Preset and Export Patterns

### Presets (Save / Load Parameter Sets)

Presets let users save a set of tuned values and switch between them to compare variations.

**Built-in support:**
- **DialKit** — Built-in version dropdown. Click "+" to save current state. Select a version to load it. "Version 1" is always the original defaults.
- **Theatre.js** — Full keyframe timeline with export to JSON.

**Manual preset pattern (any library):**

```js
const presets = {
  subtle: { blur: 4, offsetY: 2, opacity: 0.8, duration: 0.2 },
  dramatic: { blur: 24, offsetY: 12, opacity: 1.0, duration: 0.6 },
  playful: { blur: 8, offsetY: -8, opacity: 0.9, duration: 0.4 },
};

// Add a dropdown to switch presets
pane.addBinding(state, 'preset', {
  options: Object.fromEntries(
    Object.keys(presets).map(k => [k, k])
  ),
}).on('change', ({ value }) => {
  Object.assign(params, presets[value]);
  pane.refresh(); // Update all controls to reflect new values
});
```

### Export Patterns

**Copy to clipboard (JSON):**

```js
// Add an export button
const btn = pane.addButton({ title: 'Copy Values' });
btn.on('click', () => {
  navigator.clipboard.writeText(JSON.stringify(params, null, 2));
});
```

**Copy as CSS custom properties:**

```js
btn.on('click', () => {
  const css = Object.entries(params)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n');
  navigator.clipboard.writeText(`:root {\n${css}\n}`);
});
```

**Copy as a code snippet:**

```js
btn.on('click', () => {
  const code = Object.entries(params)
    .map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`)
    .join('\n');
  navigator.clipboard.writeText(code);
});
```

**Log on every change (for grabbing from devtools):**

```js
pane.on('change', () => {
  console.log('Current values:', JSON.stringify(params, null, 2));
});
```

---

