import { readFile, writeFile, access } from "fs/promises";

/** Read file contents as string. Returns null if file doesn't exist. */
export async function readTextFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

/** Read file contents as string. Throws if file doesn't exist. */
export async function readTextFileOrThrow(path: string): Promise<string> {
  return await readFile(path, "utf-8");
}

/** Write string content to file. */
export async function writeTextFile(path: string, content: string): Promise<void> {
  await writeFile(path, content, "utf-8");
}

/** Check if file exists. */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
