import type { ScanResult } from "./scanner.js";

/**
 * Generate a genome/application.md draft based on scan results.
 * This is a "suggest" — human reviews and corrects.
 */
export function suggestGenome(scan: ScanResult): string {
  const lines: string[] = [];

  lines.push("# Application");
  lines.push("");

  // Project Identity
  lines.push("## Project Identity");
  lines.push(`- Project: ${scan.projectName}`);
  if (scan.readmeExcerpt) {
    const firstLine = scan.readmeExcerpt.split("\n").find((l) => l.trim() && !l.startsWith("#"));
    if (firstLine) lines.push(`- Description: ${firstLine.trim()}`);
  }
  lines.push("");

  // Architecture
  lines.push("## Architecture Decisions");
  const archHints = inferArchitecture(scan);
  if (archHints.length > 0) {
    for (const hint of archHints) lines.push(`- ${hint}`);
    lines.push("");
    lines.push("### Why This Architecture?");
    lines.push("<!-- What drove these decisions? What alternatives were considered? -->");
  } else {
    lines.push("<!-- Could not infer architecture from directory structure -->");
  }
  lines.push("");

  // Tech Stack
  lines.push("## Tech Stack");
  lines.push(`- Language: ${scan.hasTypeScript ? "TypeScript" : "JavaScript"}`);

  const frameworks = detectFrameworks(scan);
  for (const fw of frameworks) lines.push(`- ${fw}`);

  if (scan.buildTool) lines.push(`- Build: ${scan.buildTool}`);
  if (scan.testFramework) lines.push(`- Test: ${scan.testFramework}`);
  lines.push("");

  // Conventions
  lines.push("## Conventions");
  lines.push("<!-- Auto-detected — review, confirm, and add project-specific conventions -->");
  if (scan.hasTypeScript) lines.push("- TypeScript strict mode");
  if (scan.scripts.lint) lines.push("- Linting enabled");
  if (scan.scripts.format || scan.devDependencies.includes("prettier")) lines.push("- Prettier formatting");
  lines.push("");

  // Constraints
  lines.push("## Constraints");
  lines.push("<!-- Review and confirm these constraints -->");
  if (scan.scripts.build) lines.push(`- Build command: \`${scan.scripts.build}\``);
  if (scan.scripts.test) lines.push(`- Test command: \`${scan.scripts.test}\``);
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate environment/source-map.md from scan results.
 */
export function generateSourceMap(scan: ScanResult): string {
  const lines: string[] = [];

  lines.push(`# ${scan.projectName} Source Map`);
  lines.push("");

  lines.push("## Directory Structure");
  lines.push("```");
  for (const entry of scan.directoryTree) {
    lines.push(entry);
  }
  lines.push("```");
  lines.push("");

  lines.push("## Dependencies");
  if (scan.dependencies.length > 0) {
    for (const dep of scan.dependencies) lines.push(`- ${dep}`);
  } else {
    lines.push("(none)");
  }
  lines.push("");

  lines.push("## Dev Dependencies");
  if (scan.devDependencies.length > 0) {
    for (const dep of scan.devDependencies) lines.push(`- ${dep}`);
  } else {
    lines.push("(none)");
  }
  lines.push("");

  lines.push("## Scripts");
  for (const [name, cmd] of Object.entries(scan.scripts)) {
    lines.push(`- \`${name}\`: \`${cmd}\``);
  }
  lines.push("");

  return lines.join("\n");
}

function inferArchitecture(scan: ScanResult): string[] {
  const hints: string[] = [];
  const dirs = scan.directoryTree;

  if (dirs.some((d) => d.includes("controllers/"))) hints.push("MVC pattern (controllers/ detected)");
  if (dirs.some((d) => d.includes("routes/"))) hints.push("Route-based structure (routes/ detected)");
  if (dirs.some((d) => d.includes("services/"))) hints.push("Service layer (services/ detected)");
  if (dirs.some((d) => d.includes("components/"))) hints.push("Component-based frontend (components/ detected)");
  if (dirs.some((d) => d.includes("pages/"))) hints.push("Page-based routing (pages/ detected)");
  if (dirs.some((d) => d.includes("domain/"))) hints.push("Domain-driven structure (domain/ detected)");
  if (dirs.some((d) => d.includes("core/")) && dirs.some((d) => d.includes("adapters/"))) hints.push("Hexagonal/ports-adapters pattern");

  return hints;
}

function detectFrameworks(scan: ScanResult): string[] {
  const all = [...scan.dependencies, ...scan.devDependencies];
  const frameworks: string[] = [];

  if (all.includes("react") || all.includes("react-dom")) frameworks.push("Frontend: React");
  if (all.includes("next")) frameworks.push("Frontend: Next.js");
  if (all.includes("vue")) frameworks.push("Frontend: Vue");
  if (all.includes("svelte")) frameworks.push("Frontend: Svelte");
  if (all.includes("express")) frameworks.push("Backend: Express");
  if (all.includes("hono")) frameworks.push("Backend: Hono");
  if (all.includes("fastify")) frameworks.push("Backend: Fastify");
  if (all.includes("nestjs") || all.includes("@nestjs/core")) frameworks.push("Backend: NestJS");
  if (all.includes("prisma") || all.includes("@prisma/client")) frameworks.push("ORM: Prisma");
  if (all.includes("drizzle-orm")) frameworks.push("ORM: Drizzle");
  if (all.includes("commander")) frameworks.push("CLI: Commander");

  return frameworks;
}
