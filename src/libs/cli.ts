/**
 * Lightweight CLI framework — zero-dependency replacement for commander.js
 *
 * Supports: commands, nested subcommands, options (boolean/value/required/variadic),
 * positional arguments, version flag, auto-generated help, and action handlers.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface ParsedOption {
  short?: string;
  long: string;
  description: string;
  required: boolean;       // option value is mandatory (angle brackets)
  boolean: boolean;        // flag-only, no value
  variadic: boolean;
  defaultValue?: unknown;
  envVar?: string;
  choices?: string[];
  argName?: string;
  negate: boolean;
}

export interface ParsedArgument {
  name: string;
  description: string;
  required: boolean;
  variadic: boolean;
  defaultValue?: unknown;
}

type ActionFn = (...args: any[]) => void | Promise<void>;
type HookFn = (thisCommand: Command, actionCommand: Command) => void | Promise<void>;

// ── Option / Argument parsing helpers ──────────────────────────────────────

function parseOptionFlags(flags: string): Pick<ParsedOption, "short" | "long" | "boolean" | "required" | "variadic" | "argName" | "negate"> {
  // e.g. "-p, --port <number>", "--verbose", "--no-color", "-d, --debug [level]"
  const parts = flags.split(/,\s*/);
  let short: string | undefined;
  let long = "";
  let boolean = true;
  let required = false;
  let variadic = false;
  let argName: string | undefined;
  let negate = false;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("--")) {
      // Extract long flag and optional value placeholder
      const match = trimmed.match(/^(--\S+)\s*(.*)$/);
      if (match) {
        long = match[1];
        const valuePart = match[2].trim();
        if (valuePart) {
          boolean = false;
          if (valuePart.startsWith("<")) {
            required = true;
            argName = valuePart.replace(/[<>]/g, "").replace(/\.{3}$/, "");
            variadic = valuePart.includes("...");
          } else if (valuePart.startsWith("[")) {
            required = false;
            argName = valuePart.replace(/[\[\]]/g, "").replace(/\.{3}$/, "");
            variadic = valuePart.includes("...");
          }
        }
      }
    } else if (trimmed.startsWith("-")) {
      const match = trimmed.match(/^(-\S)\s*(.*)$/);
      if (match) {
        short = match[1];
        const valuePart = match[2].trim();
        if (valuePart && !long) {
          boolean = false;
          if (valuePart.startsWith("<")) {
            required = true;
            argName = valuePart.replace(/[<>]/g, "").replace(/\.{3}$/, "");
            variadic = valuePart.includes("...");
          } else if (valuePart.startsWith("[")) {
            required = false;
            argName = valuePart.replace(/[\[\]]/g, "").replace(/\.{3}$/, "");
            variadic = valuePart.includes("...");
          }
        }
      }
    }
  }

  if (long.startsWith("--no-")) {
    negate = true;
    boolean = true;
  }

  return { short, long, boolean, required, variadic, argName, negate };
}

function optionAttributeName(long: string): string {
  // --dry-run → dryRun, --no-color → color
  let name = long.replace(/^--/, "").replace(/^no-/, "");
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseArgumentSyntax(syntax: string): Pick<ParsedArgument, "name" | "required" | "variadic"> {
  const trimmed = syntax.trim();
  let required = false;
  let variadic = false;
  let name = trimmed;

  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    required = true;
    name = trimmed.slice(1, -1);
  } else if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    required = false;
    name = trimmed.slice(1, -1);
  }

  if (name.endsWith("...")) {
    variadic = true;
    name = name.slice(0, -3);
  }

  return { name, required, variadic };
}

// ── Command class ──────────────────────────────────────────────────────────

