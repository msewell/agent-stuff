# Implementation Patterns by Stack

## Table of Contents

- [React + DialKit](#react--dialkit)
- [React + Leva](#react--leva)
- [Vanilla JS + Tweakpane](#vanilla-js--tweakpane)
- [Vanilla JS + lil-gui](#vanilla-js--lil-gui)
- [Zero-Dependency: Native HTML + CSS Custom Properties](#zero-dependency-native-html--css-custom-properties)
- [Storybook Controls](#storybook-controls)

---

## 6. Implementation Patterns by Stack

### React + DialKit

```tsx
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';

// In root layout — mount once
export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <DialRoot position="top-right" defaultOpen />
    </>
  );
}
```

```tsx
import { useDialKit } from 'dialkit';
import { motion } from 'motion/react';

function AnimatedCard() {
  const p = useDialKit('Card Animation', {
    // Numbers become sliders (auto-ranged)
    offsetY: [0, -200, 200],
    blur: [24, 0, 100],
    scale: [1, 0.5, 1.5],
    // Booleans become toggles
    visible: true,
    // Hex strings become color pickers
    shadowColor: '#00000040',
    // Objects become dropdown selects
    easing: {
      type: 'select',
      options: ['ease-in', 'ease-out', 'ease-in-out', 'linear'],
      default: 'ease-out',
    },
    // Spring configs get a visual spring editor
    spring: { type: 'spring', visualDuration: 0.4, bounce: 0.15 },
    // Nested objects become collapsible folders
    shadow: {
      offsetX: [0, -30, 30],
      offsetY: [8, 0, 30],
      spread: [0, 0, 30],
    },
  });

  return (
    <motion.div
      animate={{ y: p.offsetY, scale: p.scale }}
      transition={p.spring}
      style={{
        filter: `blur(${p.blur}px)`,
        boxShadow: `${p.shadow.offsetX}px ${p.shadow.offsetY}px ${p.shadow.spread}px ${p.shadowColor}`,
        display: p.visible ? 'block' : 'none',
      }}
    />
  );
}
```

### React + Leva

```tsx
import { useControls } from 'leva';

function AnimatedCard() {
  const {
    offsetY, blur, scale, visible, shadowColor, easing
  } = useControls('Card Animation', {
    offsetY: { value: 0, min: -200, max: 200, step: 1 },
    blur: { value: 24, min: 0, max: 100, step: 1 },
    scale: { value: 1, min: 0.5, max: 1.5, step: 0.01 },
    visible: true,
    shadowColor: '#00000040',
    easing: {
      value: 'ease-out',
      options: ['ease-in', 'ease-out', 'ease-in-out', 'linear'],
    },
  });

  // Use values directly — they update reactively
  return (
    <div style={{
      transform: `translateY(${offsetY}px) scale(${scale})`,
      filter: `blur(${blur}px)`,
      display: visible ? 'block' : 'none',
    }} />
  );
}
```

### Vanilla JS + Tweakpane

```js
import { Pane } from 'tweakpane';

const params = {
  offsetY: 0,
  blur: 24,
  scale: 1.0,
  visible: true,
  shadowColor: '#00000066',
  easing: 'ease-out',
};

const pane = new Pane({ title: 'Card Animation' });

pane.addBinding(params, 'offsetY', { min: -200, max: 200, step: 1 });
pane.addBinding(params, 'blur', { min: 0, max: 100, step: 1 });
pane.addBinding(params, 'scale', { min: 0.5, max: 1.5, step: 0.01 });
pane.addBinding(params, 'visible');
pane.addBinding(params, 'shadowColor');
pane.addBinding(params, 'easing', {
  options: {
    'Ease In': 'ease-in',
    'Ease Out': 'ease-out',
    'Ease In-Out': 'ease-in-out',
    'Linear': 'linear',
  },
});

// Listen for changes
pane.on('change', () => {
  updateCard(params);
});
```

### Vanilla JS + lil-gui

```js
import GUI from 'lil-gui';

const params = {
  offsetY: 0,
  blur: 24,
  scale: 1.0,
  visible: true,
  shadowColor: '#000000',
  easing: 'ease-out',
};

const gui = new GUI({ title: 'Card Animation' });
gui.add(params, 'offsetY', -200, 200, 1);
gui.add(params, 'blur', 0, 100, 1);
gui.add(params, 'scale', 0.5, 1.5, 0.01);
gui.add(params, 'visible');
gui.addColor(params, 'shadowColor');
gui.add(params, 'easing', ['ease-in', 'ease-out', 'ease-in-out', 'linear']);

gui.onChange(() => {
  updateCard(params);
});
```

### Zero-Dependency: Native HTML + CSS Custom Properties

When no library is available or desired, build a minimal panel with native elements. This works in any context — no framework, no build tool, no npm.

```html
<div id="tuning-panel" style="
  position: fixed; top: 16px; right: 16px; z-index: 99999;
  background: #1a1a2e; color: #e0e0e0; padding: 16px;
  border-radius: 12px; font-family: system-ui, sans-serif;
  font-size: 13px; min-width: 260px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
">
  <div style="text-transform: uppercase; font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em; color: #888; margin-bottom: 12px;">
    Animation Controls
  </div>

  <label style="display: flex; justify-content: space-between; margin-bottom: 4px;">
    Duration
    <output id="duration-val">0.3s</output>
  </label>
  <input type="range" min="0.05" max="2" step="0.05" value="0.3"
    oninput="
      document.documentElement.style.setProperty('--duration', this.value + 's');
      document.getElementById('duration-val').textContent = this.value + 's';
    "
    style="width: 100%; accent-color: #6366f1; margin-bottom: 12px;"
  />

  <label style="display: flex; justify-content: space-between; margin-bottom: 4px;">
    Shadow blur
    <output id="blur-val">12px</output>
  </label>
  <input type="range" min="0" max="60" step="1" value="12"
    oninput="
      document.documentElement.style.setProperty('--shadow-blur', this.value + 'px');
      document.getElementById('blur-val').textContent = this.value + 'px';
    "
    style="width: 100%; accent-color: #6366f1; margin-bottom: 12px;"
  />

  <label style="display: flex; justify-content: space-between; margin-bottom: 4px;">
    Accent color
  </label>
  <input type="color" value="#6366f1"
    oninput="document.documentElement.style.setProperty('--accent', this.value);"
    style="width: 100%; height: 32px; border: none; margin-bottom: 12px;"
  />
</div>
```

Then use the CSS custom properties in your styles:

```css
.card {
  transition-duration: var(--duration, 0.3s);
  box-shadow: 0 4px var(--shadow-blur, 12px) rgba(0,0,0,0.2);
  border-color: var(--accent, #6366f1);
}
```

This pattern is the most portable, requires zero tooling, and works in any HTML page.

### Storybook Controls

For component-level exploration within Storybook:

```tsx
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    borderRadius: { control: { type: 'range', min: 0, max: 24, step: 1 } },
    backgroundColor: { control: 'color' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export const Playground = {
  args: {
    size: 'md',
    borderRadius: 8,
    backgroundColor: '#6366f1',
    disabled: false,
    label: 'Click me',
  },
};
```

Storybook auto-generates the controls panel from `argTypes`. Use this for component isolation; use a tuning panel (DialKit/Leva/Tweakpane) for full-page or multi-component tuning in the running app.

---

