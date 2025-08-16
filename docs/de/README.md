[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](README.md) | [🇫🇷 Français](../fr/README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

## Inhaltsverzeichnis

- [✨ Funktionen](#funktionen1)
- [🧭 Nutzungsanleitung](#nutzungsanleitung)
- [🖥️ Task Viewer Tool](#task-viewer-tool)
- [🔬 Forschungsmodus](#forschungsmodus)
- [🤖 Agent-Management-System](#agent-management-system)
- [🧠 Aufgabengedächtnis-Funktion](#aufgabengedächtnis-funktion)
- [📋 Projektregeln-Initialisierung](#projektregeln)
- [🌐 Web GUI](#web-gui)
- [📚 Dokumentationsressourcen](#dokumentation)
- [🔧 Installation und Nutzung](#installation)
- [🔌 Verwendung mit MCP-kompatiblen Clients](#clients)
- [💡 System Prompt Anleitung](#prompt)
- [🛠️ Verfügbare Tools Übersicht](#tools)
- [🏗️ Architektur-Übersicht](#architektur-übersicht)
- [📄 Lizenz](#lizenz)
- [🤖 Empfohlene Modelle](#empfohlene-modelle)

# MCP Shrimp Task Manager

[![Shrimp Task Manager Demo](/docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)

> 🚀 Ein intelligentes Aufgabenmanagementsystem basierend auf dem Model Context Protocol (MCP), das ein effizientes Programmier-Workflow-Framework für AI Agents bereitstellt.

<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" />
</a>

Shrimp Task Manager leitet Agents durch strukturierte Workflows für systematische Programmierung, verbessert Aufgabengedächtnis-Management-Mechanismen und vermeidet effektiv redundante und repetitive Programmierarbeit.

## ✨ <a id="funktionen1"></a>Funktionen

- **Aufgabenplanung und -analyse**: Tiefgreifendes Verständnis und Analyse komplexer Aufgabenanforderungen
- **Intelligente Aufgabenzerlegung**: Automatische Aufspaltung großer Aufgaben in handhabbare kleinere Aufgaben
- **Abhängigkeits-Management**: Präzise Behandlung von Abhängigkeiten zwischen Aufgaben, Sicherstellung der korrekten Ausführungsreihenfolge
- **Ausführungsstatus-Verfolgung**: Echtzeitüberwachung des Aufgabenausführungsfortschritts und -status
- **Aufgabenvollständigkeits-Überprüfung**: Sicherstellung, dass Aufgabenergebnisse den erwarteten Anforderungen entsprechen
- **Aufgabenkomplexitäts-Bewertung**: Automatische Bewertung der Aufgabenkomplexität und Bereitstellung optimaler Behandlungsvorschläge
- **Automatische Aufgabenzusammenfassungs-Updates**: Automatische Generierung von Zusammenfassungen nach Aufgabenabschluss, Optimierung der Gedächtnisleistung
- **Aufgabengedächtnis-Funktion**: Automatische Sicherung der Aufgabenhistorie, Bereitstellung langfristiger Gedächtnis- und Referenzfähigkeiten
- **Forschungsmodus**: Systematische technische Forschungsfähigkeiten mit geführten Workflows zur Erkundung von Technologien, Best Practices und Lösungsvergleichen
- **Projektregeln-Initialisierung**: Definition von Projektstandards und -regeln zur Aufrechterhaltung der Konsistenz in großen Projekten
- **<a id="web-gui"></a>Web GUI**: Bietet eine optionale webbasierte grafische Benutzeroberfläche für das Aufgabenmanagement. Aktivieren Sie diese durch Setzen von `ENABLE_GUI=true` in Ihrer `.env`-Datei. Wenn aktiviert, wird eine `WebGUI.md`-Datei mit der Zugangsadresse in Ihrem `DATA_DIR` erstellt. Sie können den Web-Port durch Setzen von `WEB_PORT` anpassen (falls nicht angegeben, wird automatisch ein verfügbarer Port ausgewählt).
- **<a id="task-viewer"></a>Task Viewer**: Eine moderne, React-basierte Web-Oberfläche zur Anzeige und Verwaltung von Aufgabendaten über mehrere Profile mit erweiterten Funktionen wie Drag & Drop-Tabs, Echtzeit-Suche und konfigurierbarer Auto-Refresh. Siehe die [Task Viewer Dokumentation](../../tools/task-viewer) für Setup- und Nutzungsanweisungen.

  <kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Task Viewer Interface" /></kbd>
  
  <kbd><img src="../../tools/task-viewer/task-details-view.png" alt="Task Details View" /></kbd>

- **<a id="agent-management"></a>Agent Management**: Umfassendes Subagent-Management-System für spezialisierte Aufgabenbehandlung. Weisen Sie spezifische AI-Agents Aufgaben zu, verwalten Sie Agent-Metadaten und nutzen Sie Claudes Agent-System für optimale Aufgabenausführung.

## 🧭 <a id="nutzungsanleitung"></a>Nutzungsanleitung

Shrimp Task Manager bietet einen strukturierten Ansatz für KI-unterstützte Programmierung durch geführte Workflows und systematisches Aufgabenmanagement.

### Was ist Shrimp?

Shrimp ist im Wesentlichen eine Prompt-Vorlage, die AI Agents dabei hilft, Ihr Projekt besser zu verstehen und damit zu arbeiten. Es verwendet eine Reihe von Prompts, um sicherzustellen, dass der Agent eng mit den spezifischen Bedürfnissen und Konventionen Ihres Projekts übereinstimmt.

### Forschungsmodus in der Praxis

Bevor Sie sich in die Aufgabenplanung vertiefen, können Sie den Forschungsmodus für technische Untersuchungen und Wissenssammlung nutzen. Dies ist besonders nützlich, wenn:

- Sie neue Technologien oder Frameworks erkunden müssen
- Sie verschiedene Lösungsansätze vergleichen möchten
- Sie Best Practices für Ihr Projekt untersuchen
- Sie komplexe technische Konzepte verstehen müssen

Sagen Sie einfach dem Agent "research [Ihr Thema]" oder "enter research mode for [Technologie/Problem]", um mit der systematischen Untersuchung zu beginnen. Die Forschungsergebnisse werden dann Ihre nachfolgenden Aufgabenplanung und Entwicklungsentscheidungen informieren.

### Ersteinrichtung

Bei der Arbeit mit einem neuen Projekt sagen Sie einfach dem Agent "init project rules". Dies wird den Agent dazu anleiten, eine Reihe von Regeln zu generieren, die auf die spezifischen Anforderungen und Struktur Ihres Projekts zugeschnitten sind.

### Aufgabenplanungsprozess

Um Funktionen zu entwickeln oder zu aktualisieren, verwenden Sie den Befehl "plan task [Ihre Beschreibung]". Das System wird die zuvor etablierten Regeln referenzieren, versuchen, Ihr Projekt zu verstehen, nach relevanten Code-Abschnitten suchen und einen umfassenden Plan basierend auf dem aktuellen Zustand Ihres Projekts vorschlagen.

*[Weitere Abschnitte bleiben auf Englisch, da die Übersetzung in Bearbeitung ist]*

## 🏗️ <a id="architektur-übersicht"></a>Architektur-Übersicht

### Kernarchitektur

Der MCP Shrimp Task Manager ist als Model Context Protocol (MCP) Server gebaut, der strukturierte Aufgabenmanagement-Fähigkeiten für AI-Agents durch geführte Workflows und systematische Aufgabenzerlegung bereitstellt.

#### 1. **MCP Server Grundlagen**
- Basierend auf `@modelcontextprotocol/sdk` für MCP-Protokoll-Compliance
- Verwendet stdio-Transport für Kommunikation mit AI-Clients
- Exponiert 16 spezialisierte Tools über JSON Schema-Definitionen
- Unterstützt sowohl synchrone als auch asynchrone Operationen

#### 2. **Aufgaben-Datenmodell** (`src/types/index.ts`, `src/models/taskModel.ts`)
- **Task Entity**: Kerndatenstruktur mit eindeutiger ID, Name, Beschreibung, Status und Abhängigkeiten
- **Task States**: PENDING → IN_PROGRESS → COMPLETED (oder BLOCKED)
- **Dependency Graph**: Verwaltet Aufgabenbeziehungen und Ausführungsreihenfolge
- **Related Files**: Verfolgt Dateien, die mit jeder Aufgabe verbunden sind (TO_MODIFY, REFERENCE, CREATE, etc.)
- **Persistence**: JSON-Dateispeicherung mit Git-Versionierung für vollständige Historie
- **Memory System**: Automatische Backups und langfristige Aufgabenhistorien-Erhaltung

#### 3. **Tool-System-Architektur** (`src/tools/`)
Das System stellt spezialisierte Tools in drei Hauptkategorien bereit:

**Aufgabenmanagement-Tools:**
- `plan_task`: Konvertiert natürliche Sprache in strukturierte Entwicklungspläne
- `analyze_task`: Tiefgreifende technische Analyse mit Komplexitätsbewertung
- `split_tasks`: Intelligente Zerlegung komplexer Aufgaben in handhabbare Unteraufgaben
- `execute_task`: Geführte Implementierung mit Schritt-für-Schritt-Anweisungen
- `verify_task`: Vollständigkeitsüberprüfung und Qualitätssicherung
- `list_tasks`, `query_task`, `get_task_detail`: Aufgabeninspektion und -abruf
- `update_task`, `delete_task`, `clear_all_tasks`: Aufgabenmanipulation

**Kognitive Tools:**
- `process_thought`: Chain-of-Thought-Reasoning-Framework für komplexe Problemlösung
- `reflect_task`: Nach-Abschluss-Analyse und Lernextraktion
- `research_mode`: Systematische technische Untersuchung mit geführten Workflows

**Projekt-Tools:**
- `init_project_rules`: Etabliert projektspezifische Konventionen und Standards

#### 4. **Prompt-Template-System** (`src/prompts/`)
- **Multi-Language Support**: Englische und traditionelle chinesische Templates
- **Template-basierte Generierung**: Modularer Prompt-Aufbau
- **Context-aware Prompts**: Dynamische Prompt-Generierung basierend auf Aufgabenstatus
- **Anpassbare Templates**: Override oder Erweitern über Umgebungsvariablen
- **Template Loading**: Dynamische Template-Auswahl basierend auf Konfiguration

#### 5. **Agent Integration System** (`src/utils/agentLoader.ts`)
- **Agent Assignment**: Aufgaben können spezialisierten AI-Agents zugewiesen werden
- **Agent Metadata**: Speichert Agent-Fähigkeiten und Spezialisierungen
- **Agent Matching**: Intelligente Agent-Auswahl basierend auf Aufgabenanforderungen
- **Claude Integration**: Nahtlose Integration mit Claudes Agent-System

### Datenfluss & Workflow

#### 1. **Aufgabenplanungsphase**
```
Benutzeranfrage → plan_task → analyze_task → split_tasks (falls komplex)
```
- Natürliche Sprache wird geparst und in strukturierte Aufgaben konvertiert
- Komplexitätsbewertung bestimmt, ob Aufgabenaufteilung erforderlich ist
- Abhängigkeiten werden automatisch identifiziert und zugeordnet

#### 2. **Ausführungsphase**
```
execute_task → Implementation Guide → Status Updates → File Tracking
```
- Schritt-für-Schritt-Implementierungsanleitung generiert
- Verwandte Dateien verfolgt und überwacht
- Fortschrittsstatus in Echtzeit aktualisiert
- Git-Commits für Versionskontrolle erstellt

#### 3. **Verifizierungsphase**
```
verify_task → reflect_task → Task Summary → Memory Storage
```
- Abschluss gegen Akzeptanzkriterien verifiziert
- Lessons learned für zukünftige Referenz extrahiert
- Aufgabenzusammenfassung generiert und gespeichert
- Memory-System bewahrt Wissen für zukünftige Aufgaben

#### 4. **Memory & Persistence**
- **Primary Storage**: `tasks.json` in DATA_DIR
- **Version Control**: Git-Repository verfolgt alle Änderungen
- **Backup System**: Automatische timestamped Backups
- **Memory Directory**: Langzeitspeicherung abgeschlossener Aufgaben
- **Project Isolation**: ListRoots-Protokoll ermöglicht projektspezifische Datentrennung

### Wichtige Design-Prinzipien

1. **Chain-of-Thought Reasoning**: Tools leiten AI durch strukturierte Denkprozesse
2. **Iterative Refinement**: Aufgaben können mehrfach analysiert, aufgeteilt und verfeinert werden
3. **Context Preservation**: Git-Historie und Memory-System verhindern Kontextverlust zwischen Sitzungen
4. **Language Flexibility**: Zweisprachige Unterstützung mit anpassbaren Templates
5. **Stateful Management**: Persistente Speicherung behält Aufgabenstatus zwischen Gesprächen bei
6. **Guided Workflows**: System leitet anstatt zu befehlen, gewährleistet Konsistenz

### Web-Interfaces

#### 1. **Built-in Web GUI** (`src/web/webServer.ts`)
- Optionaler Express.js-Server (ENABLE_GUI=true)
- Echtzeit-Aufgabenvisualisierung
- Auto-Port-Auswahl mit Fallback
- Generiert WebGUI.md mit Zugangs-URL

#### 2. **Task Viewer Tool** (`tools/task-viewer/`)
- Standalone React-Anwendung
- Multi-Profile-Unterstützung für verschiedene Projekte
- Echtzeit-Aufgabenüberwachung mit Auto-Refresh
- Drag-and-Drop-Interface für Organisation
- Agent-Management-Integration

### Integrationspunkte

- **MCP Protocol**: Standardprotokoll für AI-Modell-Interaktion
- **File System**: Direkte Dateimanipulation für Aufgabendaten
- **Git Integration**: Versionskontrolle für Aufgabenhistorie
- **Environment Variables**: Umfassende Konfigurationsoptionen
- **Web APIs**: RESTful-Endpunkte für GUI-Interaktion

## 🔧 Technische Implementierung

- **Node.js**: Hochperformante JavaScript-Laufzeitumgebung
- **TypeScript**: Bietet typsichere Entwicklungsumgebung
- **MCP SDK**: Interface für nahtlose Interaktion mit Large Language Models
- **UUID**: Generiert eindeutige und zuverlässige Aufgabenidentifikatoren
- **Express.js**: Webserver für optionale GUI
- **Git**: Versionskontrolle für Aufgabenhistorie

*[Weitere Abschnitte werden übersetzt, sobald vollständige Übersetzung angefordert wird]*

## 📄 <a id="lizenz"></a>Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](../../LICENSE)-Datei für Details.

## <a id="empfohlene-modelle"></a>Empfohlene Modelle

Für die beste Erfahrung empfehlen wir die Verwendung der folgenden Modelle:

- **Claude 3.7**: Bietet starke Verständnis- und Generierungsfähigkeiten.
- **Gemini 2.5**: Googles neuestes Modell, leistet exzellent.

Aufgrund von Unterschieden in Trainingsmethoden und Verständnisfähigkeiten verschiedener Modelle könnte die Verwendung anderer Modelle zu unterschiedlichen Ergebnissen für dieselben Prompts führen. Dieses Projekt wurde für Claude 3.7 und Gemini 2.5 optimiert.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)