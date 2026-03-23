import type { ReapPaths } from "../paths";

export interface MigrationRunResult {
  migrated: string[];   // description of each migration that ran
  skipped: string[];    // migrations that check() returned false
  errors: string[];     // migration failures
}

export interface Migration {
  /** Human-readable description */
  description: string;
  /** Quick check: does this migration need to run? Return false to skip. */
  check: (paths: ReapPaths) => Promise<boolean>;
  /** Execute the migration */
  up: (paths: ReapPaths) => Promise<string[]>;
}