export class Command {
  private _name = "";
  private _description = "";
  private _version = "";
  private _versionFlags = "-V, --version";
  private _aliases: string[] = [];
  private _options: ParsedOption[] = [];
  private _arguments: ParsedArgument[] = [];
  private _commands: Command[] = [];
  private _actionHandler?: ActionFn;
  private _parent?: Command;
  private _allowUnknown = false;
  private _passthrough = false;
  private _helpOption: { flags: string; description: string } | false = {
    flags: "-h, --help",
    description: "display help for command",
  };
  private _preActionHooks: HookFn[] = [];
  private _postActionHooks: HookFn[] = [];
  private _showHelpAfterError = false;
  private _configureOutput?: {
    writeOut?: (str: string) => void;
    writeErr?: (str: string) => void;
    getOutHelpWidth?: () => number;
    getErrHelpWidth?: () => number;
  };
  private _exitCallback?: (code: number, error?: Error) => void;
  private _exitOverride = false;
  private _executableHandler = false;
  private _defaultCommandName?: string;
  private _addHelpCommand: boolean | undefined;
  private _hidden = false;
  private _combineFlagAndOptionalValue = true;

  // Raw args after parsing (for allowUnknownOption, passthrough, etc.)
  private _rawArgs: string[] = [];

  constructor(name?: string) {
    if (name) this._name = name;
  }

  // ── Builder API ────────────────────────────────────────────────────────

  name(str: string): this;
  name(): string;
  name(str?: string): this | string {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }

  description(str: string): this;
  description(): string;
  description(str?: string): this | string {
    if (str === undefined) return this._description;
    this._description = str;
    return this;
  }

  version(str: string, flags?: string, description?: string): this;
  version(): string;
  version(str?: string, flags?: string, _description?: string): this | string {
    if (str === undefined) return this._version;
    this._version = str;
    if (flags) this._versionFlags = flags;
    return this;
  }

  alias(name: string): this {
    this._aliases.push(name);
    return this;
  }

  aliases(names: string[]): this {
    names.forEach(n => this._aliases.push(n));
    return this;
  }

  command(nameAndArgs: string, opts?: { hidden?: boolean; isDefault?: boolean }): Command;
  command(nameAndArgs: string, description: string, opts?: { hidden?: boolean; isDefault?: boolean; executableFile?: string }): this;
  command(nameAndArgs: string, descOrOpts?: string | { hidden?: boolean; isDefault?: boolean }, opts?: { hidden?: boolean; isDefault?: boolean; executableFile?: string }): Command | this {
    const parts = nameAndArgs.trim().split(/\s+/);
    const cmdName = parts[0];
    const argDefs = parts.slice(1);

    // If a description string is provided, it's the "executable subcommand" form
    if (typeof descOrOpts === "string") {
      const sub = new Command(cmdName);
      sub._description = descOrOpts;
      sub._executableHandler = true;
      sub._parent = this;
      if (opts?.hidden) sub._hidden = true;
      if (opts?.isDefault) this._defaultCommandName = cmdName;
      for (const argStr of argDefs) {
        const argDef = parseArgumentSyntax(argStr);
        sub._arguments.push({ ...argDef, description: "", defaultValue: undefined });
      }
      this._commands.push(sub);
      return this;
    }

    const sub = new Command(cmdName);
    sub._parent = this;
    if (descOrOpts?.hidden) sub._hidden = true;
    if (descOrOpts?.isDefault) this._defaultCommandName = cmdName;

    for (const argStr of argDefs) {
      const argDef = parseArgumentSyntax(argStr);
      sub._arguments.push({ ...argDef, description: "", defaultValue: undefined });
    }

    this._commands.push(sub);
    return sub;
  }

  addCommand(cmd: Command, opts?: { hidden?: boolean; isDefault?: boolean }): this {
    cmd._parent = this;
    if (opts?.hidden) cmd._hidden = true;
    if (opts?.isDefault) this._defaultCommandName = cmd._name;
    this._commands.push(cmd);
    return this;
  }

  argument(syntax: string, description?: string, defaultValue?: unknown): this {
    const argDef = parseArgumentSyntax(syntax);
    this._arguments.push({
      ...argDef,
      description: description ?? "",
      defaultValue,
    });
    return this;
  }

  arguments(syntax: string): this {
    const parts = syntax.trim().split(/\s+/);
    for (const part of parts) {
      this.argument(part);
    }
    return this;
  }

  option(flags: string, description?: string, defaultValue?: unknown): this {
    const parsed = parseOptionFlags(flags);
    this._options.push({
      ...parsed,
      description: description ?? "",
      required: parsed.required,
      defaultValue,
      negate: parsed.negate,
    });
    return this;
  }

