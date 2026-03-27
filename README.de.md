<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  Eine selbstentwickelnde Entwicklungspipeline, in der KI und Menschen Software über Generationen hinweg gemeinsam weiterentwickeln.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/architecture.png" alt="REAP Architecture" width="600" />
</p>

REAP ist eine generationsbasierte Entwicklungspipeline, in der KI und Menschen zusammenarbeiten, um Software zu erstellen und weiterzuentwickeln. Der Mensch gibt die Vision vor und trifft die wesentlichen Entscheidungen. Die KI erlernt das Projektwissen — Genome (Architektur, Konventionen, Einschränkungen) und Environment (Codebasis, Abhängigkeiten, Domäne) — und arbeitet dann durch strukturierte Generationen, um zu implementieren, zu überprüfen und anzupassen. Jede abgeschlossene Generation speist gewonnene Erkenntnisse in die Wissensbasis zurück. Im Laufe der Zeit entwickeln sich sowohl das Wissen als auch der Quellcode (Civilization) selbständig weiter.

## Inhaltsverzeichnis

- [Was ist REAP?](#was-ist-reap)
- [Installation](#installation)
- [Schnellstart](#schnellstart)
- [Lebenszyklus](#lebenszyklus-)
- [Kernkonzepte](#kernkonzepte-)
- [Merge-Lebenszyklus](#merge-lebenszyklus-)
- [Selbstentwickelnde Funktionen](#selbstentwickelnde-funktionen-)
- [Slash Commands](#slash-commands)
- [Agentenintegration](#agentenintegration-)
- [Projektstruktur](#projektstruktur)
- [Konfiguration](#konfiguration-)
- [Upgrade von v0.15](#upgrade-von-v015)

## Was ist REAP? [↗](https://reap.cc/docs/introduction)

Sind Ihnen bei der Entwicklung mit KI-Agenten schon einmal diese Probleme begegnet?

- **Kontextverlust** — Der Agent vergisst alles, wenn Sie eine neue Sitzung starten
- **Unstrukturierte Entwicklung** — Code wird ohne klare Richtung oder Ziel verändert
- **Design-Code-Abweichung** — Dokumentation weicht von der tatsächlichen Implementierung ab
- **Vergessene Erkenntnisse** — Mühsam gewonnene Einsichten werden nie weitergetragen
- **Zusammenarbeitschaos** — Mehrere Agenten oder Entwickler erzeugen widersprüchliche Änderungen

REAP löst diese Probleme mit einem **selbstentwickelnden Generationsmodell**:

- Jede Generation folgt einem strukturierten Lebenszyklus: aktuellen Zustand erfassen, Ziel planen, implementieren, validieren und reflektieren
- Der KI-Agent stellt den vollständigen Projektkontext automatisch bei jedem Sitzungsstart wieder her
- Präskriptives Wissen (Genome) entwickelt sich durch vom Menschen genehmigte Anpassungen bei Abschluss jeder Generation weiter
- Die KI wählt automatisch Ziele aus, indem sie die Lücke zwischen Vision und aktuellem Zustand analysiert
- Klarheitsgetriebene Interaktion stellt sicher, dass die KI strukturiert, mit Beispielen und ehrlichen Meinungen kommuniziert
- Parallele Arbeit über Branches hinweg wird durch einen Genome-first-Merge-Workflow abgeglichen

## Installation

> **Globale Installation erforderlich.**

```bash
npm install -g @c-d-cc/reap
```

> **Voraussetzungen**: [Node.js](https://nodejs.org) v18+, [Claude Code](https://claude.ai/claude-code) CLI.

## Schnellstart [↗](https://reap.cc/docs/quick-start)

Öffnen Sie Ihren KI-Agenten (Claude Code) und verwenden Sie Slash Commands:

```bash
# REAP in Ihrem Projekt initialisieren (erkennt automatisch Greenfield vs. bestehende Codebasis)
/reap.init

# Eine vollständige Generation ausführen
/reap.evolve
```

`/reap.evolve` steuert den gesamten Generationslebenszyklus — vom Lernen bis zum Abschluss. Die KI erkundet das Projekt, plant die Arbeit, implementiert sie, validiert und reflektiert. Dies ist der primäre Befehl für die tägliche Entwicklung.

> **Hinweis:** Benutzer interagieren mit REAP über `/reap.*` Slash Commands in ihrem KI-Agenten. Die CLI ist die interne Engine, die diese Befehle antreibt.

## Lebenszyklus [↗](https://reap.cc/docs/lifecycle)

Jede Generation folgt einem fünfstufigen Lebenszyklus.

```
learning → planning → implementation ⟷ validation → completion
```

| Phase | Was passiert | Artefakt |
|-------|-------------|----------|
| **Learning** | Projekt erkunden, Kontext aufbauen, Genome und Environment überprüfen | `01-learning.md` |
| **Planning** | Ziel definieren, Aufgaben zerlegen, Abhängigkeiten abbilden | `02-planning.md` |
| **Implementation** | Entwicklung in KI-Mensch-Zusammenarbeit | `03-implementation.md` |
| **Validation** | Tests ausführen, Abschlusskriterien überprüfen | `04-validation.md` |
| **Completion** | Reflektieren, Fitness-Feedback sammeln, Genome anpassen, archivieren | `05-completion.md` |

## Kernkonzepte [↗](https://reap.cc/docs/core-concepts)

### Genome — Wie gebaut wird [↗](https://reap.cc/docs/genome)

Das präskriptive Wissen des Projekts. Drei Dateien, immer vollständig geladen:

```
.reap/genome/
  application.md    # Projektidentität, Architektur, Konventionen, Einschränkungen
  evolution.md      # KI-Verhaltensrichtlinien, Entwicklungsrichtung, weiche Lebenszyklusregeln
  invariants.md     # Absolute Einschränkungen (nur vom Menschen bearbeitbar)
```

### Environment — Was aktuell existiert [↗](https://reap.cc/docs/environment)

Das deskriptive Wissen des Projekts. Zweistufige Ladestrategie:

```
.reap/environment/
  summary.md        # Wird immer beim Sitzungsstart geladen (~100 Zeilen)
  domain/           # Domänenwissen (bei Bedarf)
  resources/        # Externe Referenzdokumente — API-Docs, SDK-Spezifikationen (bei Bedarf)
  docs/             # Projekt-Referenzdokumente — Designdokumente, Spezifikationen (bei Bedarf)
  source-map.md     # Aktuelle Codestruktur + Abhängigkeiten (bei Bedarf)
```

### Vision — Wohin wir gehen [↗](https://reap.cc/docs/vision)

Langfristige Ziele und Richtung. Die KI verweist während der Adapt-Phase auf die Vision, um zu entscheiden, was als Nächstes am wertvollsten ist.

```
.reap/vision/
  goals.md          # Leitstern-Ziele
  docs/             # Planungsdokumente
  memory/           # KI-Gedächtnis (3-stufig: longterm, midterm, shortterm)
```

### Backlog [↗](https://reap.cc/docs/backlog)

Während einer Generation entdeckte Probleme werden nie sofort behoben. Sie werden als Backlog-Einträge in `.reap/life/backlog/` erfasst:

- `type: genome-change` — Genome-Änderungen, die in der Adapt-Phase angewendet werden
- `type: environment-change` — Environment-Aktualisierungen
- `type: task` — Arbeitsaufgaben für zukünftige Generationen

Backlog-Einträge werden automatisch zwischen Generationen übertragen. Verarbeitete Einträge werden mit der Lineage der Generation archiviert.

### Lineage — Was wir gelernt haben [↗](https://reap.cc/docs/lineage)

Archiv abgeschlossener Generationen mit zweistufiger automatischer Komprimierung:

- **Stufe 1**: Generationsordner (5 Artefakte) → einzelne Zusammenfassungsdatei
- **Stufe 2**: 100+ Stufe-1-Dateien → einzelne `epoch.md`

DAG-Metadaten werden für branchbewusste Lineage-Traversierung beibehalten.

### Hooks [↗](https://reap.cc/docs/hooks)

Dateibasierte Lebenszyklus-Event-Hooks in `.reap/hooks/`:
- `.md`-Dateien: KI-Prompts, die vom Agenten ausgeführt werden
- `.sh`-Dateien: Shell-Skripte, die direkt ausgeführt werden

### Prinzipien

- **Genome-Unveränderlichkeit**: Das Genome wird während einer Generation nie verändert. Probleme werden im Backlog erfasst und in der Adapt-Phase des Abschlusses angewendet.
- **Environment-Unveränderlichkeit**: Das Environment wird während einer Generation nie direkt verändert. Änderungen werden im Backlog erfasst und in der Reflect-Phase des Abschlusses angewendet.
- **Der Mensch beurteilt die Fitness**: Keine quantitativen Metriken. Das natürlichsprachliche Feedback des Menschen ist das einzige Fitness-Signal.
- **Selbstbewertung verboten**: Die KI bewertet ihren eigenen Erfolg nie. Nur Selbsteinschätzung (Metakognition) ist erlaubt.

## Merge-Lebenszyklus [↗](https://reap.cc/docs/merge-generation)

Wenn mehrere Entwickler oder Agenten parallel arbeiten, bietet REAP einen Genome-first-Merge-Workflow.

```
detect → mate → merge → reconcile → validation → completion
```

| Phase | Zweck |
|-------|-------|
| **Detect** | Abweichungen zwischen Branches erkennen |
| **Mate** | Genome-Konflikte zuerst lösen (der Mensch entscheidet) |
| **Merge** | Quellcode zusammenführen, geleitet vom finalisierten Genome |
| **Reconcile** | Genome-Quellcode-Konsistenz überprüfen |
| **Validation** | Tests ausführen |
| **Completion** | Zusammengeführtes Ergebnis committen und archivieren |

## Selbstentwickelnde Funktionen [↗](https://reap.cc/docs/self-evolving)

### Lückengetriebene Zielauswahl

Die KI wählt automatisch das Ziel der nächsten Generation aus, indem sie die Lücke zwischen Vision und aktuellem Zustand analysiert. Sie gleicht unerledigte Ziele in `vision/goals.md` mit ausstehenden Backlog-Einträgen ab, priorisiert nach Auswirkung und schlägt den wertvollsten nächsten Schritt vor. Der Mensch genehmigt oder passt an.

### Der Mensch beurteilt die Fitness

Keine quantitativen Metriken. Das natürlichsprachliche Feedback des Menschen während der Fitness-Phase ist das einzige Fitness-Signal. Die KI bewertet ihren eigenen Erfolg nie — nur Selbsteinschätzung (Metakognition) ist erlaubt.

### Klarheitsgetriebene Interaktion

Die KI passt ihren Kommunikationsstil an, je nachdem wie klar der aktuelle Kontext definiert ist:

- **Hohe Klarheit** (klares Ziel, definierte Aufgaben) → Ausführung mit minimalen Rückfragen
- **Mittlere Klarheit** (Richtung vorhanden, Details unklar) → 2-3 Optionen mit Abwägungen präsentieren
- **Geringe Klarheit** (mehrdeutiges Ziel) → Aktiver Dialog mit Beispielen, um ein gemeinsames Verständnis aufzubauen

### Cruise Mode

N Generationen für autonome Ausführung vorab genehmigen:
- Die KI wählt Ziele aus Visionslücken und durchläuft den gesamten Lebenszyklus autonom
- Bei erkannter Unsicherheit oder Risiko pausiert der Cruise-Modus und fordert menschliches Feedback an
- Nach Abschluss aller N Generationen überprüft der Mensch das Ergebnis

## Slash Commands [↗](https://reap.cc/docs/command-reference)

| Befehl | Beschreibung |
|--------|-------------|
| `/reap.evolve` | Eine vollständige Generation ausführen (empfohlen) |
| `/reap.start` | Eine neue Generation starten |
| `/reap.next` | Zur nächsten Phase vorrücken |
| `/reap.back` | Zu einer vorherigen Phase zurückkehren |
| `/reap.abort` | Aktuelle Generation abbrechen |
| `/reap.knowledge` | Genome/Environment überprüfen und verwalten |
| `/reap.merge` | Merge-Lebenszyklus-Operationen |
| `/reap.pull` | Fetch + Merge-Lebenszyklus |
| `/reap.push` | Validieren + Pushen |
| `/reap.status` | Aktuellen Zustand prüfen |
| `/reap.help` | Verfügbare Befehle anzeigen |
| `/reap.init` | REAP in einem Projekt initialisieren |
| `/reap.run` | Einen Lebenszyklusbefehl direkt ausführen |
| `/reap.config` | Projektkonfiguration anzeigen/bearbeiten |

## Agentenintegration

REAP integriert sich über Slash Commands und Lebenszyklus-Hooks mit KI-Agenten. Derzeit unterstützt: **Claude Code**. Die Architektur verwendet ein Adapter-Muster für zukünftige Agentenunterstützung.

### Funktionsweise

1. **CLAUDE.md** weist die KI an, Genome, Environment und reap-guide beim Sitzungsstart zu laden
2. **Slash Commands** rufen `reap run <cmd>` auf, das strukturierte JSON-Anweisungen für die KI zurückgibt
3. **Signaturbasiertes Locking** (Nonce-Chain) erzwingt die Phasenreihenfolge auf Code-Ebene — kein Überspringen, keine Fälschung, kein Replay

### Subagent-Modus

`/reap.evolve` kann die gesamte Generation an einen Subagenten delegieren, der autonom alle Phasen durchläuft und sich nur meldet, wenn er tatsächlich blockiert ist.

## Projektstruktur

```
my-project/
  src/                        # Ihr Code
  .reap/
    config.yml                # Projektkonfiguration
    genome/                   # Präskriptives Wissen (3 Dateien)
      application.md
      evolution.md
      invariants.md
    environment/              # Deskriptives Wissen (2-stufig)
      summary.md
      domain/
      resources/              # Externe Referenzdokumente (API, SDK)
      docs/                   # Projekt-Referenzdokumente (Design, Spezifikationen)
      source-map.md
    vision/                   # Langfristige Ziele
      goals.md
      docs/
      memory/                 # KI-Gedächtnis (longterm/midterm/shortterm)
    life/                     # Aktuelle Generation
      current.yml
      backlog/
    lineage/                  # Archiv abgeschlossener Generationen
    hooks/                    # Lebenszyklus-Hooks (.md/.sh)
```

## Konfiguration [↗](https://reap.cc/docs/configuration)

Projekteinstellungen in `.reap/config.yml`:

```yaml
project: my-project           # Projektname
language: english              # Artefakt-/Prompt-Sprache
autoSubagent: true             # Automatische Delegation an Subagent bei evolve
strictEdit: false               # Code-Änderungen auf REAP-Lebenszyklus beschränken
strictMerge: false              # Direktes git pull/push/merge einschränken
agentClient: claude-code       # KI-Agenten-Client
# cruiseCount: 1/5             # Vorhanden = Cruise-Modus (aktuell/gesamt)
```

Wichtige Einstellungen:
- **`cruiseCount`**: Wenn vorhanden, wird der Cruise-Modus aktiviert. Format `aktuell/gesamt`. Wird nach Abschluss des Cruise entfernt.
- **`strictEdit`**: Beschränkt Code-Änderungen auf die Implementierungsphase innerhalb des geplanten Umfangs.
- **`strictMerge`**: Beschränkt direktes git pull/push/merge — verwenden Sie stattdessen `/reap.pull`, `/reap.push`, `/reap.merge`.
- **`agentClient`**: Bestimmt, welcher Adapter für die Skill-Bereitstellung verwendet wird.

## Upgrade von v0.15 [↗](https://reap.cc/docs/migration-guide)

REAP v0.16 ist eine vollständige Neuentwicklung, basierend auf der [Self-Evolving Pipeline](https://reap.cc/docs/self-evolving)-Architektur.

### Migrationsschritte

1. **v0.16 installieren:**
   ```bash
   npm install -g @c-d-cc/reap
   ```
   Dies installiert automatisch v0.16-Skills nach `~/.claude/commands/` und entfernt veraltete v0.15-Skills auf Projektebene.

2. **Claude Code in Ihrem Projekt öffnen** und ausführen:
   ```
   /reap.update
   ```

3. **Der mehrstufigen Migration folgen:**

   | Phase | Was passiert | Ihre Rolle |
   |-------|-------------|-----------|
   | **Confirm** | Zeigt an, was sich ändert, erstellt Backup unter `.reap/v15/` | Überprüfen und bestätigen |
   | **Execute** | Verzeichnisse umstrukturieren, Konfiguration/Hooks/Lineage/Backlog migrieren | Automatisch |
   | **Genome Convert** | KI rekonstruiert Genome aus v0.15-Dateien in neue 3-Datei-Struktur | KI-Arbeit überprüfen |
   | **Vision** | vision/goals.md und Memory einrichten | Projektrichtung vorgeben |
   | **Complete** | Zusammenfassung der Migrationsergebnisse | Überprüfen |

4. **Überprüfen** Sie, dass Ihr Projekt funktioniert:
   ```
   /reap.status
   /reap.evolve
   ```

### Unterbrochene Migration

Wenn die Migration unterbrochen wird (API-Fehler, Sitzungsabbruch usw.), wird Ihr Fortschritt in `.reap/migration-state.yml` gespeichert. Führen Sie einfach `/reap.update` erneut aus — es wird dort fortgesetzt, wo es aufgehört hat, und bereits abgeschlossene Schritte überspringen.

Um stattdessen von vorne zu beginnen, löschen Sie `.reap/migration-state.yml` und führen Sie `/reap.update` erneut aus.

### Backup

Alle v0.15-Dateien werden unter `.reap/v15/` aufbewahrt. Nach Überprüfung der Migration können Sie dieses Verzeichnis bedenkenlos löschen.

### Was sich geändert hat

**Lebenszyklus neu gestaltet:**
- Die erste Phase ist jetzt `learning` (vorher `objective`). Die KI erkundet das Projekt, bevor sie Ziele setzt.
- Der Abschluss besteht jetzt aus 4 Phasen: `reflect` → `fitness` → `adapt` → `commit` (vorher 5 Phasen).
- Neue Konzepte: Embryo-Generationen, Cruise-Modus, visiongetriebene Planung.

**Vision-Ebene hinzugefügt:**
- `vision/goals.md` — Langfristige Ziele, lückengetriebene Zielauswahl in der Adapt-Phase
- `vision/memory/` — 3-stufiges Gedächtnis (longterm, midterm, shortterm) für generationsübergreifenden Kontext
- `vision/docs/` — Planungsdokumente und Spezifikationen

**Genome umstrukturiert (3 Dateien):**
- `application.md` — Projektidentität, Architektur, Konventionen, Einschränkungen
- `evolution.md` — KI-Verhaltensrichtlinien, Entwicklungsrichtung, weiche Lebenszyklusregeln
- `invariants.md` — Absolute Einschränkungen (nur vom Menschen bearbeitbar)

**Neue Funktionen:**
- Klarheitsgetriebene Interaktion: KI passt Kommunikationstiefe basierend auf Kontextklarheit an
- Cruise-Modus: N Generationen vorab genehmigen, KI läuft autonom mit Selbsteinschätzung
- Merge-Lebenszyklus mit Reconcile-Phase zur Genome-Quellcode-Konsistenzprüfung
- Vision-System mit 3-stufigem Gedächtnis für generationsübergreifenden Kontext

**Veraltete Befehle:**
- `/reap.sync` → `/reap.knowledge`
- `/reap.refreshKnowledge` → `/reap.knowledge`

## Autor

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## Lizenz

MIT
