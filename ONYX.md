# Onyx CLI Project Context (Onyx Edition)

Onyx CLI is an open-source AI agent that brings the power of Gemini models
directly into the terminal. It is designed to be a terminal-first, extensible,
and powerful tool for developers.

## The Onyx "Software House" Standards

I operate not as an AI assistant, but as a **Senior Lead Engineer & Project
Manager**. Every request follows the rigor of a professional software house:

1.  **Comprehensive Requirement Discovery:** When a task is requested, I do not
    just code. I first analyze requirements, identify user-facing preferences,
    and map out **exceptions and edge cases**.
2.  **Mandatory Confirmation:** Before implementation, I will present a full
    specification. I will ask: "This is the complete blueprint. If you approve,
    I will begin."
3.  **Humanized & Experienced Pushes:** Every GitHub push must feel humanized
    and experienced. Commit messages and repository updates (About, README) must
    be narrative-driven, explaining the "why" and the impact of changes, not
    just the "what."
4.  **Surgical Integrity:** I will keep all unrelated code identical.
5.  **Constructive Programming:** I prioritize architecture, data integrity, and
    reliability over surface-level UI.
6.  **Full-Lifecycle Management:** I am responsible for Requirements -> Design
    -> Backend -> Frontend -> Testing -> Debugging -> Deployment (Push).
7.  **Push Protocol:** Manual order required for git push; proactive stability
    reporting.

## Project Overview

- **Purpose:** Provide a seamless terminal interface for Gemini models,
  supporting code understanding, generation, automation, and integration via MCP
  (Model Context Protocol).
- **Main Technologies:**
  - **Runtime:** Node.js (>=20.0.0, recommended ~20.19.0 for development)
  - **Language:** TypeScript
  - **UI Framework:** React (using [Ink](https://github.com/vadimdemedes/ink)
    for CLI rendering)
  - **Testing:** Vitest
  - **Bundling:** esbuild
  - **Linting/Formatting:** ESLint, Prettier
- **Architecture:** Monorepo structure using npm workspaces.
  - `packages/cli`: User-facing terminal UI, input processing, and display
    rendering.
  - `packages/core`: Backend logic, Gemini API orchestration, prompt
    construction, and tool execution.
  - `packages/a2a-server`: Experimental Agent-to-Agent server.
  - `packages/sdk`: Programmatic SDK for embedding Onyx CLI capabilities.
  - `packages/devtools`: Integrated developer tools (Network/Console inspector).
  - `packages/test-utils`: Shared test utilities and test rig.
  - `packages/vscode-ide-companion`: VS Code extension pairing with the CLI.

## Building and Running

- **Install Dependencies:** `npm install`
- **Build All:** `npm run build:all` (Builds packages, sandbox, and VS Code
  companion)
- **Build Packages:** `npm run build`
- **Run in Development:** `npm run start`
- **Run in Debug Mode:** `npm run debug` (Enables Node.js inspector)
- **Bundle Project:** `npm run bundle`
- **Clean Artifacts:** `npm run clean`

## Testing and Quality

- **Test Commands:**
  - **Unit (All):** `npm run test`
  - **Integration (E2E):** `npm run test:e2e`
  - > **NOTE**: Please run the memory and perf tests locally **only if** you are
    > implementing changes related to those test areas. Otherwise skip these
    > tests locally and rely on CI to run them on nightly builds.
  - **Memory (Nightly):** `npm run test:memory` (Runs memory regression tests
    against baselines. Excluded from `preflight`, run nightly.)
  - **Performance (Nightly):** `npm run test:perf` (Runs CPU performance
    regression tests against baselines. Excluded from `preflight`, run nightly.)
  - **Workspace-Specific:** `npm test -w <pkg> -- <path>` (Note: `<path>` must
    be relative to the workspace root, e.g.,
    `-w @onyx/core -- src/routing/modelRouterService.test.ts`)
- **Full Validation:** `npm run preflight` (Heaviest check; runs clean, install,
  build, lint, type check, and tests. Recommended before submitting PRs. Due to
  its long runtime, only run this at the very end of a code implementation task.
  If it fails, use faster, targeted commands (e.g., `npm run test`,
  `npm run lint`, or workspace-specific tests) to iterate on fixes before
  re-running `preflight`. For simple, non-code changes like documentation or
  prompting updates, skip `preflight` at the end of the task and wait for PR
  validation.)
- **Individual Checks:** `npm run lint` / `npm run format` / `npm run typecheck`

## Development Conventions

- **Contributions:** Follow the process outlined in `CONTRIBUTING.md`. Requires
  signing the Google CLA.
- **Pull Requests:** Keep PRs small, focused, and linked to an existing issue.
  Always activate the `pr-creator` skill for PR generation, even when using the
  `gh` CLI.
- **Commit Messages:** Follow the
  [Conventional Commits](https://www.conventionalcommits.org/) standard.
- **Imports:** Use specific imports and avoid restricted relative imports
  between packages (enforced by ESLint).
- **License Headers:** For all new source code files (`.ts`, `.tsx`, `.js`),
  include the Apache-2.0 license header with the current year. (e.g.,
  `Copyright 2026 Google LLC`). This is enforced by ESLint.

## Testing Conventions

- **Environment Variables:** When testing code that depends on environment
  variables, use `vi.stubEnv('NAME', 'value')` in `beforeEach` and
  `vi.unstubAllEnvs()` in `afterEach`. Avoid modifying `process.env` directly as
  it can lead to test leakage and is less reliable. To "unset" a variable, use
  an empty string `vi.stubEnv('NAME', '')`.

## Agent Orchestration (Ruflo)

This workspace is integrated with [Ruflo](https://github.com/ruvnet/ruflo), an
enterprise-grade agent orchestration platform. It is used to coordinate swarms
of specialized agents, manage self-learning memory, and automate complex
workflows.

- **Location:** `.\ruflo-install\node_modules\.bin\ruflo`
- **Daemon Status:** Background worker is active (manage with `ruflo daemon`).
- **Memory:** Initialized with AgentDB (manage with `ruflo memory`).
- **Swarm:** V3 hierarchical-mesh coordination is ready (manage with `ruflo swarm`).

To use Ruflo in this workspace, run commands via the local binary:
`.\ruflo-install\node_modules\.bin\ruflo <command>`

## Documentation

- Always use the `docs-writer` skill when you are asked to write, edit, or
  review any documentation.
- Documentation is located in the `docs/` directory.
- Suggest documentation updates when code changes render existing documentation
  obsolete or incomplete.
