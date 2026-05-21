# System Controller Skill

The `system-controller` skill provides Onyx with the ability to perceive and interact with the desktop environment, enabling autonomous control of system-wide tasks.

## Capabilities
- **Visual Perception:** Captures screen data for multimodal processing.
- **Human-like Interaction:** Emits keyboard and mouse events mapped to visual elements.
- **Autonomous Planning:** Orchestrates complex workflows (e.g., installing software, organizing files) by observing the screen.

## Dependencies
- **Vision:** Requires a model-compatible vision engine (e.g., UI-TARS or similar).
- **Environment:** Must be executed within a trusted context or with appropriate system permissions.

## Usage
Activate this skill to grant Onyx authority to observe and control the OS:
> "Onyx, activate system-controller and open the notepad."
