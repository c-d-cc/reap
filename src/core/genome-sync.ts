import { join } from "path";
import { readdir, stat } from "fs/promises";
import { readTextFile, fileExists } from "./fs";

interface ProjectScan {
  language: string;
  runtime: string;
  framework: string;
  packageManager: string;
  testFramework: string;
  linter: string;
  formatter: string;
  buildTool: string;
  scripts: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
  hasTypeScript: boolean;
  hasDocker: boolean;
  directories: string[];
  existingDocs: { file: string; content: string }[];
}

async function scanProject(projectRoot: string): Promise<ProjectScan> {
  const scan: ProjectScan = {
    language: "Unknown",
    runtime: "Unknown",
    framework: "None",
    packageManager: "Unknown",
    testFramework: "None",
    linter: "None",
    formatter: "None",
    buildTool: "None",
    scripts: {},
    dependencies: [],
    devDependencies: [],
    hasTypeScript: false,
    hasDocker: false,
    directories: [],
    existingDocs: [],
  };

  // package.json
  const pkgContent = await readTextFile(join(projectRoot, "package.json"));
  if (pkgContent) {
    try {
      const pkg = JSON.parse(pkgContent);
      scan.dependencies = Object.keys(pkg.dependencies ?? {});
      scan.devDependencies = Object.keys(pkg.devDependencies ?? {});
      scan.scripts = pkg.scripts ?? {};
      scan.packageManager = pkg.packageManager?.startsWith("bun") ? "Bun"
        : pkg.packageManager?.startsWith("pnpm") ? "pnpm"
        : pkg.packageManager?.startsWith("yarn") ? "Yarn" : "npm";
      scan.language = "JavaScript";
      scan.runtime = "Node.js";

      // Detect framework from dependencies
      const allDeps = [...scan.dependencies, ...scan.devDependencies];
      if (allDeps.includes("next")) scan.framework = "Next.js";
      else if (allDeps.includes("nuxt")) scan.framework = "Nuxt";
      else if (allDeps.includes("react")) scan.framework = "React";
      else if (allDeps.includes("vue")) scan.framework = "Vue";
      else if (allDeps.includes("svelte") || allDeps.includes("@sveltejs/kit")) scan.framework = "Svelte/SvelteKit";
      else if (allDeps.includes("express")) scan.framework = "Express";
      else if (allDeps.includes("hono")) scan.framework = "Hono";
      else if (allDeps.includes("fastify")) scan.framework = "Fastify";
      else if (allDeps.includes("nestjs") || allDeps.includes("@nestjs/core")) scan.framework = "NestJS";
      else if (allDeps.includes("astro")) scan.framework = "Astro";

      // Test framework
      if (allDeps.includes("vitest")) scan.testFramework = "Vitest";
      else if (allDeps.includes("jest")) scan.testFramework = "Jest";
      else if (allDeps.includes("mocha")) scan.testFramework = "Mocha";
      else if (scan.scripts.test?.includes("bun test")) scan.testFramework = "Bun Test";

      // Linter
      if (allDeps.includes("eslint")) scan.linter = "ESLint";
      else if (allDeps.includes("biome") || allDeps.includes("@biomejs/biome")) scan.linter = "Biome";

      // Formatter
      if (allDeps.includes("prettier")) scan.formatter = "Prettier";
      else if (allDeps.includes("biome") || allDeps.includes("@biomejs/biome")) scan.formatter = "Biome";

      // Build tool
      if (allDeps.includes("vite")) scan.buildTool = "Vite";
      else if (allDeps.includes("webpack")) scan.buildTool = "Webpack";
      else if (allDeps.includes("esbuild")) scan.buildTool = "esbuild";
      else if (allDeps.includes("rollup")) scan.buildTool = "Rollup";
      else if (allDeps.includes("turbo") || allDeps.includes("turbopack")) scan.buildTool = "Turbopack";
    } catch { /* invalid JSON */ }
  }

  // Go
  if (await fileExists(join(projectRoot, "go.mod"))) {
    scan.language = "Go";
    scan.runtime = "Go";
    scan.packageManager = "Go Modules";
  }

  // Python
  if (await fileExists(join(projectRoot, "pyproject.toml")) || await fileExists(join(projectRoot, "requirements.txt"))) {
    scan.language = "Python";
    scan.runtime = "Python";
    if (await fileExists(join(projectRoot, "pyproject.toml"))) {
      const pyproject = await readTextFile(join(projectRoot, "pyproject.toml"));
      if (pyproject?.includes("[tool.poetry]")) scan.packageManager = "Poetry";
      else if (pyproject?.includes("[tool.uv]") || pyproject?.includes("[project]")) scan.packageManager = "uv/pip";
      if (pyproject?.includes("pytest")) scan.testFramework = "pytest";
      if (pyproject?.includes("django")) scan.framework = "Django";
      else if (pyproject?.includes("fastapi")) scan.framework = "FastAPI";
      else if (pyproject?.includes("flask")) scan.framework = "Flask";
    }
  }

  // Rust
  if (await fileExists(join(projectRoot, "Cargo.toml"))) {
    scan.language = "Rust";
    scan.runtime = "Rust";
    scan.packageManager = "Cargo";
  }

  // TypeScript
  if (await fileExists(join(projectRoot, "tsconfig.json"))) {
    scan.hasTypeScript = true;
    scan.language = "TypeScript";
  }

  // Docker
  scan.hasDocker = await fileExists(join(projectRoot, "Dockerfile")) || await fileExists(join(projectRoot, "docker-compose.yml"));

  // Top-level directories
  try {
    const entries = await readdir(projectRoot);
    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "node_modules") continue;
      try {
        const s = await stat(join(projectRoot, entry));
        if (s.isDirectory()) scan.directories.push(entry);
      } catch { /* skip */ }
    }
  } catch { /* skip */ }

  // Existing docs
  const docFiles = ["README.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", "ARCHITECTURE.md"];
  for (const file of docFiles) {
    const content = await readTextFile(join(projectRoot, file));
    if (content) {
      scan.existingDocs.push({ file, content: content.substring(0, 2000) }); // truncate
    }
  }

  return scan;
}

