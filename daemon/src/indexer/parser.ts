import { readFileSync } from "fs";
import { getLanguageConfig } from "./languages.js";

let Parser: any;

interface SymbolInfo {
  name: string;
  kind: string;
  line: number;
  file: string;
}

export interface ExtractResult {
  definitions: SymbolInfo[];
  references: SymbolInfo[];
}

export class SymbolExtractor {
  private parser: any = null;
  private languages = new Map<string, any>();
  private queries = new Map<string, any>();

  async init(): Promise<void> {
    Parser = (await import("web-tree-sitter")).default;
    await Parser.init();
    this.parser = new Parser();
  }

  private async loadLanguage(langName: string): Promise<{ lang: any; query: any } | null> {
    if (this.languages.has(langName)) {
      return { lang: this.languages.get(langName), query: this.queries.get(langName) };
    }

    const config = getLanguageConfig(langName);
    if (!config) return null;

    try {
      const lang = await Parser.Language.load(config.wasmFile);
      const scmSource = readFileSync(config.queryFile, "utf-8");
      const query = lang.query(scmSource);
      this.languages.set(langName, lang);
      this.queries.set(langName, query);
      return { lang, query };
    } catch (e) {
      console.error(`Failed to load language ${langName}:`, e);
      return null;
    }
  }

  async extract(filePath: string, language: string, source: string): Promise<ExtractResult> {
    const loaded = await this.loadLanguage(language);
    if (!loaded) return { definitions: [], references: [] };

    this.parser.setLanguage(loaded.lang);
    const tree = this.parser.parse(source);
    const captures = loaded.query.captures(tree.rootNode);

    const definitions: SymbolInfo[] = [];
    const references: SymbolInfo[] = [];

    for (const { name: captureName, node } of captures) {
      if (!captureName.startsWith("name.")) continue;

      const text = node.text;
      const line = node.startPosition.row + 1;

      if (captureName.startsWith("name.definition.")) {
        const kind = captureName.replace("name.definition.", "");
        definitions.push({ name: text, kind, line, file: filePath });
      } else if (captureName.startsWith("name.reference.")) {
        const kind = captureName.replace("name.reference.", "");
        references.push({ name: text, kind, line, file: filePath });
      }
    }

    tree.delete();
    return { definitions, references };
  }

  dispose(): void {
    if (this.parser) {
      this.parser.delete();
      this.parser = null;
    }
    this.languages.clear();
    this.queries.clear();
  }
}
