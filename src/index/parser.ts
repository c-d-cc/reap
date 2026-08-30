import Parser from "web-tree-sitter";
import { CORE_WASM } from "./languages.ts";
import type { Language } from "./languages.ts";

export type Found = { name: string; kind: string; line: number; file: string };
export type Extracted = { definitions: Found[]; references: Found[] };

/**
 * tag 질의(`@name.definition.*` · `@name.reference.*`)로 심볼과 참조를 뽑는다.
 * **문법 로드 실패는 삼키되 기록한다** — `status`가 낸다. 조용히 안 되는 언어는 해석률 문제와 같은 실패다.
 */
export class Extractor {
  private parser: Parser | null = null;
  private loaded = new Map<string, { lang: Parser.Language; query: Parser.Query }>();
  private failed = new Map<string, string>();

  async init(): Promise<void> {
    await Parser.init({ locateFile: () => CORE_WASM });
    this.parser = new Parser();
  }

  async extract(file: string, language: Language, source: string): Promise<Extracted> {
    const got = await this.load(language);
    if (!got || !this.parser) return { definitions: [], references: [] };
    this.parser.setLanguage(got.lang);
    const tree = this.parser.parse(source);
    const definitions: Found[] = [];
    const references: Found[] = [];
    for (const { name, node } of got.query.captures(tree.rootNode)) {
      if (!name.startsWith("name.")) continue;
      const found = { name: node.text, kind: name.split(".")[2] ?? "", line: node.startPosition.row + 1, file };
      if (name.startsWith("name.definition.")) definitions.push(found);
      else if (name.startsWith("name.reference.")) references.push(found);
    }
    tree.delete();
    return { definitions, references };
  }

  failures(): Record<string, string> {
    return Object.fromEntries(this.failed);
  }

  dispose(): void {
    this.parser?.delete();
    this.parser = null;
    this.loaded.clear();
  }

  private async load(language: Language) {
    const hit = this.loaded.get(language.name);
    if (hit) return hit;
    if (this.failed.has(language.name)) return null;
    try {
      const lang = await Parser.Language.load(language.wasm);
      const query = lang.query(language.query);
      const entry = { lang, query };
      this.loaded.set(language.name, entry);
      return entry;
    } catch (error) {
      this.failed.set(language.name, error instanceof Error ? error.message : String(error));
      return null;
    }
  }
}