  requiredOption(flags: string, description?: string, defaultValue?: unknown): this {
    const parsed = parseOptionFlags(flags);
    this._options.push({
      ...parsed,
      description: description ?? "",
      required: true,
      defaultValue,
      negate: parsed.negate,
    });
    return this;
  }

  addOption(opt: ParsedOption): this {
    this._options.push(opt);
    return this;
  }

  action(fn: ActionFn): this {
    this._actionHandler = fn;
    return this;
  }

  allowUnknownOption(allow = true): this {
    this._allowUnknown = allow;
    return this;
  }

  allowExcessArguments(_allow = true): this {
    // For compatibility — we don't enforce argument count by default
    return this;
  }

  enablePositionalOptions(_enable = true): this {
    return this;
  }

  passThroughOptions(passthrough = true): this {
    this._passthrough = passthrough;
    return this;
  }

  storeOptionsAsProperties(_store = true): this {
    // Not implemented — options are always passed as object
    return this;
  }

  combineFlagAndOptionalValue(combine = true): this {
    this._combineFlagAndOptionalValue = combine;
    return this;
  }

  helpOption(flags: string | false, description?: string): this {
    if (flags === false) {
      this._helpOption = false;
    } else {
      this._helpOption = { flags, description: description ?? "display help for command" };
    }
    return this;
  }

  addHelpText(_position: "before" | "after" | "beforeAll" | "afterAll", _text: string): this {
    // Simplified — could store and display, but for now skip
    return this;
  }

  addHelpCommand(enable?: boolean | string): this {
    if (typeof enable === "boolean") {
      this._addHelpCommand = enable;
    } else {
      this._addHelpCommand = true;
    }
    return this;
  }

  showHelpAfterError(show = true): this {
    this._showHelpAfterError = show;
    return this;
  }

  showSuggestionAfterError(_show = true): this {
    return this;
  }

  configureOutput(config: {
    writeOut?: (str: string) => void;
    writeErr?: (str: string) => void;
    getOutHelpWidth?: () => number;
    getErrHelpWidth?: () => number;
  }): this {
    this._configureOutput = config;
    return this;
  }

  exitOverride(fn?: (err: Error) => void): this {
    this._exitOverride = true;
    if (fn) this._exitCallback = (_code, err) => { if (err) fn(err); };
    return this;
  }

  hook(event: "preAction" | "postAction", fn: HookFn): this {
    if (event === "preAction") this._preActionHooks.push(fn);
    else this._postActionHooks.push(fn);
    return this;
  }

  hidden(hide = true): this {
    this._hidden = hide;
    return this;
  }

  // ── Getters ────────────────────────────────────────────────────────────

  get args(): string[] {
    return this._rawArgs;
  }

  get commands(): Command[] {
    return this._commands;
  }

  get parent(): Command | undefined {
    return this._parent;
  }

  opts<T = Record<string, unknown>>(): T {
    return this._parsedOptions as T;
  }

  getOptionValue(key: string): unknown {
    return (this._parsedOptions as any)?.[key];
  }

  setOptionValue(key: string, value: unknown): this {
    (this._parsedOptions as any)[key] = value;
    return this;
  }

  private _parsedOptions: Record<string, unknown> = {};

  // ── Parsing ────────────────────────────────────────────────────────────

  parse(argv?: string[], opts?: { from?: "node" | "electron" | "user" }): this {
    const args = argv ?? process.argv;
    const from = opts?.from ?? "node";
    const userArgs = from === "user" ? args : args.slice(2);
    this._parseArgs(userArgs);
    return this;
  }

  parseAsync(argv?: string[], opts?: { from?: "node" | "electron" | "user" }): Promise<this> {
    const args = argv ?? process.argv;
    const from = opts?.from ?? "node";
    const userArgs = from === "user" ? args : args.slice(2);
    return this._parseArgs(userArgs, true) as Promise<this>;
  }

