---
name: framer-motion
description: Expert guidance for high-performance, accessible animations using Motion (formerly Framer Motion). Use when creating or refining UI transitions, layout animations, or complex component interactions in React.
---

# Framer Motion Expert

## Core Mandates

- **Modern API**: Always use `motion/react` (v11+). Import from `motion/react`.
- **Performance**: Animate only `opacity` and `transform` (`x`, `y`, `scale`, `rotate`).
- **GPU Optimization**: Apply `style={{ willChange: "transform, opacity" }}` for frequent animations.
- **Layout**: Use the `layout` prop for size/position changes; use `layoutId` for shared element transitions.
- **Accessibility**: Respect `useReducedMotion`. Maintain semantic HTML (e.g., `<motion.button>`).

## Best Practices

### 1. Variants & Orchestration
Use named variants instead of inline objects to keep code clean and enable staggering.
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

### 2. Exit Animations
Wrap conditional elements in `<AnimatePresence>` and provide `exit` variants. Use `mode="wait"` for sequential transitions.

### 3. Gesture Animations
Use `whileHover`, `whileTap`, and `whileInView` for declarative interactive feedback.

### 4. Advanced Hooks
- `useScroll` / `useTransform`: Scroll-linked effects (parallax, progress).
- `useAnimate`: Imperative sequence control.
- `useSpring`: Tactile, natural-feeling interactions.

## Verification
1. Is `motion/react` imported correctly?
2. Are you animating non-cheap properties (width, top, etc.)? (Avoid if possible)
3. Is `AnimatePresence` used where needed?
4. Are variants used for orchestration?
