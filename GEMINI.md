# ONYX Development Rules

## Automation & Reliability
- **Auto-Restart Rule**: The backend must always be run with the `--reload` flag and the frontend in `dev` mode. Every code modification must be followed by a verification that the server has successfully reloaded.
- **Dependency Management**: Standard library tools should be prioritized. Optional dependencies must be lightweight and documented.

## Skill System
- **Expert Skill Usage**: Agents must utilize the `SkillLoader` to inject domain-specific knowledge from the `skills/` directory into their prompts.
- **Permanent Skills**: All skills in the `skills/` folder are considered permanent core capabilities of the ONYX swarm.