  private _parseArgs(argv: string[], async = false): this | Promise<this> {
    // Reset
    this._parsedOptions = {};
    this._rawArgs = [];

    // Apply defaults
    for (const opt of this._options) {
      if (opt.defaultValue !== undefined) {
        const key = optionAttributeName(opt.long);
        this._parsedOptions[key] = opt.defaultValue;
      }
      // Negate options default to true
      if (opt.negate) {
        const key = optionAttributeName(opt.long);
        this._parsedOptions[key] = true;
      }
    }

    // Try to match a subcommand first (before version/help, so `cmd --help` works on subcommands)
    const firstNonFlag = argv.find(a => !a.startsWith("-"));
    if (firstNonFlag) {
      const sub = this._findCommand(firstNonFlag);
      if (sub) {
        const idx = argv.indexOf(firstNonFlag);
        const subArgv = [...argv.slice(0, idx), ...argv.slice(idx + 1)];
        if (async) {
          return sub._parseArgs(subArgv, true) as Promise<this>;
        }
        sub._parseArgs(subArgv);
        return this;
      }
    }

    // Check for version flag
    if (this._version) {
      const vParsed = parseOptionFlags(this._versionFlags);
      if (argv.includes(vParsed.long) || (vParsed.short && argv.includes(vParsed.short))) {
        this._writeOut(`${this._version}\n`);
        this._exit(0);
        return this;
      }
    }

    // Check for help flag
    if (this._helpOption && this._checkHelp(argv)) {
      this.outputHelp();
      this._exit(0);
      return this;
    }

    // Check default command
    if (!firstNonFlag) {
      if (this._defaultCommandName) {
        const defaultCmd = this._findCommand(this._defaultCommandName);
        if (defaultCmd) {
          if (async) {
            return defaultCmd._parseArgs(argv, true) as Promise<this>;
          }
          defaultCmd._parseArgs(argv);
          return this;
        }
      }
    }

    // Parse options and arguments
    const positionals: string[] = [];
    const unknowns: string[] = [];
    let i = 0;

    while (i < argv.length) {
      const arg = argv[i];

      if (arg === "--") {
        // Everything after -- is positional
        positionals.push(...argv.slice(i + 1));
        break;
      }

      if (arg.startsWith("--")) {
        const eqIdx = arg.indexOf("=");
        const flag = eqIdx !== -1 ? arg.slice(0, eqIdx) : arg;
        const opt = this._findOption(flag);

        if (opt) {
          const key = optionAttributeName(opt.long);
          if (opt.negate) {
            this._parsedOptions[key] = false;
          } else if (opt.boolean) {
            this._parsedOptions[key] = true;
          } else if (eqIdx !== -1) {
            const val = arg.slice(eqIdx + 1);
            this._parsedOptions[key] = opt.variadic
              ? [...(this._parsedOptions[key] as any[] ?? []), val]
              : val;
          } else {
            i++;
            if (i >= argv.length) {
              this._writeErr(`error: option '${flag}' argument missing\n`);
              this._exit(1);
              return this;
            }
            const val = argv[i];
            if (opt.variadic) {
              const arr = (this._parsedOptions[key] as any[] ?? []);
              arr.push(val);
              this._parsedOptions[key] = arr;
              // Consume subsequent non-flag args for variadic
              while (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
                i++;
                arr.push(argv[i]);
              }
            } else {
              this._parsedOptions[key] = val;
            }
          }
        } else if (this._allowUnknown) {
          unknowns.push(arg);
          // Try to consume value if next arg is not a flag
          if (eqIdx === -1 && i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
            i++;
            unknowns.push(argv[i]);
          }
        } else {
          this._writeErr(`error: unknown option '${arg}'\n`);
          if (this._showHelpAfterError) this.outputHelp();
          this._exit(1);
          return this;
        }
      } else if (arg.startsWith("-") && arg.length > 1 && !arg.startsWith("-")) {
        // Short flags, possibly combined: -abc or -p 8080
        const chars = arg.slice(1);
        for (let j = 0; j < chars.length; j++) {
          const flag = `-${chars[j]}`;
          const opt = this._findOption(flag);
          if (opt) {
            const key = optionAttributeName(opt.long);
            if (opt.boolean) {
              if (opt.negate) {
                this._parsedOptions[key] = false;
              } else {
                this._parsedOptions[key] = true;
              }
            } else {
              // Rest of combined flags is the value, or next arg
              const rest = chars.slice(j + 1);
              if (rest && this._combineFlagAndOptionalValue) {
                this._parsedOptions[key] = rest;
              } else if (rest) {
                this._parsedOptions[key] = rest;
              } else {
                i++;
                if (i >= argv.length) {
                  this._writeErr(`error: option '${flag}' argument missing\n`);
                  this._exit(1);
                  return this;
                }
                this._parsedOptions[key] = argv[i];
              }
              break; // consumed the rest
            }
          } else if (this._allowUnknown) {
            unknowns.push(flag);
          } else {
            this._writeErr(`error: unknown option '${flag}'\n`);
            if (this._showHelpAfterError) this.outputHelp();
            this._exit(1);
            return this;
          }
        }
      } else {
        positionals.push(arg);
        if (this._passthrough) {
          positionals.push(...argv.slice(i + 1));
          break;
        }
      }
      i++;
    }

    // Validate choices
    for (const opt of this._options) {
      if (opt.choices) {
        const key = optionAttributeName(opt.long);
        const val = this._parsedOptions[key];
        if (val !== undefined && !opt.choices.includes(String(val))) {
          this._writeErr(`error: option '${opt.long}' must be one of: ${opt.choices.join(", ")} (received '${val}')\n`);
          this._exit(1);
          return this;
        }
      }
    }

    // Env var fallback
    for (const opt of this._options) {
      if (opt.envVar) {
        const key = optionAttributeName(opt.long);
        if (this._parsedOptions[key] === undefined && process.env[opt.envVar] !== undefined) {
          this._parsedOptions[key] = opt.boolean
            ? process.env[opt.envVar] !== "0" && process.env[opt.envVar] !== "false"
            : process.env[opt.envVar];
        }
      }
    }

    this._rawArgs = [...positionals, ...unknowns];

    // Map positionals to defined arguments
    const argValues: unknown[] = [];
    for (let ai = 0; ai < this._arguments.length; ai++) {
      const argDef = this._arguments[ai];
      if (argDef.variadic) {
        argValues.push(positionals.slice(ai));
        break;
      } else if (ai < positionals.length) {
        argValues.push(positionals[ai]);
      } else if (argDef.defaultValue !== undefined) {
        argValues.push(argDef.defaultValue);
      } else {
        argValues.push(undefined);
      }
    }

    // Execute action
    if (this._actionHandler) {
      const actionArgs = [...argValues, this._parsedOptions, this];
      if (async) {
        return (async () => {
          for (const hook of this._preActionHooks) await hook(this._parent ?? this, this);
          await this._actionHandler!(...actionArgs);
          for (const hook of this._postActionHooks) await hook(this._parent ?? this, this);
          return this;
        })() as Promise<this>;
      }
      // Sync — hooks and action may still return promises
      const result = (async () => {
        for (const hook of this._preActionHooks) await hook(this._parent ?? this, this);
        await this._actionHandler!(...actionArgs);
        for (const hook of this._postActionHooks) await hook(this._parent ?? this, this);
      })();
      // If action returns a promise, let it run but don't await in sync mode
      result.catch((err: Error) => {
        this._writeErr(`${err.message}\n`);
        this._exit(1);
      });
    }

    return this;
  }

