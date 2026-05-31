# Architectural Blueprint Orchestrator

## Purpose
The primary entry point for complex project development. Orchestrates a systematic transition from high-level vision to detailed architectural blueprints, considering exceptions, dependencies, and infrastructure.

## Core Workflow (The "Architect's Lifecycle")
1. **Goal Acquisition:** Accept high-level project goals and constraints.
2. **Requirements Phase:** Deep-dive analysis of functional/non-functional requirements, identifying edge cases and exceptions.
3. **Stack Strategy:** Propose best-in-class tech stacks aligned with performance, scalability, and maintainability requirements.
4. **Architectural Design:** Define system components, data models, API boundaries, and communication patterns.
5. **Blueprint Generation:** Create final, actionable documentation including file structures, deployment strategy, and QA protocols.

## Mandates
- **Analysis-First:** Never skip analysis; prioritize mapping risks and dependencies early.
- **Expert Rigor:** Every output must consider security, scalability, and long-term maintainability.
- **Orchestration:** Seamlessly invoke sub-skills (`RequirementsAnalyzer`, `TechStackSelector`, `BlueprintDesigner`) to handle specialized tasks.
