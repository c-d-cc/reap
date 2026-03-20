## What's New

### Brainstorming Design in Objective Stage

The Objective stage now includes a structured brainstorming process inspired by superpowers' brainstorming skill. Every generation goes through a design-first workflow before implementation.

- **Structured Questioning Protocol**: One question at a time, multiple choice preferred over open-ended
- **Approach Exploration**: 2-3 alternatives with trade-off tables and recommendations
- **Sectional Design Approval**: Architecture, components, data flow, error handling — each section approved before proceeding
- **Visual Companion**: A zero-dependency local server (Node.js built-in modules only) that serves HTML mockups, diagrams, and comparison cards in the browser via WebSocket
- **Spec Review Loop**: Automated subagent-based review (max 3 iterations) checking completeness, consistency, clarity, scope, and YAGNI
- **Scope Decomposition Detection**: Flags multi-subsystem goals and suggests splitting into separate generations

### Artifact Template Update

`01-objective.md` now includes a **Design** section with:
- Approaches Considered (comparison table)
- Selected Design (rationale)
- Design Approval History

## Generations

- **gen-057-7da78d**: Objective brainstorming design integration
