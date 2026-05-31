---
name: tailwind-master
description: Advanced Tailwind CSS patterns for scalable, maintainable, and stunning UIs. Use for component styling, theme configuration, or optimizing bundle sizes.
---

# Tailwind CSS Master

## Core Patterns

### 1. Composition
- Use `cn()` utility (clsx + tailwind-merge) to handle conditional classes and merge conflicts safely.
- Break large components into smaller, styled sub-components instead of deep nesting.

### 2. Theming & Variables
- Define brand colors in `tailwind.config.js` using CSS variables to support dark mode and dynamic themes.
- Use `spacing` and `borderRadius` extensions to match the design system.

### 3. Responsive Design
- Mobile-first approach: `w-full md:w-1/2 lg:w-1/3`.
- Use `group` and `peer` for complex parent/sibling state styling.

### 4. Custom Utilities
- Only add custom CSS in `index.css` for complex animations or third-party library overrides.
- Prefer `@layer components` for reusable class sets (e.g., `.btn-primary`).

## Optimization
- Use `arbitrary values` `[#ff8800]` sparingly; add them to the config if used > 2 times.
- Ensure `content` in config correctly scans all source files.
- Leverage `v3.4+` / `v4.0` features like text-wrap, dynamic viewport units, and container queries.
