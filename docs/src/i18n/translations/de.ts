import type { Translations } from "./en";

export const de: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "Erste Schritte",
    groups: {
      gettingStarted: "Erste Schritte",
      guide: "Leitfaden",
      collaboration: "Zusammenarbeit",
      reference: "Referenz",
      other: "Sonstiges",
    },
    items: {
      introduction: "Einführung",
      quickStart: "Schnellstart",
      coreConcepts: "Kernkonzepte",
      genome: "Genome",
      environment: "Environment",
      lifecycle: "Life Cycle",
      lineage: "Lineage",
      backlog: "Backlog",
      hooks: "Hooks",
      advanced: "Erweitert",
      collaborationOverview: "Verteilter Workflow",
      mergeGeneration: "Merge-Generation",
      mergeCommands: "Merge-Befehle",
      cliReference: "CLI-Referenz",
      commandReference: "Befehlsreferenz",
      hookReference: "Hook-Referenz",
      comparison: "Vergleich",
      configuration: "Konfiguration",
      recoveryGeneration: "Recovery-Generation",
      releaseNotes: "Versionshinweise",
    },
  },

  // Hero Page
  homeBanner: {
    text: "Breaking Changes in v0.16",
    cta: "Versionshinweise →",
  },
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "Eine Entwicklungspipeline, in der KI und Menschen zusammenarbeiten, um eine Anwendung über aufeinanderfolgende Generationen weiterzuentwickeln. Der Kontext bleibt zwischen Sitzungen erhalten, die Entwicklung folgt einem strukturierten Lebenszyklus, und Design-Dokumente entwickeln sich mit Ihrem Code weiter.",
    getStarted: "Erste Schritte →",
    whyReap: "Warum REAP?",
    whyReapDesc: "KI-Agenten sind leistungsstark — aber ohne Struktur wird die Entwicklung chaotisch. Der Kontext wird jede Sitzung zurückgesetzt. Codeänderungen streuen ohne Zweck. Design-Dokumente driften von der Realität ab. Erkenntnisse aus früherer Arbeit verschwinden.",
    problems: [
      { problem: "Kontextverlust", solution: "CLAUDE.md + Memory stellen automatisch den vollständigen Projektkontext in jeder Sitzung wieder her" },
      { problem: "Zerstreute Entwicklung", solution: "Jede Generation konzentriert sich auf ein Ziel durch einen strukturierten Lebenszyklus" },
      { problem: "Design-Code-Drift", solution: "Während der Implementierung entdeckte Genome-Mutationen fließen über das Backlog zurück" },
      { problem: "Vergessene Erkenntnisse", solution: "Retrospektiven sammeln sich im Genome. Lineage archiviert alle Generationen" },
      { problem: "Zusammenarbeitschaos", solution: "Genome-first Merge-Workflow gleicht parallele Branches ab — Designkonflikte vor Codekonflikten" },
    ],
    threeLayer: "4-Schichten-Architektur",
    threeLayerDesc: "REAP besteht aus vier miteinander verbundenen Schichten: Knowledge bildet die Grundlage, Vision gibt die Richtung vor, Generations führen die Arbeit aus, und Civilization ist das, was sich weiterentwickelt.",
    layers: [
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome (präskriptiv — Architektur, Konventionen, Einschränkungen) und Environment (deskriptiv — Tech-Stack, Quellstruktur, Domäne). Die Grundlage für die Arbeit jeder Generation." },
      { label: "Vision", sub: "Ziele + Memory", path: ".reap/vision/", desc: "Langfristige Ziele und Richtung. Vision treibt jede Generation an — sie bestimmt, welches Ziel als nächstes verfolgt wird. Memory bewahrt den Kontext über Sitzungen hinweg." },
      { label: "Generation", sub: "Evolutionszyklus", path: ".reap/life/ → .reap/lineage/", desc: "Jede Generation durchläuft Learning → Planning → Implementation → Validation → Completion. Nach Abschluss wird sie in der Lineage archiviert." },
      { label: "Civilization", sub: "Quellcode", path: "your codebase/", desc: "Alles außerhalb von .reap/. Was die Generationen weiterentwickeln. Erkenntnisse fließen in Knowledge zurück." },
    ],
    lifecycle: "Generations-Lebenszyklus",
    lifecycleDesc: "Jede Generation durchläuft fünf Phasen, von der Zieldefinition bis zur Retrospektive und Archivierung.",
    stages: [
      ["Learning", "Projekt erkunden, Kontext aufbauen, Genome und Environment prüfen", "01-learning.md"],
      ["Planning", "Aufgaben aufteilen, Ansatz wählen, Abhängigkeiten abbilden", "02-planning.md"],
      ["Implementation", "Entwicklung mit KI + Mensch-Zusammenarbeit", "03-implementation.md"],
      ["Validation", "Tests ausführen, Abschlusskriterien überprüfen", "04-validation.md"],
      ["Completion", "Reflektieren + Fitness-Feedback + Genome anpassen + Archivieren (4 Phasen)", "05-completion.md"],
    ],
    stageHeaders: ["Phase", "Was passiert", "Artefakt"],
    installation: "Installation",
    installStep1: "1. Global installieren",
    installStep2: "2. Claude Code öffnen, initialisieren und starten",
    installStep3: "",
    installNote: [
      { before: "", code: "/reap.evolve", after: " führt den gesamten Generationslebenszyklus — von Learning bis Completion — autonom aus. Sie können die Phasen auch manuell mit " },
      { linkText: "Phasenbefehlen", after: " steuern." },
    ],
    keyConcepts: "Schlüsselkonzepte",
    concepts: [
      { label: "Genome-Unveränderlichkeit", desc: "Das Genome wird während einer normalen Generation nie verändert. Probleme werden als genome-change Backlog-Einträge protokolliert und in der Adapt-Phase der Completion angewendet. (Embryo-Generationen erlauben freie Änderung.)" },
      { label: "Backlog & Aufschub", desc: "Einträge in .reap/life/backlog/ haben einen Typ: genome-change | environment-change | task. Teilweise Fertigstellung ist normal — aufgeschobene Aufgaben werden in die nächste Generation übertragen." },
      { label: "Vision & Memory", desc: "Vision (.reap/vision/) treibt das Ziel jeder Generation. Memory ist ein 3-stufiges Freiformat-Aufzeichnungssystem (longterm/midterm/shortterm), damit die KI Kontext über Sitzungen hinweg bewahren kann." },
      { label: "Lineage", desc: "Abgeschlossene Generationen werden in .reap/lineage/ archiviert. Retrospektiven sammeln sich dort an. Im Laufe der Zeit werden sie komprimiert (Level 1 → gen-XXX-{hash}.md, Level 2 → epoch.md), um handhabbar zu bleiben." },
      { label: "4-Schichten-Architektur", desc: "Vision (Ziele + Memory), Knowledge (Genome + Environment), Generation (Lebenszyklus), Civilization (Quellcode)." },
      { label: "Verteilter Workflow", desc: "Mehrere Entwickler oder Agenten arbeiten parallel an separaten Branches. /reap.pull holt und führt eine Genome-first Merge-Generation aus. /reap.push validiert den Zustand vor dem Push. Kein Server nötig — Git ist die Transportschicht." },
    ],
    documentation: "Dokumentation",
    docLinks: [
      { href: "/docs/introduction", title: "Einführung", desc: "Was ist REAP, warum es verwenden, 4-Schichten-Architektur." },
      { href: "/docs/quick-start", title: "Schnellstart", desc: "Installation und erste Generation Schritt für Schritt ausführen." },
      { href: "/docs/core-concepts", title: "Kernkonzepte", desc: "Genome, Lebenszyklus, Backlog & Aufschub im Detail." },
      { href: "/docs/lifecycle", title: "Life Cycle", desc: "/reap.evolve, Phasenbefehle, Mikro-Schleife, Completion-Phasen." },
      { href: "/docs/self-evolving", title: "Selbstentwicklung", desc: "Klarheitsgesteuerte Interaktion, Cruise-Modus, Memory, lückengesteuerte Evolution." },
      { href: "/docs/command-reference", title: "Befehlsreferenz", desc: "/reap.evolve, Phasenbefehle, /reap.status — alle Slash-Befehle." },
      { href: "/docs/hook-reference", title: "Hook-Referenz", desc: "Lebenszyklus-Hooks: dateibasierte Event-Hooks, Bedingungen, Reihenfolge." },
      { href: "/docs/migration-guide", title: "Migrationsleitfaden", desc: "Upgrade von v0.15 — schrittweise Migration mit Wiederaufnahme-Unterstützung." },
      { href: "/docs/comparison", title: "Vergleich", desc: "Wie REAP im Vergleich zu traditionellen spezifikationsgesteuerten Entwicklungstools abschneidet." },
      { href: "/docs/advanced", title: "Erweitert", desc: "Signaturbasierte Sperrung, Lineage-Komprimierung, Presets, Einstiegsmodi." },
    ],
  },

  // Introduction Page
  intro: {
    title: "Einführung",
    breadcrumb: "Erste Schritte",
    description: "REAP (Recursive Evolutionary Autonomous Pipeline) ist eine Entwicklungspipeline, in der KI und Menschen zusammenarbeiten, um eine Anwendung über aufeinanderfolgende Generationen inkrementell weiterzuentwickeln. Anstatt jede KI-Sitzung als isolierte Aufgabe zu behandeln, bewahrt REAP die Kontinuität durch einen strukturierten Lebenszyklus und eine lebende Wissensbasis namens Genome.",
    threeLayer: "4-Schichten-Architektur",
    layerItems: [
      { label: "Vision", sub: "Ziele + Memory", path: ".reap/vision/" },
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Generation", sub: "Evolutionszyklus", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "Quellcode", path: "your codebase/" },
    ],
    layerDescs: [
      "Langfristige Ziele und Richtung. Vision treibt jede Generation an — sie bestimmt, welches Ziel als nächstes verfolgt wird. Memory ist ein 3-stufiges Freiformat-Aufzeichnungssystem, damit die KI Kontext über Sitzungen hinweg bewahren kann.",
      "Genome (präskriptiv — Architektur, Konventionen, Einschränkungen) und Environment (deskriptiv — Tech-Stack, Quellstruktur, Domäne). Die Grundlage für die Arbeit jeder Generation.",
      "Ein einzelner Evolutionszyklus, angetrieben von Vision, verankert in Knowledge. Folgt Learning → Planning → Implementation → Validation → Completion.",
      "Quellcode und alle Projektartefakte außerhalb von .reap/. Was die Generationen weiterentwickeln. Erkenntnisse fließen in Knowledge zurück.",
    ],
    whyReap: "Warum REAP?",
    problemHeader: "Problem",
    solutionHeader: "REAP-Lösung",
    problems: [
      ["Kontextverlust — Agent vergisst Projektkontext jede Sitzung", "CLAUDE.md + Memory — Jede Sitzung lädt Genome, Environment und reap-guide. Memory bewahrt Kontext über Sitzungen hinweg."],
      ["Zerstreute Entwicklung — Code ohne klares Ziel verändert", "Generationsmodell — Jede Generation konzentriert sich auf ein Ziel mit einem strukturierten Lebenszyklus"],
      ["Design-Code-Drift — Dokumentation weicht vom Code ab", "Genome-Mutation über Backlog — Designfehler werden während der Implementierung protokolliert und in der Completion Adapt-Phase angewendet"],
      ["Vergessene Erkenntnisse — Einsichten aus früherer Arbeit gehen verloren", "Lineage & Memory — Erkenntnisse sammeln sich in Genome und Memory, Generationen werden archiviert und komprimiert"],
      ["Zusammenarbeitschaos — Parallele Arbeit führt zu widersprüchlichen Änderungen", "Verteilter Workflow — Genome-first Merge gleicht Design vor Code ab, DAG-Lineage verfolgt parallele Branches"],
    ],
    fourAxis: "4-Schichten-Architektur",
    fourAxisDesc: "REAP besteht aus vier miteinander verbundenen Schichten:",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "Langfristige Ziele und Richtung. Ziele + Memory für sitzungsübergreifenden Kontext." },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome (präskriptiv) + Environment (deskriptiv). Die Grundlage für jede Generation." },
      { axis: "Generation", path: ".reap/life/", desc: "Lebenszyklus der aktuellen Generation. Fortschrittsstatus und Artefakte." },
      { axis: "Civilization", path: "your codebase/ + .reap/lineage/", desc: "Quellcode + Archiv abgeschlossener Generationen." },
    ],
    projectStructure: "Projektstruktur",
  },

  // Quick Start Page
  quickstart: {
    title: "Schnellstart",
    breadcrumb: "Erste Schritte",
    prerequisites: "Voraussetzungen",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18 oder höher", required: true },
      { name: "npm", desc: "in Node.js enthalten", required: true },
      { name: "Claude Code oder OpenCode", desc: "KI-Agenten-CLI (mindestens eines erforderlich)", required: true },
      { name: "Bun", desc: "alternativer Paketmanager", required: false },
    ],
    required: "Erforderlich",
    optional: "Optional",
    install: "Installation",
    initProject: "Ein Projekt initialisieren",
    runFirst: "Erste Generation ausführen",
    runFirstDesc: "Öffnen Sie Claude Code in Ihrem Projektverzeichnis:",
    evolveTitle: "/reap.evolve ist der primäre Befehl",
    evolveDesc: "Er führt den gesamten Generationslebenszyklus — Learning, Planning, Implementation, Validation und Completion — autonom aus. Der KI-Agent steuert durch alle Phasen und hält nur an, wenn er wirklich blockiert ist. Dies ist der Befehl, den Sie am häufigsten für die tägliche Entwicklung verwenden werden.",
    manualControl: "Manuelle Phasensteuerung",
    manualControlDesc: "Sie können auch jede Phase einzeln steuern:",
    whatHappens: "Was während einer Generation passiert",
    stageHeaders: ["Phase", "Was passiert", "Artefakt"],
    stages: [
      ["Learning", "Projekt erkunden, Kontext aufbauen, Genome und Environment prüfen", "01-learning.md"],
      ["Planning", "Aufgaben aufteilen, Ansatz wählen, Abhängigkeiten abbilden", "02-planning.md"],
      ["Implementation", "Entwicklung mit KI + Mensch-Zusammenarbeit", "03-implementation.md"],
      ["Validation", "Tests ausführen, Abschlusskriterien überprüfen", "04-validation.md"],
      ["Completion", "Reflektieren, Fitness-Feedback sammeln, Genome anpassen, Archivieren", "05-completion.md"],
    ],
    commandLoading: "Wie Befehle geladen werden",
    commandLoadingDesc: "REAP Slash-Befehle werden nur in REAP-Projekten geladen — sie erscheinen nicht in Nicht-REAP-Projekten.",
    commandLoadingDetails: [
      { label: "Quelle", desc: "Befehlsoriginale werden in ~/.reap/commands/ gespeichert (installiert durch reap init und reap update)" },
      { label: "Laden", desc: "Wenn Sie ein REAP-Projekt öffnen, verknüpft der Session-Hook automatisch Befehle mit .claude/commands/" },
      { label: "Nicht-REAP-Projekte", desc: "Es werden keine Symlinks erstellt, daher erscheinen keine REAP-Skills in der Skill-Liste des KI-Agenten" },
      { label: "Abwärtskompatibilität", desc: "Weiterleitungs-Stubs in ~/.claude/commands/ stellen sicher, dass ältere Setups während der Migration weiterhin funktionieren" },
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "Kernkonzepte",
    breadcrumb: "Leitfaden",
    fourAxisTitle: "4-Schichten-Architektur",
    fourAxisDesc: "REAP besteht aus vier miteinander verbundenen Schichten:",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "Langfristige Ziele und Richtung. Ziele treiben jede Generation. Memory bewahrt Kontext über Sitzungen hinweg.", href: "/docs/self-evolving" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome (präskriptiv — wie man baut) + Environment (deskriptiv — was existiert). Die Grundlage für jede Generation.", href: "/docs/genome" },
      { axis: "Generation", path: ".reap/life/", desc: "Ein einzelner Evolutionszyklus, angetrieben von Vision, verankert in Knowledge. Folgt Learning → Planning → Implementation → Validation → Completion.", href: "/docs/lifecycle" },
      { axis: "Civilization", path: "your codebase/", desc: "Quellcode und alle Projektartefakte außerhalb von .reap/. Was die Generationen weiterentwickeln. Erkenntnisse fließen in Knowledge zurück.", href: "/docs/lineage" },
    ],
    principlesTitle: "Schlüsselprinzipien",
    principles: [
      { name: "Genome-Unveränderlichkeit", desc: "Wird während einer normalen Generation nie verändert. Änderungen gehen über Backlog → Completion Adapt-Phase. (Embryo-Generationen erlauben freie Änderung.)" },
      { name: "Mensch beurteilt Fitness", desc: "Keine quantitativen Metriken. Das natürlichsprachliche Feedback des Menschen ist das einzige Fitness-Signal." },
      { name: "Klarheitsgesteuerte Interaktion", desc: "Die KI passt die Kommunikationstiefe basierend auf der Kontextklarheit an — von aktivem Dialog bis zur autonomen Ausführung. Siehe Selbstentwickelnde Features für Details." },
    ],
    lifecycleTitle: "Lebenszyklus-Übersicht",
    lifecycleDesc: "Jede Generation folgt fünf Phasen und erzeugt bei jedem Schritt Artefakte:",
    stageHeaders: ["Phase", "Was passiert", "Artefakt"],
    stages: [
      ["Learning", "Projekt erkunden, Kontext aufbauen, Genome und Environment prüfen", "01-learning.md"],
      ["Planning", "Aufgabenzerlegung + Implementierungsplan", "02-planning.md"],
      ["Implementation", "Code mit KI + Mensch-Zusammenarbeit", "03-implementation.md"],
      ["Validation", "Tests ausführen, Abschlusskriterien überprüfen", "04-validation.md"],
      ["Completion", "Reflektieren + Fitness-Feedback + Genome anpassen + Archivieren (4 Phasen)", "05-completion.md"],
    ],
    sessionInitTitle: "Laden des Sitzungskontexts",
    sessionInitDesc: "Wenn Sie ein REAP-Projekt öffnen, weist CLAUDE.md den KI-Agenten an, Genome, Environment und den REAP-Leitfaden zu lesen. Der Agent lädt sofort das Wissen des Projekts und versteht den aktuellen Zustand.",
    sessionInitAlt: "REAP-Sitzungskontextladung — Genome, Environment und Leitfaden werden über CLAUDE.md geladen",
    evolutionFlowTitle: "Evolutionsfluss",
    evolutionFlowDesc: "Wissen akkumuliert über Generationen hinweg. Jede Generation entwickelt das Genome weiter, und Erkenntnisse sammeln sich in der Lineage:",
  },

  // Workflow Page
  workflow: {
    title: "Workflow",
    breadcrumb: "Leitfaden",
    intro: "Eine Generation ist die grundlegende Arbeitseinheit in REAP. Jede Generation verfolgt ein einzelnes Ziel durch fünf Phasen und erzeugt dabei Artefakte. Hier erfahren Sie, was in jeder Phase passiert und wie sie zusammenhängen.",
    evolveTitle: "/reap.evolve — Die primäre Arbeitsweise",
    evolveDesc: "Meistens führen Sie /reap.evolve aus und lassen den KI-Agenten autonom durch alle Phasen steuern. Er kann die gesamte Generation an einen Subagenten delegieren, der alle Phasen durchläuft und nur auftaucht, wenn er wirklich blockiert ist (mehrdeutiges Ziel, bedeutsamer Kompromiss, Genome-Konflikt oder unerwarteter Fehler). Der Subagent übernimmt das Starten, die Ausführung jeder Phase, das Fortschreiten und die Archivierung.",
    evolveNote: "Für feinkörnige Kontrolle können Sie einzelne Phasenbefehle ausführen. Siehe Befehlsreferenz für Details.",
    stageWalkthrough: "Phasen-Durchgang",
    stageDetails: [
      {
        title: "1. Learning",
        desc: "Erkunden Sie das Projekt und bauen Sie Kontext auf. Die KI prüft Genome, Environment, Lineage und bewertet das Klarheitsniveau. Sie baut ein gründliches Verständnis des aktuellen Zustands auf, bevor ein Ziel festgelegt wird.",
        output: "01-learning.md — Kontexterkundung, Genome/Environment-Prüfung, Klarheitsbewertung.",
      },
      {
        title: "2. Planning",
        desc: "Zerlegen Sie das Ziel in umsetzbare Aufgaben. Die KI liest den Kontext aus dem Learning, referenziert Genome-Konventionen und -Einschränkungen und schlägt einen Implementierungsplan mit Architekturentscheidungen vor.",
        output: "02-planning.md — phasenweise Aufgabenliste, Abhängigkeiten, parallelisierbare Aufgaben markiert mit [P].",
      },
      {
        title: "3. Implementation",
        desc: "Schreiben Sie den Code. Aufgaben werden sequenziell ausgeführt, wobei jeder Abschluss sofort erfasst wird. Wenn Genome- oder Environment-Defekte entdeckt werden, werden sie im Backlog protokolliert — nie direkt angewendet. Aufgaben, die von ausstehenden Genome-Änderungen abhängen, werden als [deferred] markiert.",
        output: "03-implementation.md — abgeschlossene Aufgabentabelle, aufgeschobene Aufgaben, genome-change Backlog-Einträge.",
      },
      {
        title: "4. Validation",
        desc: "Überprüfen Sie die Arbeit. Führen Sie Tests, Lint, Build und Typprüfungen aus. Prüfen Sie die Abschlusskriterien und wenden Sie kleinere Korrekturen an (5 Minuten oder weniger, keine Designänderungen). Das Urteil lautet pass, partial (einige Kriterien aufgeschoben) oder fail.",
        output: "04-validation.md — Testergebnisse mit tatsächlicher Befehlsausgabe, Kriterienprüfungstabelle, Urteil.",
      },
      {
        title: "5. Completion (4 Phasen)",
        desc: "Reflect: Retrospektive schreiben + Environment aktualisieren. Fitness: menschliches Feedback sammeln (oder Selbstbewertung im Cruise-Modus). Adapt: Genome prüfen, Backlog-Änderungen anwenden, nächste Generationsziele vorschlagen. Commit: In Lineage archivieren + Git-Commit.",
        output: "05-completion.md — Retrospektive, Fitness-Feedback, Genome-Änderungsprotokoll, Hinweise für nächste Generation.",
      },
    ],
    microLoop: "Mikro-Schleife (Regression)",
    microLoopDesc: "Jede Phase kann zu einer vorherigen Phase zurückkehren. Das ist üblich — Validation schlägt fehl und man kehrt zur Implementation zurück, oder ein Planungsfehler wird während der Implementation entdeckt und man geht zurück zum Planning. Der Regressionsgrund wird in der Timeline und dem Zielartefakt festgehalten.",
    artifactHandling: "Artefaktbehandlung bei Regression:",
    artifactRules: [
      { label: "Vor der Zielphase:", desc: "Unverändert erhalten" },
      { label: "Zielphase:", desc: "Überschrieben (Implementation hängt nur an)" },
      { label: "Nach der Zielphase:", desc: "Erhalten, bei erneutem Eintritt überschrieben" },
    ],
    minorFix: "Kleinere Korrektur",
    minorFixDesc: "Triviale Probleme (Tippfehler, Lint-Fehler usw.) können direkt in der aktuellen Phase ohne Regression behoben werden, solange sie innerhalb von 5 Minuten lösbar sind und keine Designänderungen erfordern. Die Korrektur wird im Phasenartefakt festgehalten.",
    roleSeparation: "Rollentrennung",
    roleHeaders: ["Wer", "Rolle"],
    roles: [
      ["CLI (reap)", "Projektsetup und -wartung — init, status, run"],
      ["KI-Agent", "Workflow-Ausführer — führt die Arbeit jeder Phase über Slash-Befehle aus"],
      ["Mensch", "Entscheidungsträger — setzt Ziele, prüft Code, gibt Fitness-Feedback"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI-Referenz",
    breadcrumb: "Referenz",
    initTitle: "reap init",
    initDesc: "Ein neues REAP-Projekt initialisieren. Erkennt automatisch Greenfield (leeres Projekt) vs. Adoption (vorhandene Codebasis). Erstellt die .reap/-Struktur und installiert Slash-Befehle und Hooks.",
    initHeaders: ["Option", "Werte", "Beschreibung"],
    initOptions: [
      ["--mode", "greenfield | adoption", "Automatisch erkannten Projekt-Einstiegsmodus überschreiben"],
      ["--repair", "", "Eine defekte .reap/-Struktur reparieren ohne Neuinitialisierung"],
      ["--migrate", "", "Von v0.15 auf v0.16-Struktur migrieren"],
    ],
    statusTitle: "reap status",
    statusDesc: "Aktuellen Projekt- und Generationsstatus anzeigen.",
    statusNote: "Zeigt Projektname, aktive Generation (ID, Ziel, Phase), Gesamtzahl abgeschlossener Generationen und REAP-Version an.",
    runTitle: "reap run",
    runDesc: "Einen Lebenszyklusbefehl direkt ausführen. Wird intern von Slash-Befehlen und für feinkörnige Phasensteuerung verwendet.",
    runNote: "Beispiele: reap run start --goal \"...\", reap run learning, reap run completion --phase reflect. Jeder Befehl gibt strukturierte JSON-Anweisungen für den KI-Agenten zurück.",
    fixTitle: "reap fix",
    fixDesc: "Die .reap/-Verzeichnisstruktur diagnostizieren und reparieren. Verwenden Sie --check für den schreibgeschützten Modus (Probleme melden ohne zu reparieren).",
    fixNote: "Prüft auf fehlende Verzeichnisse, überprüft ob config.yml existiert, validiert die current.yml-Phase und erstellt fehlende Struktur neu. Mit --check wird eine strukturelle Integritätsprüfung ohne Änderungen durchgeführt.",
    cleanTitle: "reap clean",
    cleanDesc: "REAP-Projekt mit interaktiven Optionen zurücksetzen.",
    cleanNote: "Bietet interaktive Eingabeaufforderungen zum selektiven Zurücksetzen von Teilen des REAP-Projekts (z.B. life, lineage, genome).",
    destroyTitle: "reap destroy",
    destroyDesc: "Alle REAP-Dateien aus dem Projekt entfernen.",
    destroyNote: "Entfernt vollständig das .reap/-Verzeichnis und alle REAP-bezogenen Dateien aus dem Projekt. Erfordert die Eingabe von \"yes destroy\" zur Bestätigung.",
    makeBacklogTitle: "reap make backlog",
    makeBacklogDesc: "Einen Backlog-Eintrag erstellen. Die einzige unterstützte Methode zum Erstellen von Backlog-Dateien.",
    makeBacklogNote: "Optionen: --type <genome-change|environment-change|task> --title <title> [--body <body>] [--priority <priority>]. Erstellen Sie Backlog-Dateien nie direkt.",
    cruiseTitle: "reap cruise",
    cruiseDesc: "Cruise-Modus setzen — N Generationen für autonome Ausführung vorab genehmigen.",
    cruiseNote: "Verwendung: reap cruise <count>. Jede Generation durchläuft den vollständigen Lebenszyklus mit Selbstbewertung. Wenn Unsicherheit oder Risiko erkannt wird, pausiert der Cruise und fordert menschliches Feedback an.",
    helpTitle: "reap help",
    helpDesc: "CLI-Befehle, Slash-Befehle und eine Workflow-Zusammenfassung ausgeben.",
    helpNote: "Gibt Hilfetext in der konfigurierten Sprache aus (derzeit en und ko unterstützt). Fällt auf Englisch zurück, wenn die Sprachdatei nicht gefunden wird.",
  },

  // Command Reference Page
  commands: {
    title: "Befehlsreferenz",
    breadcrumb: "Referenz",
    intro: "REAP hat zwei Arten von Befehlen: CLI-Befehle und Slash-Befehle.",
    cliCommandsDesc: "CLI-Befehle (reap ...) werden in Ihrem Terminal ausgeführt. Sie behandeln Projektsetup und -wartung — init, status, run, fix, clean, destroy, make backlog, cruise. Sie interagieren nicht mit dem KI-Agenten.",
    slashCommandsDesc: "Slash-Befehle (/reap.*) werden innerhalb von KI-Agenten-CLIs (Claude Code) ausgeführt. Sie steuern den Entwicklungsworkflow — der KI-Agent liest die Eingabeaufforderung und führt die beschriebene Aufgabe interaktiv mit Ihnen aus.",
    slashTitle: "Slash-Befehle",
    slashIntro: "Alle REAP-Interaktionen laufen über /reap.* Slash-Befehle. Diese sind die primäre Schnittstelle für Benutzer und KI-Agenten.",
    commandHeaders: ["Befehl", "Beschreibung"],
    normalTitle: "Lebenszyklus-Befehle",
    normalCommands: [
      ["/reap.evolve", "Einen gesamten Generationslebenszyklus ausführen (empfohlen). Der primäre Befehl für die tägliche Entwicklung. Durchläuft alle Phasen — Learning, Planning, Implementation, Validation, Completion."],
      ["/reap.start", "Eine neue Generation starten. Fragt nach einem Ziel, erstellt current.yml und setzt die Phase auf Learning."],
      ["/reap.next", "Zur nächsten Lebenszyklusphase vorrücken. Überprüft die Existenz des Artefakts und die Nonce-Kette vor dem Vorrücken."],
      ["/reap.back", "Zu einer vorherigen Phase zurückkehren (Mikro-Schleife). Verwendung: /reap.back [--reason \"<grund>\"]"],
      ["/reap.abort", "Aktuelle Generation abbrechen. 2-Phasen-Prozess: confirm (zeigt was passiert) dann execute. Optionen: --phase execute, --reason, --source-action <rollback|stash|hold|none>, --save-backlog."],
    ],
    mergeTitle: "Zusammenarbeits-Befehle",
    mergeCommands: [
      ["/reap.merge", "Merge-Lebenszyklus für parallele Branches. Verwendung: /reap.merge [--type merge --parents \"<branchA>,<branchB>\"]"],
      ["/reap.pull", "Remote-Änderungen abrufen und Merge-Möglichkeiten erkennen."],
      ["/reap.push", "REAP-Zustand validieren (warnt wenn Generation in Arbeit) und den aktuellen Branch zum Remote pushen."],
    ],
    generalTitle: "Allgemeine Befehle",
    generalCommands: [
      ["/reap.init", "REAP in einem Projekt initialisieren. Erkennt automatisch Greenfield vs. vorhandene Codebasis."],
      ["/reap.knowledge", "Genome, Environment und Kontextwissen verwalten. Unterbefehle: reload, genome, environment."],
      ["/reap.config", "Projektkonfiguration (.reap/config.yml) anzeigen/bearbeiten."],
      ["/reap.status", "Aktuellen Generationsstatus, Phasenfortschritt und Backlog-Zusammenfassung prüfen."],
      ["/reap.help", "Verfügbare Befehle und Themen anzeigen."],
      ["/reap.run", "Einen Lebenszyklusbefehl direkt ausführen. Für feinkörnige Phasen- und Phasensteuerung."],
      ["/reap.update", "Migration von v0.15 auf v0.16 ausführen."],
    ],
    commandStructure: "Script-Orchestrator-Architektur",
    commandStructureDesc: "Jeder Slash-Befehl ist ein einzeiliger .md-Wrapper, der reap run <cmd> aufruft. Das TypeScript-Skript behandelt die gesamte deterministische Logik und gibt strukturierte JSON-Anweisungen für den KI-Agenten zurück. Muster: Gate (Vorbedingungsprüfung) → Steps (Arbeitsausführung) → Artifact (aufgezeichnet in .reap/life/).",
  },

  // Recovery Generation Page
  recovery: {
    title: "Recovery-Generation",
    breadcrumb: "Sonstiges",
    intro: "Eine Recovery-Generation ist ein spezieller Generationstyp, der Artefakte vergangener Generationen überprüft und korrigiert, wenn Fehler oder Inkonsistenzen entdeckt werden. Sie verwendet type: recovery und referenziert Zielgenerationen über das recovers-Feld.",
    triggerTitle: "Wie auslösen",
    triggerDesc: "Verwenden Sie den /reap.evolve.recovery-Befehl mit der Zielgenerations-ID. Das System überprüft die Artefakte der Zielgeneration und erstellt nur dann eine Recovery-Generation, wenn Korrekturen erforderlich sind.",
    criteriaTitle: "Überprüfungskriterien",
    criteriaHeaders: ["Kriterium", "Beschreibung"],
    criteriaItems: [
      ["Artefakt-Inkonsistenz", "Widersprüche zwischen Artefakten innerhalb derselben Generation (z.B. Ziel vs. Implementierungsdesign-Diskrepanz)"],
      ["Strukturelle Defekte", "Fehlende Abschnitte, unvollständiger Inhalt oder Formatfehler in Artefakten"],
      ["Vom Menschen angegebene Korrektur", "Korrekturen, die ausdrücklich vom Benutzer angefordert wurden"],
    ] as string[][],
    processTitle: "Prozessablauf",
    processDesc: "Der Recovery-Befehl läuft in zwei Phasen: review (Artefakte gegen Kriterien analysieren) und create (Recovery-Generation starten, wenn Probleme gefunden werden).",
    processFlow: `/reap.evolve.recovery gen-XXX
  → Lineage-Artefakte der Zielgeneration laden
  → Gegen 3 Kriterien prüfen
  → Probleme gefunden → Recovery-Generation automatisch starten (type: recovery)
  → Keine Probleme   → "keine Recovery erforderlich" (keine Generation erstellt)`,
    stagesTitle: "Phasenzweck-Vergleich",
    stagesDesc: "Recovery-Generationen folgen demselben 5-Phasen-Lebenszyklus wie normale Generationen, aber jede Phase dient einem anderen Zweck.",
    stageHeaders: ["Phase", "Normal", "Recovery"],
    stageItems: [
      ["Learning", "Projekt erkunden, Kontext aufbauen", "Artefakte der Zielgeneration prüfen, benötigte Korrekturen identifizieren"],
      ["Planning", "Aufgabenzerlegung", "Zu prüfende Dateien/Logik + Überprüfungskriterien auflisten"],
      ["Implementation", "Code schreiben", "Vorhandenen Code prüfen und korrigieren"],
      ["Validation", "Überprüfen", "Nach Korrektur überprüfen"],
      ["Completion", "Retrospektive", "Retrospektive + Korrekturprotokoll für die ursprüngliche Generation"],
    ] as string[][],
    currentYmlTitle: "current.yml-Erweiterung",
    currentYmlDesc: "Recovery-Generationen fügen ein recovers-Feld zu current.yml und meta.yml hinzu. Das parents-Feld folgt normalen DAG-Regeln, während recovers separat das Korrekturziel referenziert.",
    notesTitle: "Hinweise",
    notes: [
      "Beeinflusst bestehende normale/Merge-Generationen nicht",
      "Dieselben Lineage-Komprimierungsregeln gelten für Recovery-Generationen",
      "Recovery-Generationen erzeugen dieselben 5 Artefakte wie normale Generationen",
      "Das Ziel zitiert automatisch das ursprüngliche Ziel + den Abschluss der Zielgeneration",
    ],
  },

  // Configuration Page
  config: {
    title: "Konfiguration",
    breadcrumb: "Referenz",
    intro: "REAP-Projekte werden über .reap/config.yml konfiguriert. Diese Datei wird während reap init erstellt und steuert Projekteinstellungen, Strict-Modus und Agenten-Integration.",
    structure: "Konfigurationsdateistruktur",
    fields: "Felder",
    fieldHeaders: ["Feld", "Beschreibung"],
    fieldItems: [
      ["project", "Projektname (während init festgelegt)"],
      ["language", "Sprache für Artefakte und Benutzerinteraktionen (z.B. korean, english, japanese). Standard: english"],
      ["autoSubagent", "Automatische Delegation von /reap.evolve an einen Subagenten über Agent-Tool (Standard: true)"],
      ["strictEdit", "Codeänderungen auf REAP-Lebenszyklus beschränken (Standard: false). Siehe Strict-Modus unten."],
      ["strictMerge", "Direktes git pull/push/merge einschränken — stattdessen REAP-Befehle verwenden (Standard: false). Siehe Strict-Modus unten."],
      ["agentClient", "Zu verwendender KI-Agenten-Client (Standard: claude-code). Bestimmt welcher Adapter für Skill-Bereitstellung und Session-Hooks verwendet wird"],
      ["cruiseCount", "Wenn vorhanden, aktiviert Cruise-Modus. Format: aktuell/gesamt (z.B. 1/5). Wird nach Abschluss des Cruise automatisch entfernt"],
    ],
    strictMode: "Strict-Modus",
    strictModeDesc: "Der Strict-Modus steuert, was der KI-Agent tun darf. Zwei unabhängige Einstellungen:",
    strictConfigExample: `strictEdit: true    # Codeänderungen auf REAP-Lebenszyklus beschränken
strictMerge: true   # Rohes git pull/push/merge einschränken`,
    strictEditTitle: "strictEdit — Codeänderungskontrolle",
    strictEditDesc: "Wenn aktiviert, kann der KI-Agent Code außerhalb des REAP-Workflows nicht ändern.",
    strictHeaders: ["Kontext", "Verhalten"],
    strictRules: [
      ["Keine aktive Generation / Nicht-Implementation-Phase", "Codeänderungen sind vollständig blockiert"],
      ["Implementation-Phase", "Nur Änderungen innerhalb des Umfangs von 02-planning.md sind erlaubt"],
      ["Ausstiegsklausel", "Benutzer fordert ausdrücklich \"override\" oder \"bypass strict\" an — Umgehung gilt nur für diese spezifische Aktion, dann greift der Strict-Modus wieder"],
    ],
    strictMergeTitle: "strictMerge — Git-Befehlskontrolle",
    strictMergeDesc: "Wenn aktiviert, werden direkte git pull-, git push- und git merge-Befehle eingeschränkt. Der Agent leitet Benutzer an, stattdessen REAP Slash-Befehle zu verwenden (/reap.pull, /reap.push, /reap.merge).",
    strictNote: "Beide sind standardmäßig deaktiviert. Das Lesen von Dateien, Analysieren von Code und Beantworten von Fragen ist unabhängig vom Strict-Modus immer erlaubt.",
    entryModes: "Einstiegsmodi",
    entryModeHeaders: ["Modus", "Anwendungsfall"],
    entryModeItems: [
      ["greenfield", "Neues Projekt von Grund auf"],
      ["adoption", "REAP auf eine bestehende Codebasis anwenden"],
      ["migration", "Von einem bestehenden System zu einer neuen Architektur migrieren"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hooks",
    breadcrumb: "Leitfaden",
    intro: "REAP-Hooks ermöglichen die Ausführung von Automatisierung bei wichtigen Lebenszyklus-Events. Hooks werden als einzelne Dateien in .reap/hooks/ gespeichert und der KI-Agent führt sie zum richtigen Zeitpunkt aus.",
    hookTypes: "Hook-Typen",
    hookTypesIntro: "Jede Hook-Datei unterstützt einen von zwei Typen basierend auf ihrer Erweiterung:",
    commandType: "command (.sh)",
    commandTypeDesc: "Ein Shell-Skript. Wird im Projektstammverzeichnis vom KI-Agenten ausgeführt. Verwenden für Skripte, CLI-Tools, Build-Befehle.",
    promptType: "prompt (.md)",
    promptTypeDesc: "Eine KI-Agenten-Anweisung in Markdown. Der Agent liest die Eingabeaufforderung und führt die beschriebene Aufgabe aus — Codeanalyse, Dateiänderungen, Dokumentationsaktualisierungen usw. Verwenden für Aufgaben, die Urteilsvermögen erfordern.",
    hookTypeNote: "Jeder Hook ist eine einzelne Datei. Mehrere Hooks pro Event werden in der durch Frontmatter festgelegten Reihenfolge ausgeführt.",
    fileNaming: "Dateibenennung",
    fileNamingDesc: "Hook-Dateien folgen dem Muster: .reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "Jede Hook-Datei unterstützt optionales YAML-Frontmatter:",
    frontmatterHeaders: ["Feld", "Beschreibung"],
    frontmatterItems: [
      ["condition", "Name eines Bedingungsskripts in .reap/hooks/conditions/ (z.B. always, has-code-changes, version-bumped)"],
      ["order", "Numerische Ausführungsreihenfolge wenn mehrere Hooks für dasselbe Event existieren (Standard: 50, niedrigere laufen zuerst)"],
    ],
    events: "Events",
    normalEventsTitle: "Normale Lebenszyklus-Events",
    mergeEventsTitle: "Merge-Lebenszyklus-Events",
    eventHeaders: ["Event", "Wann es ausgelöst wird"],
    eventItems: [
      ["onLifeStarted", "Nachdem /reap.start eine neue Generation erstellt hat"],
      ["onLifeLearned", "Nachdem die Learning-Phase abgeschlossen ist"],
      ["onLifePlanned", "Nachdem die Planning-Phase abgeschlossen ist"],
      ["onLifeImplemented", "Nachdem die Implementation-Phase abgeschlossen ist"],
      ["onLifeValidated", "Nachdem die Validation-Phase abgeschlossen ist"],
      ["onLifeCompleted", "Nach Completion + Archivierung (läuft nach dem Git-Commit)"],
      ["onLifeTransited", "Nach jedem Phasenübergang (generisch)"],
      ["onMergeStarted", "Nachdem eine Merge-Generation erstellt wurde"],
      ["onMergeDetected", "Nachdem die Detect-Phase abgeschlossen ist"],
      ["onMergeMated", "Nachdem die Mate-Phase abgeschlossen ist (Genome aufgelöst)"],
      ["onMergeMerged", "Nachdem die Merge-Phase abgeschlossen ist (Quellcode zusammengeführt)"],
      ["onMergeReconciled", "Nachdem die Reconcile-Phase abgeschlossen ist (Genome-Quellcode-Konsistenz verifiziert)"],
      ["onMergeValidated", "Nachdem die Merge-Validation abgeschlossen ist"],
      ["onMergeCompleted", "Nach Merge-Completion + Archivierung"],
      ["onMergeTransited", "Nach jedem Merge-Phasenübergang (generisch)"],
    ],
    configuration: "Dateibasierte Konfiguration",
    configurationDesc: "Hooks sind dateibasiert — gespeichert in .reap/hooks/, nicht in config.yml. Jeder Hook ist eine Datei mit dem Namen {event}.{name}.{md|sh}.",
    configExample: `.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md

# Beispiel: .md Hook (KI-Eingabeaufforderung)
# ---
# condition: has-code-changes
# order: 30
# ---
# Änderungen prüfen und Dokumentation bei Bedarf aktualisieren.

# Beispiel: .sh Hook (Shell-Skript)
# #!/bin/bash
# # condition: always
# # order: 20
# reap update`,
    hookSuggestion: "Automatische Hook-Vorschläge",
    hookSuggestionDesc: "Während der Completion-Phase (Phase 5: Hook-Vorschlag) erkennt REAP wiederkehrende Muster über Generationen hinweg — wie wiederkehrende manuelle Schritte, wiederholte Befehle oder konsistente Post-Phase-Aktionen. Wenn ein Muster erkannt wird, schlägt REAP vor, einen Hook zur Automatisierung zu erstellen. Die Hook-Erstellung erfordert immer eine Benutzerbestätigung, bevor sie angewendet wird.",
    sessionStart: "Laden des Sitzungskontexts",
    sessionStartDesc1: "REAP fügt CLAUDE.md einen Abschnitt hinzu, der den KI-Agenten anweist, Genome, Environment und den REAP-Leitfaden bei jedem Sitzungsstart zu lesen. Dies stellt sicher, dass der Agent immer den vollständigen Projektkontext hat.",
    sessionStartDesc2: "Der REAP-Leitfaden (~/.reap/reap-guide.md) wird global installiert und automatisch aktualisiert, wenn das Paket aktualisiert wird. CLAUDE.md wird während 'reap init' erstellt oder aktualisiert.",
    sessionStartNote: "",
    executionNotes: "Ausführungshinweise",
    executionItems: [
      "Hooks werden vom KI-Agenten ausgeführt, nicht von der CLI. Der Agent durchsucht .reap/hooks/ nach passenden Dateien.",
      ".sh-Dateien werden als Shell-Skripte im Projektstammverzeichnis ausgeführt.",
      ".md-Dateien werden als KI-Eingabeaufforderungen gelesen und vom Agenten befolgt.",
      "Hooks innerhalb desselben Events laufen in Reihenfolge (Frontmatter 'order'-Feld, niedrigere laufen zuerst).",
      "Bedingungen werden über .reap/hooks/conditions/{name}.sh ausgewertet (Exit 0 = ausführen, nicht-null = überspringen).",
      "onLifeCompleted/onMergeCompleted Hooks laufen nach dem Git-Commit — alle Dateiänderungen durch Hooks werden nicht committet.",
    ],
  },

  // Advanced Page
  advanced: {
    title: "Erweitert",
    breadcrumb: "Leitfaden",
    signatureTitle: "Signaturbasierte Sperrung",
    signatureDesc: "REAP verwendet eine kryptographische Nonce-Kette zur Durchsetzung der Phasenreihenfolge. Ohne eine gültige Nonce kann der KI-Agent nicht zur nächsten Phase vorrücken — selbst wenn er versucht, vorwärts zu springen.",
    signatureFlow: `Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
generate nonce ──────→ store hash(nonce)
return nonce to AI                         ←── AI passes nonce
                                               verify hash(nonce)
                                               ✓ advance stage`,
    signatureHow: "Funktionsweise",
    signatureHowItems: [
      "Phasenbefehl (z.B. /reap.objective) generiert eine zufällige Nonce",
      "Der SHA-256-Hash der Nonce wird in current.yml gespeichert",
      "Die Nonce wird dem KI-Agenten in der JSON-Antwort zurückgegeben",
      "/reap.next empfängt die Nonce, hasht sie und vergleicht mit current.yml",
      "Übereinstimmung → Phase rückt vor. Keine Übereinstimmung → abgelehnt.",
    ],
    signatureComparisonTitle: "Nur-Prompt vs. signaturbasiert",
    signatureComparisonHeaders: ["Bedrohung", "Nur-Prompt", "Signaturbasiert"],
    signatureComparisonItems: [
      ["Phasen überspringen", "Verlässt sich auf KI-Konformität", "Blockiert — keine gültige Nonce"],
      ["Token fälschen", "N/A", "Nicht machbar — Einweg-Hash"],
      ["Alte Nonces wiederverwenden", "N/A", "Blockiert — einmalig, phasengebunden"],
      ["Prompt-Injection", "Anfällig", "Nonce ist extern zum Prompt-Kontext"],
    ],
    compressionTitle: "Lineage-Komprimierung",
    compressionDesc: "Wenn sich Generationen ansammeln, werden Lineage-Archive während der Completion-Phase automatisch komprimiert.",
    compressionHeaders: ["Level", "Eingabe", "Ausgabe", "Auslöser", "Schutz"],
    compressionItems: [
      ["Level 1", "Generationsordner (5 Artefakte)", "gen-XXX-{hash}.md (40 Zeilen)", "Lineage > 5.000 Zeilen + 5+ Generationen", "Neueste 3 + DAG-Blattknoten"],
      ["Level 2", "100+ Level-1-Dateien", "Einzelne epoch.md", "Level-1-Dateien > 100", "Neueste 9 + Verzweigungspunkte"],
    ],
    compressionProtection: "DAG-Erhaltung: Level-1-Dateien behalten Metadaten im Frontmatter. Level-2 epoch.md speichert eine Generations-Hash-Kette. Fork-Schutz: Alle lokalen/Remote-Branches werden vor Level-2-Komprimierung gescannt — Verzweigungspunkte werden geschützt. Epoch-komprimierte Generationen können nicht als Merge-Basis verwendet werden.",
    presetsTitle: "Presets",
    presetsDesc: "Presets bieten vorkonfiguriertes Genome und Projektgerüst für gängige Stacks.",
    presetsNote: "Das bun-hono-react Preset konfiguriert das Genome mit Konventionen für einen Bun + Hono + React Stack, einschließlich geeigneter Architekturprinzipien, Konventionen und Einschränkungen.",
    entryModes: "Einstiegsmodi",
    entryModesDesc: "Wird mit reap init --mode angegeben. Steuert wie das Genome initial strukturiert wird.",
    entryModeHeaders: ["Modus", "Beschreibung"],
    entryModeItems: [
      ["greenfield", "Ein neues Projekt von Grund auf erstellen. Standardmodus. Genome beginnt leer und wächst."],
      ["migration", "Neu erstellen unter Bezugnahme auf ein bestehendes System. Genome wird mit Analyse des bestehenden Systems vorbelegt."],
      ["adoption", "REAP auf eine bestehende Codebasis anwenden. Genome beginnt mit Vorlagen und wird während der Learning-Phase der ersten Generation befüllt."],
    ],
  },

  // Distributed Workflow - Overview
  collaboration: {
    title: "Verteilter Workflow",
    breadcrumb: "Zusammenarbeit",
    intro: "REAP unterstützt einen verteilten Workflow für Zusammenarbeitsumgebungen, in denen mehrere Entwickler oder KI-Agenten parallel am selben Projekt arbeiten — ohne zentralen Server. Git ist die einzige Transportschicht.",
    caution: "Der verteilte Workflow befindet sich derzeit in einem frühen Stadium und erfordert weitere Tests. Verwenden Sie ihn mit Vorsicht in Produktionsumgebungen. Wir sammeln aktiv Benutzerfeedback — bitte melden Sie Probleme oder Vorschläge unter",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "Funktionsweise",
    howItWorksDesc: "Jeder Entwickler oder Agent arbeitet unabhängig auf seinem eigenen Branch und seiner eigenen Generation. Wenn es Zeit ist zusammenzuführen, orchestriert REAP den Merge mit einer Genome-first-Strategie.",
    flowSteps: [
      "Maschine A schließt gen-046-a auf branch-a ab → /reap.push",
      "Maschine B schließt gen-046-b auf branch-b ab → /reap.push",
      "Maschine A führt /reap.pull branch-b aus → Fetch + vollständiger Merge-Generations-Lebenszyklus",
    ],
    principles: "Schlüsselprinzipien",
    principleItems: [
      { label: "Opt-in", desc: "git pull/push funktionieren immer normal. REAP-Befehle sind additiv — Sie entscheiden, wann Sie den verteilten Workflow nutzen." },
      { label: "Genome-first", desc: "Genome-Konflikte werden vor dem Quellcode-Merge aufgelöst. Wie eine Verfassungsänderung vor der Gesetzesanpassung." },
      { label: "Kein Server", desc: "Alles ist lokal + Git. Keine externen Dienste, keine zentrale Koordination." },
      { label: "DAG-Lineage", desc: "Jede Generation referenziert ihre Eltern über eine hash-basierte ID (gen-046-a3f8c2) und bildet einen gerichteten azyklischen Graphen, der parallele Arbeit natürlich unterstützt." },
    ],
    scenarios: "Anwendungsszenarien",
    scenarioItems: [
      { label: "Remote-Branches (Multi-Maschine)", desc: "Verschiedene Entwickler oder Agenten arbeiten auf separaten Maschinen und pushen zu Remote-Branches. Verwenden Sie /reap.push zum Veröffentlichen, /reap.pull <branch> zum Abrufen und Zusammenführen.", example: "/reap.push → /reap.pull branch-b" },
      { label: "Lokale Worktrees (Multi-Agent)", desc: "Mehrere KI-Agenten arbeiten parallel auf derselben Maschine mit Git-Worktrees. Jeder Worktree hat seinen eigenen Branch und seine eigene Generation. Verwenden Sie /reap.merge.start zum direkten Zusammenführen — kein Fetch nötig.", example: "/reap.merge.start worktree-branch" },
      { label: "Gemischt", desc: "Einige Arbeiten sind lokal (Worktrees), einige remote (andere Maschinen). Kombinieren Sie /reap.pull für Remote-Branches und /reap.merge.start für lokale Branches nach Bedarf." },
    ],
    pullPush: "Pull & Push (Remote)",
    pullDesc: "/reap.pull <branch> ist das verteilte Äquivalent von /reap.evolve. Es ruft den Remote ab, erkennt neue Generationen und führt einen vollständigen Merge-Generations-Lebenszyklus aus — von Detect bis Completion.",
    pushDesc: "/reap.push validiert den aktuellen REAP-Zustand (warnt wenn eine Generation in Arbeit ist) und pusht den aktuellen Branch zum Remote.",
    merge: "Merge (Lokal / Worktree)",
    mergeDesc: "/reap.merge.start <branch> erstellt eine Merge-Generation direkt von einem lokalen Branch — ideal für Worktree-basierte parallele Entwicklung, wo kein Fetch benötigt wird. Verwenden Sie /reap.merge.evolve um den vollständigen Merge-Lebenszyklus auszuführen, oder gehen Sie manuell durch jede Phase.",
    gitRefReading: "Git-Ref-basiertes Lesen",
    gitRefDesc: "Vor einem Merge werden Genome und Lineage des Zielbranches über Git-Refs gelesen (git show, git ls-tree) — kein Checkout erforderlich. Dies funktioniert sowohl für Remote- als auch für lokale Branches.",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "Merge-Generation",
    breadcrumb: "Zusammenarbeit",
    intro: "Wenn divergierte Branches zusammengeführt werden müssen, führt REAP einen spezialisierten 6-Phasen-Lebenszyklus namens Merge-Generation aus — getrennt vom normalen Generationslebenszyklus. Das Kernprinzip: zuerst das Genome ausrichten, dann den Quellcode zusammenführen.",
    whyLonger: "Warum unterscheidet sich die Merge-Generation von einem regulären Git-Merge?",
    whyLongerDesc: "Ein regulärer Git-Merge löst nur Quellcode-Konflikte auf. Aber wenn sich zwei Branches unabhängig weiterentwickeln — jeweils mit eigenen Generationen, Genome-Änderungen und Designentscheidungen — reicht es nicht aus, nur den Quellcode zusammenzuführen. Das Genome (Architekturprinzipien, Konventionen, Einschränkungen, Geschäftsregeln) kann ebenfalls divergiert sein. Die Merge-Generation fügt drei kritische Schritte vor dem Quellcode-Merge hinzu: Erkennung der Genome-Divergenz, Mating (Auflösung von Genome-Konflikten) und Überprüfung der Genome-Quellcode-Konsistenz nach dem Merge. Dies stellt sicher, dass die zusammengeführte Codebasis nicht nur kompilierbar, sondern auch designkonsistent ist.",
    whyGenomeFirst: "Warum die Genome-Ausrichtung zuerst kommt",
    whyGenomeFirstDesc: "Die Auflösung von Quellcode-Konflikten garantiert nicht die Abwesenheit semantischer Konflikte. Zwei Code-Teile können sauber zusammengeführt werden — überhaupt keine Git-Konflikte — und dennoch in Absicht, Architektur oder Geschäftslogik widersprechen. Nur Genome-basiertes Denken kann diese unsichtbaren Konflikte erkennen: Folgt der zusammengeführte Code noch den Architekturprinzipien? Sind die Konventionen konsistent? Stimmen die Geschäftsregeln überein? Deshalb richtet REAP das Genome aus, bevor der Quellcode angefasst wird. Sobald das Genome feststeht, wird es zum maßgeblichen Leitfaden für die Lösung von Quellcode-Konflikten — nicht nur syntaktisch, sondern semantisch.",
    whyLongerPoints: [
      { label: "Regulärer Git-Merge", desc: "Quellcode-Konflikte → lösen → committen. Designkonsistenz wird nicht geprüft. Semantische Konflikte bleiben unerkannt." },
      { label: "Merge-Generation", desc: "Genome zuerst ausrichten → Quellcode-Merge durch Genome geleitet → Genome-Quellcode-Konsistenz überprüfen → validieren → committen. Unsichtbare semantische Konflikte werden erkannt." },
    ],
    stageOrder: "Phasenreihenfolge",
    stages: [
      { name: "Detect", desc: "Den Zielbranch über Git-Refs scannen. Den gemeinsamen Vorfahren mittels DAG-BFS finden. Genome-Diffs extrahieren. Konflikte als WRITE-WRITE oder CROSS-FILE klassifizieren.", artifact: "01-detect.md" },
      { name: "Mate", desc: "Alle Genome-Konflikte dem Menschen präsentieren. Für WRITE-WRITE: A, B wählen oder manuell zusammenführen. Für CROSS-FILE: logische Kompatibilität prüfen. Das Genome muss vollständig aufgelöst sein, bevor es weitergeht.", artifact: "02-mate.md" },
      { name: "Merge", desc: "git merge --no-commit mit dem Zielbranch ausführen. Quellcode-Konflikte geleitet vom finalisierten Genome auflösen. Auf semantische Konflikte prüfen — Code der kompiliert, aber dem Genome widerspricht.", artifact: "03-merge.md" },
      { name: "Reconcile", desc: "Genome-Quellcode-Konsistenz nach dem Merge überprüfen. KI vergleicht Genome und Quellcode. Benutzer bestätigt gefundene Inkonsistenzen. Bei Problemen Regression zu Merge oder Mate.", artifact: "04-reconcile.md" },
      { name: "Validation", desc: "Alle mechanischen Testbefehle ausführen (Test, Lint, Build, Typprüfung). Bei Fehlschlägen Regression zu Merge oder Mate.", artifact: "05-validation.md" },
      { name: "Completion", desc: "Das zusammengeführte Ergebnis committen. Den Merge in meta.yml mit type: merge und beiden Eltern aufzeichnen. In Lineage archivieren.", artifact: "06-completion.md" },
    ],
    stageHeaders: ["Phase", "Was passiert", "Artefakt"],
    conflictTypes: "Konflikttypen",
    conflictHeaders: ["Typ", "Beschreibung", "Auflösung"],
    conflicts: [
      ["WRITE-WRITE", "Dieselbe Genome-Datei auf beiden Branches geändert", "Mensch entscheidet: A behalten, B behalten oder zusammenführen"],
      ["CROSS-FILE", "Verschiedene Genome-Dateien geändert, aber beide Branches haben Genome geändert", "Mensch prüft auf logische Kompatibilität"],
      ["Quellcode-Konflikt", "Git-Merge-Konflikt im Quellcode", "Geleitet vom finalisierten Genome aufgelöst"],
      ["Semantischer Konflikt", "Code wird sauber zusammengeführt, widerspricht aber dem Genome (Architektur, Konventionen, Geschäftsregeln)", "Erkannt in der Reconcile-Phase — KI vergleicht Genome und Quellcode, Benutzer bestätigt Auflösung"],
      ["Kein Konflikt", "Keine Genome- oder Quellcode-Konflikte", "Läuft automatisch weiter"],
    ],
    regression: "Merge-Regression",
    regressionDesc: "Validation- oder Reconcile-Fehlschläge können zu Merge oder Mate zurückkehren. Merge kann zu Mate zurückkehren, wenn ein Genome-Problem entdeckt wird. Regressionsregeln folgen demselben Muster wie bei normalen Generationen — Grund wird in Timeline und Artefakt festgehalten.",
    currentYml: "current.yml-Struktur (Merge)",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "Merge-Befehle",
    breadcrumb: "Zusammenarbeit",
    intro: "Alle verteilten Workflow-Operationen sind Slash-Befehle, die vom KI-Agenten ausgeführt werden. Es gibt keine CLI-Befehle für Merge — der KI-Agent ist essenziell für die Genome-Konfliktauflösung und die Quellcode-Merge-Führung.",
    primaryCommands: "Primäre Befehle",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "Der All-in-One-Befehl für verteiltes Zusammenführen. Ruft den Remote ab, erkennt neue Generationen auf dem Zielbranch, erstellt eine Merge-Generation und führt den vollständigen Merge-Lebenszyklus aus. Dies ist das verteilte Äquivalent von /reap.evolve." },
      { cmd: "/reap.merge <branch>", desc: "Eine vollständige Merge-Generation für einen lokalen Branch ausführen. Kein Fetch — ideal für Worktree-basierte parallele Entwicklung. Das lokale Äquivalent von /reap.pull." },
      { cmd: "/reap.push", desc: "Validiert den REAP-Zustand (warnt wenn eine Generation in Arbeit ist) und pusht den aktuellen Branch. Verwenden nach Abschluss einer Generation." },
    ],
    stageCommands: "Phasenbefehle (feinkörnige Steuerung)",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "Eine Merge-Generation für einen Zielbranch erstellen. Führt Detect aus und generiert 01-detect.md." },
      { cmd: "/reap.merge.detect", desc: "Den Divergenzbericht prüfen. Bei Bedarf erneut ausführen." },
      { cmd: "/reap.merge.mate", desc: "Genome-Konflikte interaktiv mit dem Menschen auflösen." },
      { cmd: "/reap.merge.merge", desc: "git merge --no-commit ausführen und Quellcode-Konflikte auflösen." },
      { cmd: "/reap.merge.reconcile", desc: "Genome-Quellcode-Konsistenz überprüfen. KI vergleicht Genome und Quellcode, Benutzer bestätigt Inkonsistenzen." },
      { cmd: "/reap.merge.validation", desc: "Mechanische Tests ausführen (bun test, tsc, build). Bei Fehlschlag Regression." },
      { cmd: "/reap.merge.completion", desc: "Die Merge-Generation committen und archivieren." },
      { cmd: "/reap.merge.evolve", desc: "Den Merge-Lebenszyklus von der aktuellen Phase bis Completion ausführen." },
    ],
    mergeHooks: "Merge-Hooks",
    mergeHookHeaders: ["Event", "Wann es ausgelöst wird"],
    mergeHookItems: [
      ["onMergeStarted", "Nachdem /reap.merge.start eine Merge-Generation erstellt hat"],
      ["onMergeDetected", "Nachdem die Detect-Phase abgeschlossen ist"],
      ["onMergeMated", "Nachdem die Mate-Phase abgeschlossen ist (Genome aufgelöst)"],
      ["onMergeMerged", "Nachdem die Merge-Phase abgeschlossen ist (Quellcode zusammengeführt)"],
      ["onMergeReconciled", "Nachdem die Reconcile-Phase abgeschlossen ist (Genome-Quellcode-Konsistenz verifiziert)"],
      ["onMergeValidated", "Nachdem die Merge-Validation abgeschlossen ist"],
      ["onMergeCompleted", "Nach Merge-Completion + Archivierung"],
      ["onMergeTransited", "Nach jedem Merge-Phasenübergang (generisch)"],
    ],
    mergeHookNote: "onMergeTransited wird bei jedem Merge-Phasenübergang ausgelöst, ähnlich wie onLifeTransited für den normalen Lebenszyklus.",
  },

  // Comparison Page
  comparison: {
    title: "Vergleich",
    breadcrumb: "Erste Schritte",
    heading: "Vergleich mit Spec Kit",
    desc: "Spec Kit hat die spezifikationsgesteuerte Entwicklung eingeführt — Spezifikationen vor dem Code schreiben. REAP baut auf diesem Konzept auf und behebt wesentliche Einschränkungen:",
    items: [
      { title: "Statische Spezifikationen vs. lebendes Genome", desc: "Traditionelle Tools behandeln Spezifikationen als statische Dokumente. REAPs Genome ist ein lebendes System — während der Implementierung gefundene Defekte fließen über das Backlog zurück und werden bei Completion angewendet. Das Design entwickelt sich mit dem Code weiter." },
      { title: "Kein sitzungsübergreifendes Gedächtnis", desc: "Die meisten KI-Entwicklungstools verlieren den Kontext zwischen Sitzungen. REAPs CLAUDE.md + 3-stufiges Memory-System stellt automatisch den vollständigen Projektkontext (Genome, Environment, Vision, Memory) in jeder neuen Sitzung wieder her." },
      { title: "Linearer Workflow vs. Mikro-Schleifen", desc: "Traditionelle Tools folgen einem linearen Ablauf (Spezifikation → Plan → Erstellen). REAP unterstützt strukturierte Regression — jede Phase kann zu einer vorherigen zurückkehren und dabei Artefakte bewahren." },
      { title: "Isolierte Aufgaben vs. generationale Evolution", desc: "Jede Aufgabe in traditionellen Tools ist unabhängig. In REAP bauen Generationen aufeinander auf. Wissen akkumuliert durch Lineage-Archive und Genome-Evolution." },
      { title: "Keine Lebenszyklus-Hooks", desc: "REAP bietet 16 Hooks auf Phasenebene (onLifeStarted bis onMergeCompleted) für Automatisierung an jedem Punkt des Lebenszyklus." },
    ],
  },

  // Genome Page
  genomePage: {
    title: "Genome",
    breadcrumb: "Leitfaden",
    intro: "Das Genome ist REAPs maßgebliche Wissensquelle — Architekturprinzipien, Entwicklungskonventionen, technische Einschränkungen und Domänenregeln. Es ist die DNA Ihres Projekts.",
    structureTitle: "Struktur",
    structure: `.reap/genome/
├── application.md     # Projektidentität, Architektur, Konventionen
├── evolution.md       # KI-Verhaltensleitfaden, Evolutionsrichtung
└── invariants.md      # Absolute Einschränkungen (nur durch Menschen editierbar)`,
    principlesTitle: "Drei Dateien",
    principles: [
      "application.md — Projektidentität, Architekturentscheidungen, Entwicklungskonventionen und Einschränkungen.",
      "evolution.md — KI-Verhaltensleitfaden, Interaktionsprinzipien, Code-Qualitätsregeln und weiche Lebenszyklusregeln.",
      "invariants.md — Absolute Einschränkungen, die nie verletzt werden dürfen. Nur der Mensch kann diese Datei bearbeiten.",
    ],
    immutabilityTitle: "Genome-Unveränderlichkeit",
    immutabilityDesc: "Das Genome wird während einer normalen Generation nie verändert. Während der Implementation entdeckte Probleme werden als genome-change Backlog-Einträge erfasst und nur während der Completion Adapt-Phase angewendet.",
    immutabilityWhy: "Ausnahme: Embryo-Generationen (Frühphasenprojekte) erlauben freie Genome-Änderung in jeder Phase. Sobald das Projekt reift, schlägt die KI während der Adapt-Phase den Übergang von Embryo zu Normal vor, und der Mensch genehmigt.",
    contextTitle: "Immer geladen",
    contextDesc: "Alle drei Genome-Dateien werden beim Sitzungsstart über CLAUDE.md vollständig in den Kontext des KI-Agenten geladen. Der Agent hat immer Zugriff auf die Architektur, Konventionen und Einschränkungen Ihres Projekts — kein manuelles Briefing nötig.",
    evolutionTitle: "Evolution durch Generationen",
    evolutionDesc: "Am Ende jeder Generation (Completion Adapt-Phase) werden genome-change Backlog-Einträge überprüft und auf das Genome angewendet. Dies stellt sicher, dass sich das Genome bewusst weiterentwickelt, informiert durch das, was während der Generation tatsächlich passiert ist.",
    syncTitle: "Wissensmanagement",
    syncDesc: "Verwenden Sie /reap.knowledge zum Überprüfen und Verwalten des Genome und Environment. Der Befehl bietet Optionen zum Neuladen des Kontexts, Inspizieren von Genome-Dateien und Verwalten von Environment-Daten.",
  },

  // Environment Page
  environmentPage: {
    title: "Environment",
    breadcrumb: "Leitfaden",
    intro: "Environment ist das deskriptive Wissen des Projekts — was aktuell existiert. Es erfasst Tech-Stack, Quellstruktur, Build-Konfiguration, Domänenwissen und Code-Abhängigkeiten. Anders als das Genome (präskriptiv — wie man baut), beschreibt Environment den aktuellen Zustand.",
    structureTitle: "2-Stufen-Struktur",
    structure: `.reap/environment/
├── summary.md      # Immer geladen (~100 Zeilen) — Tech-Stack, Quellstruktur, Build, Tests
├── domain/         # Domänenwissen (bei Bedarf)
├── resources/      # Externe Referenzdokumente — API-Docs, SDK-Spezifikationen (bei Bedarf)
├── docs/           # Projekt-Referenzdokumente — Designdokumente, Spezifikationen (bei Bedarf)
└── source-map.md   # Code-Struktur + Abhängigkeiten (bei Bedarf)`,
    layersTitle: "Stufen",
    layerHeaders: ["Stufe", "Laden", "Inhalt", "Limit"],
    layerItems: [
      ["summary.md", "Immer beim Sitzungsstart geladen", "Tech-Stack, Quellstruktur, Build-Konfiguration, Test-Setup. Das Grundverständnis der KI.", "~100 Zeilen"],
      ["domain/", "Bei Bedarf (geladen wenn nötig)", "Domänenwissen — Geschäftsregeln, API-Spezifikationen, Infrastrukturdetails.", "Kein Limit"],
      ["resources/", "Bei Bedarf (geladen wenn nötig)", "Externe Referenzdokumente — API-Docs, SDK-Spezifikationen, Drittanbieter-Dokumentation.", "Kein Limit"],
      ["docs/", "Bei Bedarf (geladen wenn nötig)", "Projekt-Referenzdokumente — Designdokumente, Spezifikationen, Architekturentscheidungen.", "Kein Limit"],
      ["source-map.md", "Bei Bedarf (geladen wenn nötig)", "Aktuelle Code-Struktur und Abhängigkeitskarte.", "Kein Limit"],
    ],
    immutabilityTitle: "Environment-Unveränderlichkeit",
    immutabilityDesc: "Wie das Genome wird das Environment während einer Generation nie direkt verändert. Änderungen werden als environment-change Backlog-Einträge erfasst und während der Completion Reflect-Phase angewendet.",
    immutabilityWhy: "Durch das Erfassen von Änderungen im Backlog statt Environment während der Generation umzuschreiben, wird die Generation auf einer stabilen Grundlage abgeschlossen. Die Aktualisierung erfolgt einmalig, bewusst, während der Reflect-Phase mit vollem Kontext über das Entwickelte.",
    flowTitle: "Ladestrategie",
    flowDesc: "summary.md wird immer beim Sitzungsstart geladen. domain/ und source-map.md werden bei Bedarf geladen, wenn die KI tieferen Kontext für eine bestimmte Aufgabe benötigt.",
    syncTitle: "Wissensmanagement",
    syncDesc: "Verwenden Sie /reap.knowledge zum Überprüfen und Verwalten des Environment. Während der Completion Reflect-Phase aktualisiert die KI automatisch das Environment, um Änderungen widerzuspiegeln, die während der Generation vorgenommen wurden.",
    syncSources: [
      { label: "summary.md", role: "Immer geladen", desc: "Kompakte Übersicht über den technischen Zustand des Projekts. In jede Sitzung geladen, damit die KI den Grundkontext hat." },
      { label: "domain/ + resources/ + docs/ + source-map.md", role: "Bei Bedarf", desc: "Tieferes Wissen, geladen wenn die KI spezifischen Domänen-, externen Referenz- oder strukturellen Kontext für die aktuelle Aufgabe benötigt." },
    ],
    syncContrast: "Die 2-Stufen-Strategie balanciert Kontextfenster-Effizienz (summary.md ist klein) mit Tiefe (domain/ und source-map.md sind bei Bedarf verfügbar).",
  },

  // Lifecycle Page (renamed from Workflow)
  lifecyclePage: {
    title: "Life Cycle",
    breadcrumb: "Leitfaden",
    intro: "Der Lebenszyklus ist der Herzschlag von REAP — jede Generation durchläuft 5 Phasen (Learning → Planning → Implementation → Validation → Completion) und erzeugt bei jedem Schritt Artefakte. Completion hat 4 Phasen: reflect → fitness → adapt → commit.",
    structureTitle: "Artefaktstruktur",
    structure: `.reap/life/
├── current.yml          # Aktueller Generationsstatus (ID, Ziel, Phase, Timeline)
├── 01-learning.md       # Kontexterkundung, Genome/Environment-Prüfung
├── 02-planning.md       # Aufgabenzerlegung, Abhängigkeiten
├── 03-implementation.md # Implementierungsprotokoll, vorgenommene Änderungen
├── 04-validation.md     # Testergebnisse, Abschlusskriterienprüfung
├── 05-completion.md     # Reflect + Fitness + Adapt + Commit
└── backlog/             # Einträge für nächste Generation
    ├── fix-auth-bug.md  #   type: task
    └── add-index.md     #   type: genome-change`,
    structureDesc: "Jede Phase erzeugt ihr Artefakt in .reap/life/. Wenn die Generation abgeschlossen ist, werden alle Artefakte in .reap/lineage/gen-XXX-hash-slug/ archiviert und current.yml wird für die nächste Generation geleert.",
  },

  // Lineage Page
  lineagePage: {
    title: "Lineage",
    breadcrumb: "Leitfaden",
    intro: "Lineage ist das Archiv abgeschlossener Generationen. Jede Generation, die ihren Lebenszyklus abschließt, wird hier mit vollständigen Artefakten und DAG-Metadaten aufbewahrt.",
    structureTitle: "Struktur",
    structureDesc: "Jede abgeschlossene Generation erstellt ein Verzeichnis mit Artefakten und Metadaten:",
    structure: `.reap/lineage/
├── gen-042-a3f8c2-fix-login-bug/   # Vollständige Generation (Verzeichnis)
│   ├── meta.yml                      # DAG-Metadaten (ID, Eltern, genomeHash)
│   ├── 01-learning.md
│   ├── 02-planning.md
│   ├── 03-implementation.md
│   ├── 04-validation.md
│   └── 05-completion.md
├── gen-030-b7e1f2.md                 # Level-1-komprimiert (einzelne Datei)
└── epoch.md                          # Level-2-komprimiert (Hash-Kette)`,
    dagTitle: "DAG (Directed Acyclic Graph)",
    dagDesc: "Jede Generation verzeichnet ihre Eltern in meta.yml und bildet einen DAG. Dies ermöglicht verteilte Workflows, bei denen mehrere Maschinen unabhängig arbeiten und später zusammenführen können.",
    compressionTitle: "Komprimierung",
    compressionDesc: "Komprimierung wird während der Completion-Phase ausgeführt, um die Lineage-Größe zu verwalten.",
    compressionHeaders: ["Level", "Eingabe", "Ausgabe", "Auslöser", "Schutz"],
    compressionItems: [
      ["Level 1", "Generationsordner", "gen-XXX-{hash}.md (40 Zeilen)", "> 5.000 Zeilen + 5+ Generationen", "Neueste 3 + DAG-Blattknoten"],
      ["Level 2", "100+ Level-1-Dateien", "Einzelne epoch.md", "Level-1-Dateien > 100", "Neueste 9 + Verzweigungspunkte"],
    ],
    compressionSafety: "DAG-Erhaltung: Level 1 behält Metadaten im Frontmatter. Level-2 epoch.md speichert eine Generations-Hash-Kette. Fork-Schutz: Alle lokalen/Remote-Branches werden gescannt — Verzweigungspunkte werden geschützt. Epoch-komprimierte Generationen können nicht als Merge-Basis verwendet werden.",
  },

  // Backlog Page
  backlogPage: {
    title: "Backlog",
    breadcrumb: "Leitfaden",
    intro: "Das Backlog trägt Einträge zwischen Generationen weiter — aufgeschobene Aufgaben, Genome-Änderungen und Environment-Änderungen. Es befindet sich in .reap/life/backlog/.",
    typesTitle: "Eintragstypen",
    typeHeaders: ["Typ", "Beschreibung", "Wann angewendet"],
    typeItems: [
      ["task", "Aufgeschobene Arbeit, technische Schulden, Feature-Ideen", "Als Zielkandidaten in der nächsten Generation referenziert"],
      ["genome-change", "Während der Generation entdeckte Genome-Änderungen", "Auf das Genome während der Completion Adapt-Phase angewendet"],
      ["environment-change", "Während der Generation entdeckte externe Environment-Änderungen", "Auf das Environment während der Completion Reflect-Phase angewendet"],
    ],
    statusTitle: "Status",
    statusHeaders: ["Status", "Bedeutung"],
    statusItems: [
      ["pending", "Noch nicht verarbeitet (Standard)"],
      ["consumed", "In einer Generation verarbeitet (erfordert consumedBy: gen-XXX-{hash})"],
    ],
    archivingTitle: "Archivierungsregeln",
    archivingDesc: "Beim Archivieren werden verarbeitete Einträge in die Lineage verschoben. Ausstehende Einträge werden in das Backlog der nächsten Generation übertragen.",
    deferralTitle: "Aufgabenaufschub",
    deferralDesc: "Teilweise Fertigstellung ist normal — Aufgaben, die von Genome-Änderungen abhängen, werden als [deferred] markiert und an die nächste Generation übergeben.",
    abortTitle: "Abbruch-Backlog",
    abortDesc: "Wenn eine Generation über /reap.abort abgebrochen wird, können Ziel und Fortschritt mit Abbruch-Metadaten (abortedFrom, abortReason, stage, sourceAction, changedFiles) im Backlog gespeichert werden. Dies bewahrt den Kontext für eine spätere Wiederaufnahme.",
    formatTitle: "Dateiformat",
    format: `---
type: task
status: pending
priority: medium
---

# Aufgabentitel

Beschreibung der Aufgabe.`,
  },

  // Release Notes Page
  releaseNotes: {
    title: "Versionshinweise",
    breadcrumb: "Sonstiges",
    breakingBannerTitle: "Breaking Changes in v0.16",
    breakingBannerDesc: "Automatische Updates von v0.15.x auf v0.16.x sind blockiert. Führen Sie /reap.update aus, um manuell zu aktualisieren.",
    breakingBannerItems: [
      "REAP wird zu einer Self Evolving Pipeline — KI arbeitet mit Menschen zusammen, um Software durch eine rekursive Pipeline selbst weiterzuentwickeln.",
      "Lebenszyklus geändert: learning → planning → implementation → validation → completion (neue Learning-Phase hinzugefügt, Objective und Planning zu Planning zusammengeführt).",
      "Slash-Befehle für optimale Skill-Zuordnung umstrukturiert: 10 automatisch zuordnende Skills + 6 nur direkt aufrufbare Skills.",
      "CLI-Befehle aus der Benutzeroberfläche entfernt. Alle Operationen jetzt nur noch über Slash-Befehle (CLI-Befehle für interne Nutzung reserviert).",
    ],
    versions: [
      {
        version: "0.16.0",
        notes: "Vollständige Neuentwicklung als Self-Evolving Pipeline. Neue Genome-Struktur (application.md, evolution.md, invariants.md). Learning-Phase ersetzt Objective. Klarheitsgesteuerte Interaktion. Cruise-Modus für autonome Multi-Generations-Ausführung. Vision-Schicht mit 3-stufigem Memory (longterm/midterm/shortterm). Merge-Lebenszyklus fügt Reconcile-Phase für Genome-Quellcode-Konsistenz hinzu. /reap.knowledge ersetzt /reap.sync. 2-Phasen /reap.abort. Dateibasierte Hooks mit Bedingungen und Reihenfolge.",
      },
      {
        version: "0.15.13",
        notes: "commander.js durch eingebaute CLI-Bibliothek ersetzt. Laufzeitabhängigkeiten: 2 -> 1.",
      },
      {
        version: "0.15.12",
        notes: "Release-Hinweis wird nach automatischem Upgrade durch reap update jetzt korrekt angezeigt.",
      },
      {
        version: "0.15.11",
        notes: "Fehler behoben: reap pull empfahl fälschlicherweise Merge für Ahead-only-Branches. Verwendet jetzt git rev-list für genaue Ahead/Behind/Diverged-Erkennung.",
      },
      {
        version: "0.15.10",
        notes: "Sprachzuordnung für Release-Hinweise korrigiert (z.B. \"korean\" -> \"ko\").",
      },
      {
        version: "0.15.9",
        notes: "Fehler behoben: Release-Hinweis wurde nach reap update nicht angezeigt. Pfadauflösung verwendet jetzt require.resolve statt __dirname.",
      },
      {
        version: "0.15.8",
        notes: "version-Feld aus config.yml entfernt. Keine uncommitteten Änderungen mehr nach reap update.",
      },
      {
        version: "0.15.7",
        notes: "UPDATE_NOTICE.md in RELEASE_NOTICE.md umbenannt. Hinweisinhalt jetzt inline (keine GitHub Discussions-Abhängigkeit).",
      },
      {
        version: "0.15.6",
        notes: "Fehler behoben: UPDATE_NOTICE.md fehlte im npm-Paket.",
      },
      {
        version: "0.15.5",
        notes: "Integritätsprüfung warnt nicht mehr bei source-map.md Zeilenanzahl.",
      },
      {
        version: "0.15.4",
        notes: "Fehlerbehebungen und neuer reap make backlog Befehl. Lineage-Archivierung, reap back Nonce-Kette behoben, Komprimierungsschutz für 20 neueste Generationen hinzugefügt.",
      },
    ],
  },
};
