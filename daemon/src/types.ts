export interface DaemonConfig {
  port: number;
  idleTimeoutMs: number;
}

export const DEFAULT_CONFIG: DaemonConfig = {
  port: 17224,
  idleTimeoutMs: 30 * 60 * 1000, // 30 minutes
};

export interface ProjectEntry {
  path: string;
  name: string;
  registeredAt: string;
  lastIndexedAt: string | null;
}

export interface Registry {
  projects: Record<string, ProjectEntry>;
}

export interface ApiResponse<T = unknown> {
  status: "ok" | "error";
  data?: T;
  error?: string;
}

export interface HealthData {
  pid: number;
  uptime: number;
  idleTime: number;
  projectCount: number;
}