function generateConstraints(scan: ProjectScan): string {
  const lines: string[] = [
    "# Technical Constraints",
    "",
    "> Auto-generated by `reap init` from project scan. Refine during the first Generation's Objective stage.",
    "",
    "## Tech Stack",
    "",
    `- **Language**: ${scan.language}${scan.hasTypeScript ? " (TypeScript)" : ""}`,
    `- **Runtime**: ${scan.runtime}`,
  ];

  if (scan.framework !== "None") lines.push(`- **Framework**: ${scan.framework}`);
  if (scan.packageManager !== "Unknown") lines.push(`- **Package Manager**: ${scan.packageManager}`);
  if (scan.buildTool !== "None") lines.push(`- **Build Tool**: ${scan.buildTool}`);

  lines.push("", "## Constraints", "");
  if (scan.hasDocker) lines.push("- Docker containerized deployment");
  if (scan.hasTypeScript) lines.push("- TypeScript strict mode (check tsconfig.json for details)");

  lines.push("", "## Validation Commands", "", "| Purpose | Command | Description |", "|---------|---------|-------------|");
  if (scan.testFramework !== "None") {
    const testCmd = scan.scripts.test ?? `${scan.testFramework.toLowerCase()} test`;
    lines.push(`| Test | \`${testCmd}\` | Run tests |`);
  }
  if (scan.scripts.lint) lines.push(`| Lint | \`${scan.scripts.lint.includes("npm") ? "npm run lint" : scan.scripts.lint}\` | Lint check |`);
  else if (scan.scripts.lint) lines.push(`| Lint | \`npm run lint\` | Lint check |`);
  if (scan.scripts.build) lines.push(`| Build | \`npm run build\` | Build project |`);
  if (scan.hasTypeScript) lines.push("| Type check | `npx tsc --noEmit` | TypeScript compile check |");

  lines.push("", "## External Dependencies", "", "- (review and fill in during first generation)");

  return lines.join("\n") + "\n";
}

