import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { createHash } from "crypto";
import type { ProjectEntry, Registry } from "./types.js";

export function projectId(projectPath: string): string {
  const hash = createHash("sha256").update(projectPath).digest("hex").slice(0, 12);
  return `proj-${hash}`;
}

export class RegistryManager {
  private readonly path: string;

  constructor(registryPath: string) {
    this.path = registryPath;
  }

  load(): Registry {
    try {
      const content = readFileSync(this.path, "utf-8");
      return JSON.parse(content) as Registry;
    } catch {
      return { projects: {} };
    }
  }

  private save(registry: Registry): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(registry, null, 2));
  }

  register(projectPath: string, name: string): string {
    const id = projectId(projectPath);
    const registry = this.load();
    registry.projects[id] = {
      path: projectPath,
      name,
      registeredAt: new Date().toISOString(),
      lastIndexedAt: null,
    };
    this.save(registry);
    return id;
  }

  unregister(id: string): void {
    const registry = this.load();
    delete registry.projects[id];
    this.save(registry);
  }

  get(id: string): (ProjectEntry & { id: string }) | null {
    const registry = this.load();
    const entry = registry.projects[id];
    return entry ? { ...entry, id } : null;
  }

  list(): Array<ProjectEntry & { id: string }> {
    const registry = this.load();
    return Object.entries(registry.projects).map(([id, entry]) => ({ ...entry, id }));
  }

  findByPath(projectPath: string): string | null {
    const id = projectId(projectPath);
    const registry = this.load();
    return registry.projects[id] ? id : null;
  }

  updateLastIndexed(id: string): void {
    const registry = this.load();
    if (registry.projects[id]) {
      registry.projects[id].lastIndexedAt = new Date().toISOString();
      this.save(registry);
    }
  }
}
