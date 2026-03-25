---
description: "REAP init — initialize a new reap project with interactive setup"
disable-model-invocation: true
---

Run `reap init [project-name]` to initialize. The mode (greenfield or adoption) is auto-detected based on existing source files.

- **Greenfield**: Empty or near-empty directory. Creates blank templates.
- **Adoption**: Existing codebase detected. Scans code and generates a draft genome.

Optional: `--mode greenfield|adoption` to override auto-detection.

Follow the conversation prompt in the JSON output to complete the interactive setup with the human.