function generateConventions(scan: ProjectScan): string {
  const lines: string[] = [
    "# Development Conventions",
    "",
    "> Auto-generated by `reap init` from project scan. Refine during the first Generation's Objective stage.",
    "",
    "## Code Style",
    "",
  ];

  if (scan.linter !== "None") lines.push(`- Linter: ${scan.linter}`);
  if (scan.formatter !== "None") lines.push(`- Formatter: ${scan.formatter}`);
  if (scan.hasTypeScript) lines.push("- TypeScript strict mode");

  lines.push("", "## Naming Conventions", "", "- (review and fill in during first generation)");

  lines.push("", "## Git Conventions", "", "- (review and fill in during first generation)");

  if (scan.testFramework !== "None") {
    lines.push("", "## Testing", "", `- Test framework: ${scan.testFramework}`);
  }

  lines.push("", "## Enforced Rules", "", "| Rule | Tool | Command |", "|------|------|---------|");
  if (scan.scripts.test) lines.push(`| Tests pass | ${scan.testFramework} | \`npm test\` |`);
  if (scan.scripts.lint) lines.push(`| Lint clean | ${scan.linter} | \`npm run lint\` |`);
  if (scan.scripts.build) lines.push("| Build succeeds | Build | `npm run build` |");
  if (scan.hasTypeScript) lines.push("| TypeScript compiles | tsc | `npx tsc --noEmit` |");

  return lines.join("\n") + "\n";
}

function generatePrinciples(scan: ProjectScan): string {
  const lines: string[] = [
    "# Architecture Principles",
    "",
    "> Auto-generated by `reap init` from project scan. Refine during the first Generation's Objective stage.",
    "",
    "## Core Beliefs",
    "",
    "- (define your project's core architectural beliefs during the first generation)",
    "",
    "## Architecture Decisions",
    "",
    "| ID | Decision | Rationale | Date |",
    "|----|----------|-----------|------|",
  ];

  if (scan.framework !== "None") lines.push(`| ADR-001 | ${scan.framework} | Detected from project dependencies | Auto |`);
  if (scan.hasTypeScript) lines.push(`| ADR-002 | TypeScript | Type safety | Auto |`);

  lines.push("", "## Source Map", "", "→ `genome/source-map.md`");

  return lines.join("\n") + "\n";
}

function generateSourceMap(scan: ProjectScan): string {
  const lines: string[] = [
    "# Source Map",
    "",
    "> Auto-generated by `reap init` from project scan. Refine during the first Generation's Objective stage.",
    "",
    "## Project Structure",
    "",
    "```",
  ];

  for (const dir of scan.directories.sort()) {
    lines.push(`${dir}/`);
  }
  lines.push("```");

  return lines.join("\n") + "\n";
}

export async function syncGenomeFromProject(
  projectRoot: string,
  genomePath: string,
  onProgress?: (message: string) => void,
): Promise<void> {
  const log = onProgress ?? (() => {});

  log("Scanning project structure...");
  const scan = await scanProject(projectRoot);

  log(`Detected: ${scan.language}, ${scan.framework !== "None" ? scan.framework : "no framework"}, ${scan.packageManager}`);

  const { writeTextFile } = await import("./fs");

  log("Generating constraints.md...");
  await writeTextFile(join(genomePath, "constraints.md"), generateConstraints(scan));

  log("Generating conventions.md...");
  await writeTextFile(join(genomePath, "conventions.md"), generateConventions(scan));

  log("Generating principles.md...");
  await writeTextFile(join(genomePath, "principles.md"), generatePrinciples(scan));

  log("Generating source-map.md...");
  await writeTextFile(join(genomePath, "source-map.md"), generateSourceMap(scan));

  // Create domain/ hint file if empty
  const { mkdir } = await import("fs/promises");
  const domainDir = join(genomePath, "domain");
  await mkdir(domainDir, { recursive: true });
  const domainReadme = join(domainDir, "README.md");
  if (!(await fileExists(domainReadme))) {
    await writeTextFile(domainReadme, [
      "# Domain Rules",
      "",
      "> This directory stores business rules that cannot be derived from code structure alone.",
      "> Run `/reap.sync` to scan source code for domain knowledge and auto-generate domain files.",
      "",
      "Examples of domain rules:",
      "- State machines and status transitions",
      "- Policy rules with thresholds or conditions",
      "- Classification logic driven by business categories",
      "- Hardcoded domain constants with business meaning",
      "- Workflow orchestration sequences",
      "",
      "Each file should follow the domain-guide template (`~/.reap/templates/domain-guide.md`).",
      "",
    ].join("\n"));
  }
}