  // ── Help ───────────────────────────────────────────────────────────────

  outputHelp(): void {
    this._writeOut(this.helpInformation());
  }

  helpInformation(): string {
    const lines: string[] = [];

    // Usage
    const usage = this._buildUsage();
    lines.push(`Usage: ${usage}`, "");

    // Description
    if (this._description) {
      lines.push(this._description, "");
    }

    // Arguments
    const visibleArgs = this._arguments.filter(a => a.description);
    if (visibleArgs.length > 0) {
      lines.push("Arguments:");
      const maxLen = Math.max(...visibleArgs.map(a => a.name.length));
      for (const arg of visibleArgs) {
        const pad = " ".repeat(maxLen - arg.name.length + 2);
        const def = arg.defaultValue !== undefined ? ` (default: ${JSON.stringify(arg.defaultValue)})` : "";
        lines.push(`  ${arg.name}${pad}${arg.description}${def}`);
      }
      lines.push("");
    }

    // Options
    const visibleOpts = [...this._options];
    if (this._helpOption) {
      visibleOpts.push({
        ...parseOptionFlags(this._helpOption.flags),
        description: this._helpOption.description,
        required: false,
        defaultValue: undefined,
        negate: false,
      });
    }
    if (this._version) {
      const vParsed = parseOptionFlags(this._versionFlags);
      visibleOpts.push({
        ...vParsed,
        description: "output the version number",
        required: false,
        defaultValue: undefined,
        negate: false,
      });
    }

    if (visibleOpts.length > 0) {
      lines.push("Options:");
      const formatted = visibleOpts.map(o => {
        const flags = [o.short, o.long].filter(Boolean).join(", ");
        const arg = o.argName
          ? (o.required ? ` <${o.argName}${o.variadic ? "..." : ""}>` : ` [${o.argName}${o.variadic ? "..." : ""}]`)
          : "";
        return { label: `${flags}${arg}`, desc: o.description, def: o.defaultValue };
      });
      const maxLen = Math.max(...formatted.map(f => f.label.length));
      for (const f of formatted) {
        const pad = " ".repeat(maxLen - f.label.length + 2);
        const def = f.def !== undefined ? ` (default: ${JSON.stringify(f.def)})` : "";
        lines.push(`  ${f.label}${pad}${f.desc}${def}`);
      }
      lines.push("");
    }

    // Commands
    const visibleCmds = this._commands.filter(c => !c._hidden);
    if (visibleCmds.length > 0) {
      lines.push("Commands:");
      const formatted = visibleCmds.map(c => {
        const aliases = c._aliases.length > 0 ? `|${c._aliases.join("|")}` : "";
        return { label: `${c._name}${aliases}`, desc: c._description };
      });
      const maxLen = Math.max(...formatted.map(f => f.label.length));
      for (const f of formatted) {
        const pad = " ".repeat(maxLen - f.label.length + 2);
        lines.push(`  ${f.label}${pad}${f.desc}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  help(cb?: (str: string) => string): void {
    let text = this.helpInformation();
    if (cb) text = cb(text);
    this._writeOut(text);
    this._exit(0);
  }

  // ── Internal helpers ───────────────────────────────────────────────────

  private _buildUsage(): string {
    const parts: string[] = [];
    // Walk up to root to build full command path
    const chain: Command[] = [];
    let cmd: Command | undefined = this;
    while (cmd) {
      chain.unshift(cmd);
      cmd = cmd._parent;
    }
    parts.push(chain.map(c => c._name).filter(Boolean).join(" "));

    if (this._options.length > 0) parts.push("[options]");
    if (this._commands.length > 0) parts.push("[command]");
    for (const arg of this._arguments) {
      if (arg.required) {
        parts.push(`<${arg.name}${arg.variadic ? "..." : ""}>`);
      } else {
        parts.push(`[${arg.name}${arg.variadic ? "..." : ""}]`);
      }
    }
    return parts.join(" ");
  }

  private _findCommand(name: string): Command | undefined {
    return this._commands.find(
      c => c._name === name || c._aliases.includes(name),
    );
  }

  private _findOption(flag: string): ParsedOption | undefined {
    return this._options.find(o => o.long === flag || o.short === flag);
  }

  private _checkHelp(argv: string[]): boolean {
    if (!this._helpOption) return false;
    const parsed = parseOptionFlags(this._helpOption.flags);
    return argv.includes(parsed.long) || (parsed.short !== undefined && argv.includes(parsed.short));
  }

  private _writeOut(str: string): void {
    (this._configureOutput?.writeOut ?? process.stdout.write.bind(process.stdout))(str);
  }

  private _writeErr(str: string): void {
    (this._configureOutput?.writeErr ?? process.stderr.write.bind(process.stderr))(str);
  }

  private _exit(code: number, error?: Error): void {
    if (this._exitOverride || this._exitCallback) {
      const err = error ?? new Error(`process exit with code ${code}`);
      if (this._exitCallback) {
        this._exitCallback(code, err);
      }
      throw err;
    }
    process.exit(code);
  }
}

// ── Factory ────────────────────────────────────────────────────────────────

export function createCommand(name?: string): Command {
  return new Command(name);
}

export function createProgram(): Command {
  return new Command();
}

/**
 * Default program instance — drop-in for `import { program } from "commander"`
 */
export const program = new Command();
