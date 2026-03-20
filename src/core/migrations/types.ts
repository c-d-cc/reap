import type { ReapPaths } from "../paths";

export interface MigrationRunResult {
  migrated: string[];   // description of each migration that ran
  skipped: string[];    // migrations that check() returned false
  errors: string[];     // migration failures
  fromVersion: string;
  toVersion: string;
}

export interface Migration {
  /** Semver: applies when config version < toVersion */
  fromVersion: string;
  toVersion: string;
  /** Human-readable description */
  description: string;
  /** Quick check: does this migration need to run? Return false to skip. */
  check: (paths: ReapPaths) => Promise<boolean>;
  /** Execute the migration */
  up: (paths: ReapPaths) => Promise<string[]>;
}
