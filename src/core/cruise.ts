import YAML from "yaml";
import type { ReapConfig } from "../types/index.js";
import { readTextFile, writeTextFile } from "./fs.js";

/**
 * Parse cruiseCount "current/total" format. Returns null if not in cruise mode.
 */
export function parseCruiseCount(config: ReapConfig): { current: number; total: number } | null {
  if (!config.cruiseCount) return null;
  const match = config.cruiseCount.match(/^(\d+)\/(\d+)$/);
  if (!match) return null;
  return { current: parseInt(match[1]), total: parseInt(match[2]) };
}

/**
 * Advance cruise count by 1. Returns true if cruise is still active, false if completed.
 */
export async function advanceCruise(configPath: string): Promise<boolean> {
  const content = await readTextFile(configPath);
  if (!content) return false;

  const config = YAML.parse(content) as ReapConfig;
  const cruise = parseCruiseCount(config);
  if (!cruise) return false;

  if (cruise.current >= cruise.total) {
    // Cruise complete — remove cruiseCount
    delete config.cruiseCount;
    await writeTextFile(configPath, YAML.stringify(config));
    return false;
  }

  config.cruiseCount = `${cruise.current + 1}/${cruise.total}`;
  await writeTextFile(configPath, YAML.stringify(config));
  return true;
}

/**
 * Clear cruise mode (remove cruiseCount from config).
 */
export async function clearCruise(configPath: string): Promise<void> {
  const content = await readTextFile(configPath);
  if (!content) return;

  const config = YAML.parse(content) as ReapConfig;
  delete config.cruiseCount;
  await writeTextFile(configPath, YAML.stringify(config));
}

/**
 * Set cruise mode with N generations.
 */
export async function setCruise(configPath: string, total: number): Promise<void> {
  const content = await readTextFile(configPath);
  if (!content) return;

  const config = YAML.parse(content) as ReapConfig;
  config.cruiseCount = `1/${total}`;
  await writeTextFile(configPath, YAML.stringify(config));
}
