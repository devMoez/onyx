# System Prompt Override (ONYX_SYSTEM_MD)

The core system instructions that guide Onyx CLI can be completely replaced
with your own Markdown file. This feature is controlled via the
`ONYX_SYSTEM_MD` environment variable.

## Overview

The `ONYX_SYSTEM_MD` variable instructs the CLI to use an external Markdown
file for its system prompt, completely overriding the built-in default. This is
a full replacement, not a merge. If you use a custom file, none of the original
core instructions will apply unless you include them yourself.

This feature is intended for advanced users who need to enforce strict,
project-specific behavior or create a customized persona.

<!-- prettier-ignore -->
> [!TIP]
> You can export the current default system prompt to a file first, review
> it, and then selectively modify or replace it (see
> [“Export the default prompt”](#export-the-default-prompt-recommended)).

## How to enable

You can set the environment variable temporarily in your shell, or persist it
via a `.onyx/.env` file. See
[Persisting Environment Variables](../get-started/authentication.mdx#persisting-environment-variables).

- Use the project default path (`.onyx/system.md`):
  - `ONYX_SYSTEM_MD=true` or `ONYX_SYSTEM_MD=1`
  - The CLI reads `./.onyx/system.md` (relative to your current project
    directory).

- Use a custom file path:
  - `ONYX_SYSTEM_MD=/absolute/path/to/my-system.md`
  - Relative paths are supported and resolved from the current working
    directory.
  - Tilde expansion is supported (for example, `~/my-system.md`).

- Disable the override (use built‑in prompt):
  - `ONYX_SYSTEM_MD=false` or `ONYX_SYSTEM_MD=0` or unset the variable.

If the override is enabled but the target file does not exist, the CLI will
error with: `missing system prompt file '<path>'`.

## Quick examples

- One‑off session using a project file:
  - `ONYX_SYSTEM_MD=1 onyx`
- Persist for a project using `.onyx/.env`:
  - Create `.onyx/system.md`, then add to `.onyx/.env`:
    - `ONYX_SYSTEM_MD=1`
- Use a custom file under your home directory:
  - `ONYX_SYSTEM_MD=~/prompts/system.md onyx`

## UI indicator

When `ONYX_SYSTEM_MD` is active, the CLI shows a `|⌐■_■|` indicator in the UI
to signal custom system‑prompt mode.

## Variable Substitution

When using a custom system prompt file, you can use the following variables to
dynamically include built-in content:

- `${AgentSkills}`: Injects a complete section (including header) of all
  available agent skills.
- `${SubAgents}`: Injects a complete section (including header) of available
  sub-agents.
- `${AvailableTools}`: Injects a bulleted list of all currently enabled tool
  names.
- Tool Name Variables: Injects the actual name of a tool using the pattern:
  `${toolName}_ToolName` (for example, `${write_file_ToolName}`,
  `${run_shell_command_ToolName}`).

  This pattern is generated dynamically for all available tools.

### Example

```markdown
# Custom System Prompt

You are a helpful assistant. ${AgentSkills}
${SubAgents}

## Tooling

The following tools are available to you: ${AvailableTools}

You can use ${write_file_ToolName} to save logs.
```

## Export the default prompt (recommended)

Before overriding, export the current default prompt so you can review required
safety and workflow rules.

- Write the built‑in prompt to the project default path:
  - `ONYX_WRITE_SYSTEM_MD=1 onyx`
- Or write to a custom path:
  - `ONYX_WRITE_SYSTEM_MD=~/prompts/DEFAULT_SYSTEM.md onyx`

This creates the file and writes the current built‑in system prompt to it.

## Best practices: system.md vs ONYX.md

- system.md (firmware):
  - Non‑negotiable operational rules: safety, tool‑use protocols, approvals, and
    mechanics that keep the CLI reliable.
  - Stable across tasks and projects (or per project when needed).
- ONYX.md (strategy):
  - Persona, goals, methodologies, and project/domain context.
  - Evolves per task; relies on system.md for safe execution.

Keep system.md minimal but complete for safety and tool operation. Keep
ONYX.md focused on high‑level guidance and project specifics.

## Troubleshooting

- Error: `missing system prompt file '…'`
  - Ensure the referenced path exists and is readable.
  - For `ONYX_SYSTEM_MD=1|true`, create `./.onyx/system.md` in your project.
- Override not taking effect
  - Confirm the variable is loaded (use `.onyx/.env` or export in your shell).
  - Paths are resolved from the current working directory; try an absolute path.
- Restore defaults
  - Unset `ONYX_SYSTEM_MD` or set it to `0`/`false`.
