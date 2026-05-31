---
name: react-monaco-master
description: Expert guidance for building high-performance React applications with Monaco Editor integration. Use when implementing IDE-like features, real-time collaboration, or complex UI states with Zustand and Socket.IO.
---

# React & Monaco Editor Master

## Core Architecture
- **State Management**: Use Zustand for lightweight, decoupled state. Prefer small, focused stores.
- **Real-time**: Use Socket.IO for event-driven updates. Handle connection lifecycle and retries in a custom hook.
- **Editor**: Use `@monaco-editor/react`. 
    - Always set `automaticLayout: true`.
    - Use `onMount` to configure editor settings (theme, keybindings).
    - Implement `MonacoDiffEditor` for code comparisons.

## Best Practices
- **Performance**: Use `React.memo` and `useCallback` for components with high update frequencies (like editor wrappers).
- **TypeScript**: Ensure strict typing for all props and state. Avoid `any`.
- **Styling**: Leverage Tailwind for rapid UI development, maintaining consistency with the established Aesthetic Anchor.
