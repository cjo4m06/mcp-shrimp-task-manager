# 🦐 Shrimp Task Manager Viewer

Eine moderne, React-basierte Weboberfläche zum Anzeigen und Verwalten von [Shrimp Task Manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) Aufgaben, die über das MCP (Model Context Protocol) Tool erstellt wurden. Diese visuelle Oberfläche ermöglicht es Ihnen, detaillierte Aufgabeninformationen einzusehen, den Fortschritt über mehrere Projekte hinweg zu verfolgen und Aufgaben-UUIDs für KI-Agent-Interaktionen einfach zu kopieren.

## Warum den Shrimp Task Viewer verwenden?

Bei der Verwendung des Shrimp Task Managers als MCP-Server mit KI-Agenten wie Claude bietet dieser Viewer wesentliche Einblicke in Ihr Aufgaben-Ökosystem:

- **Visuelle Aufgabenübersicht**: Sehen Sie alle Aufgaben, ihren Status, Abhängigkeiten und Fortschritt in einer sauberen Tab-Oberfläche
- **UUID-Verwaltung**: Klicken Sie auf beliebige Aufgaben-Badges, um sofort deren UUID für Befehle wie `"Use task manager to complete this shrimp task: [UUID]"` zu kopieren
- **Parallele Ausführung**: Öffnen Sie mehrere Terminals und verwenden Sie die KI-Aktionen-Spalte (🤖), um Aufgabenanweisungen für parallele KI-Agent-Ausführung zu kopieren
- **Live-Updates**: Direkte Dateipfad-Lesung stellt sicher, dass Sie immer den aktuellen Aufgabenstatus sehen
- **Multi-Projekt-Unterstützung**: Verwalten Sie Aufgaben über verschiedene Projekte mit ziehbaren Profil-Tabs

Für Informationen zur Einrichtung des Shrimp Task Managers als MCP-Server siehe das [Haupt-Repository](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 📖 Detaillierte Seitendokumentation

### 📋 Aufgaben-Seite

Die Haupt-Aufgaben-Seite ist Ihre Kommandozentrale für Aufgabenverwaltung. Sie bietet eine umfassende Ansicht aller Aufgaben im ausgewählten Profil mit leistungsstarken Funktionen für Organisation und Ausführung.

![Aufgaben-Seiten-Übersicht](task-viewer-interface.png)

**Hauptfunktionen:**
- **Aufgabentabelle**: Zeigt alle Aufgaben mit sortierbaren Spalten einschließlich Aufgaben-#, Status, Agent, Erstellungsdatum, Name, Abhängigkeiten und Aktionen
- **Status-Badges**: Farbkodierte Badges (🟡 Ausstehend, 🔵 In Bearbeitung, 🟢 Abgeschlossen, 🔴 Blockiert)
- **Agent-Zuweisung**: Dropdown-Selektor zum Zuweisen spezifischer KI-Agenten zu Aufgaben
- **Agent-Viewer-Popup**: Klicken Sie das Augen-Symbol (👁️), um ein Popup zu öffnen, wo Sie Agenten durchsuchen und auswählen können
- **Abhängigkeiten-Spalte**: Zeigt verknüpfte Aufgaben-IDs mit Klick-zum-Navigieren-Funktionalität
- **Aktionen-Spalte**: Enthält das mächtige Roboter-Emoji (🤖) für KI-Aufgaben-Ausführung
- **Aufgaben-Detail-Navigation**: Beim Betrachten von Aufgabendetails verwenden Sie ← Vorherige und Nächste → Schaltflächen, um schnell zwischen Aufgaben zu navigieren

#### 🤖 Roboter-Emoji - KI-Aufgaben-Ausführung

Das Roboter-Emoji in der Aktionen-Spalte ist eine mächtige Funktion für KI-unterstützte Aufgaben-Ausführung:

![Roboter-Emoji-Tooltip](releases/agent-copy-instruction-tooltip.png)

**Wie es funktioniert:**
1. **Klicken Sie das 🤖 Emoji**, um eine Aufgaben-Ausführungs-Anweisung in Ihre Zwischenablage zu kopieren
2. **Für Aufgaben mit Agenten**: Kopiert `use the built in subagent located in ./claude/agents/[agent-name] to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
3. **Für Aufgaben ohne Agenten**: Kopiert `Use task manager to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
4. **Visuelles Feedback**: Das Emoji ändert sich kurz zu ✓, um die Kopieraktion zu bestätigen

**Anwendungsfälle:**
- **Parallele Ausführung**: Öffnen Sie mehrere Terminal-Fenster mit verschiedenen KI-Agenten und fügen Sie Anweisungen für gleichzeitige Aufgaben-Verarbeitung ein
- **Agent-Spezialisierung**: Weisen Sie spezialisierte Agenten (z.B. `react-components.md`, `database-specialist.md`) zu geeigneten Aufgaben zu
- **Schnelle Übergabe**: Delegieren Sie Aufgaben rasch an KI-Agenten ohne komplexe Befehle zu tippen

#### 🤖 KI-gesteuerte Massen-Agent-Zuweisung

Die Aufgaben-Seite enthält jetzt KI-gesteuerte Massen-Agent-Zuweisung mit OpenAI's GPT-4:

**Wie zu verwenden:**
1. **Aufgaben auswählen**: Verwenden Sie die Checkboxen, um mehrere Aufgaben auszuwählen, die Agent-Zuweisung benötigen
2. **Massen-Aktionen-Leiste**: Eine blaue Leiste erscheint mit "🤖 KI Agenten Zuweisen (X Aufgaben ausgewählt)"
3. **Ein-Klick-Zuweisung**: Klicken Sie den Button, damit GPT-4 Aufgaben analysiert und geeignete Agenten zuweist
4. **Automatische Zuordnung**: KI berücksichtigt Aufgabenbeschreibungen, Abhängigkeiten und Agent-Fähigkeiten

**Setup-Anforderungen:**
1. **API-Schlüssel konfigurieren**: Navigieren Sie zu Einstellungen → Globale Einstellungen
2. **OpenAI-Schlüssel eingeben**: Fügen Sie Ihren OpenAI-API-Schlüssel in das Feld ein (wird als ✓ Konfiguriert angezeigt, wenn gesetzt)
3. **Alternative Methode**: Setzen Sie die Umgebungsvariable `OPENAI_API_KEY` oder `OPEN_AI_KEY_SHRIMP_TASK_VIEWER`
4. **API-Schlüssel erhalten**: Besuchen Sie [OpenAI Platform](https://platform.openai.com/api-keys), um einen Schlüssel zu generieren

![Globale Einstellungen OpenAI-Schlüssel](releases/global-settings-openai-key.png)
*Die Globale Einstellungen-Seite bietet ein sicheres Feld zur Konfiguration Ihres OpenAI-API-Schlüssels*

#### 📝 Aufgaben-Detail-Ansicht

Klicken Sie auf eine beliebige Aufgabenzeile, um die detaillierte Aufgaben-Ansicht mit umfassenden Informationen zu öffnen:

**Funktionen:**
- **Vollständige Aufgaben-Informationen**: Betrachten Sie vollständige Beschreibungen, Notizen, Implementierungs-Leitfäden und Verifikations-Kriterien
- **Aufgaben-Navigation**: Verwenden Sie ← Vorherige und Nächste → Schaltflächen, um zwischen Aufgaben zu wechseln, ohne zur Liste zurückzukehren
- **Verwandte Dateien**: Sehen Sie alle mit der Aufgabe verbundenen Dateien mit Zeilennummern
- **Abhängigkeiten-Graph**: Visuelle Darstellung von Aufgaben-Abhängigkeiten
- **Bearbeitungsmodus**: Klicken Sie Bearbeiten, um Aufgaben-Details zu ändern (für nicht-abgeschlossene Aufgaben)
- **Schnelle Aktionen**: Kopieren Sie Aufgaben-ID, betrachten Sie Raw JSON oder löschen Sie die Aufgabe

**Navigation-Vorteile:**
- **Effiziente Überprüfung**: Überprüfen Sie mehrere Aufgaben schnell in Sequenz
- **Kontext-Beibehaltung**: Bleiben Sie in der Detail-Ansicht beim Wechseln zwischen Aufgaben
- **Tastatur-Unterstützung**: Verwenden Sie Pfeiltasten für noch schnellere Navigation

### 📜 Projekt-Historie-Seite

Die Projekt-Historie-Seite bietet wertvolle Einblicke in die Entwicklung Ihres Projekts, indem sie Momentaufnahmen abgeschlossener Aufgaben anzeigt, die vom Shrimp Task Manager gespeichert wurden.

![Projekt-Historie-Übersicht](releases/project-history-view.png)

**Funktionen:**
- **Zeitstrahl-Ansicht**: Durchsuchen Sie historische Momentaufnahmen Ihrer Projekt-Aufgaben-Zustände
- **Speicher-Dateien**: Automatisch vom Shrimp Task Manager beim Start neuer Sitzungen gespeichert
- **Aufgaben-Evolution**: Verfolgen Sie, wie Aufgaben von der Erstellung bis zur Vollendung fortgeschritten sind
- **Notizen-System**: Fügen Sie persönliche Anmerkungen zu historischen Einträgen hinzu

![Projekt-Historie-Detail](releases/project-history-detail-view.png)

**Navigation:**
- Klicken Sie auf jeden historischen Eintrag, um den detaillierten Aufgaben-Status zu diesem Zeitpunkt zu sehen
- Verwenden Sie die Navigations-Schaltflächen, um zwischen verschiedenen Momentaufnahmen zu wechseln
- Suchen und filtern Sie historische Aufgaben genau wie in der Haupt-Aufgaben-Ansicht

### 🤖 Sub-Agenten-Seite

Die Sub-Agenten-Seite ermöglicht es Ihnen, spezialisierte KI-Agenten zu verwalten, die Aufgaben für optimale Ausführung zugewiesen werden können.

![Agent-Listen-Ansicht mit KI-Anweisung](releases/agent-list-view-with-ai-instruction.png)

**Funktionen:**
- **Agent-Bibliothek**: Betrachten Sie alle verfügbaren Agenten aus Ihrem `.claude/agents` Ordner
- **KI-Anweisungs-Spalte**: Klicken Sie das Roboter-Emoji (🤖), um sofort Agent-Nutzungs-Anweisungen zu kopieren
  - Beispiel: `use subagent debugger.md located in ./claude/agents to perform:`
  - Keine Notwendigkeit, Agent-Pfade manuell zu tippen oder Syntax zu merken
  - Visuelles Feedback bestätigt erfolgreiche Kopie in die Zwischenablage
- **Agent-Editor**: Integrierter Markdown-Editor zum Erstellen und Modifizieren von Agenten
- **Farbkodierung**: Weisen Sie Agenten Farben für visuelle Organisation zu
- **Agent-Zuweisung**: Weisen Sie Agenten einfach über Dropdown in der Aufgabentabelle zu
- **Agent-Viewer-Popup**: Klicken Sie das Augen-Symbol (👁️), um Agenten zu durchsuchen und auszuwählen

![Agent-Editor](releases/agent-editor-color-selection.png)

**Agent-Zuweisungs-Workflow:**

![Agent-Dropdown](releases/agent-dropdown-task-table.png)

1. **Wählen Sie einen Agenten** aus dem Dropdown in der Aufgabentabelle
2. **Oder klicken Sie das Augen-Symbol (👁️)**, um das Agent-Viewer-Popup zu öffnen
3. **Durchsuchen Sie Agenten** im Popup, um den richtigen für Ihre Aufgabe zu finden
4. **Automatisches Speichern** aktualisiert die Aufgaben-Metadaten
5. **Verwenden Sie das Roboter-Emoji**, um agent-spezifische Ausführungs-Anweisungen zu kopieren

![Agent-Viewer-Popup](releases/agent-viewer-popup.png)
*Das Agent-Viewer-Popup ermöglicht es Ihnen, alle verfügbaren Agenten zu durchsuchen und den besten für jede Aufgabe auszuwählen*

### 🎨 Templates-Seite

Verwalten Sie KI-Anweisungs-Templates, die leiten, wie der Shrimp Task Manager verschiedene Arten von Operationen analysiert und ausführt.

![Template-Verwaltung](releases/template-management-system.png)

**Fähigkeiten:**
- **Template-Editor**: Vollständiger Markdown-Editor mit Syntax-Hervorhebung
- **Template-Typen**: Standard-, Benutzerdefinierte und Benutzerdefiniert+Hinzufügen-Zustände
- **Live-Vorschau**: Sehen Sie Template-Effekte vor der Aktivierung
- **Export/Import**: Teilen Sie Templates mit Teammitgliedern

### ⚙️ Globale Einstellungen

Konfigurieren Sie systemweite Einstellungen einschließlich des Claude-Ordner-Pfads für den Zugriff auf globale Agenten.

**Einstellungen umfassen:**
- **Claude-Ordner-Pfad**: Setzen Sie den Pfad zu Ihrem globalen `.claude` Ordner
- **API-Schlüssel-Konfiguration**: Verwalten Sie Umgebungsvariablen für KI-Services
- **Sprach-Präferenzen**: Wechseln Sie zwischen unterstützten Sprachen

## 🌟 Funktionen

### 🏷️ Moderne Tab-Oberfläche
- **Ziehbare Tabs**: Ordnen Sie Profile durch Ziehen von Tabs neu
- **Professionelles Design**: Browser-Stil-Tabs, die nahtlos mit Inhalt verbinden
- **Visuelles Feedback**: Klare aktive Tab-Anzeige und Hover-Effekte
- **Neue Profile hinzufügen**: Integrierte "+ Tab Hinzufügen" Schaltfläche, die zum Interface-Design passt

### 🔍 Erweiterte Suche & Filterung
- **Echtzeit-Suche**: Sofortiges Aufgaben-Filtern nach Name, Beschreibung, Status oder ID
- **Sortierbare Spalten**: Klicken Sie Spalten-Header, um nach jedem Feld zu sortieren
- **TanStack Table**: Mächtige Tabellen-Komponente mit Paginierung und Filterung
- **Responsives Design**: Funktioniert perfekt auf Desktop, Tablet und Mobil

### 🔄 Intelligente Auto-Aktualisierung
- **Konfigurierbare Intervalle**: Wählen Sie aus 5s, 10s, 15s, 30s, 1m, 2m oder 5m
- **Intelligente Kontrollen**: Auto-Aktualisierungs-Toggle mit Intervall-Auswahl
- **Visuelle Indikatoren**: Lade-Zustände und Aktualisierungs-Status
- **Manuelle Aktualisierung**: Dedizierte Aktualisierungs-Schaltfläche für On-Demand-Updates

### 📊 Umfassende Aufgaben-Verwaltung
- **Aufgaben-Statistiken**: Live-Zählungen für Gesamt, Abgeschlossen, In Bearbeitung und Ausstehende Aufgaben
- **Profil-Verwaltung**: Profile über intuitive Oberfläche hinzufügen/entfernen/neu ordnen
- **Persistente Einstellungen**: Profil-Konfigurationen zwischen Sitzungen gespeichert
- **Hot Reload**: Entwicklungsmodus mit sofortigen Updates

### 🤖 KI-gesteuerte Funktionen
- **Massen-Agent-Zuweisung**: Wählen Sie mehrere Aufgaben aus und verwenden Sie GPT-4, um automatisch die passendsten Agenten zuzuweisen
- **OpenAI-Integration**: Konfigurieren Sie Ihren API-Schlüssel in Globalen Einstellungen oder über Umgebungsvariablen
- **Intelligente Zuordnung**: KI analysiert Aufgaben-Beschreibungen und Agent-Fähigkeiten für optimale Zuweisungen
- **Fehler-Führung**: Klare Anweisungen, wenn API-Schlüssel nicht konfiguriert ist

### 📚 Versionskontrolle & Historie
- **Git-Integration**: Automatische Git-Commits verfolgen jede Änderung an tasks.json mit zeitgestempelten Nachrichten
- **Vollständige Audit-Spur**: Überprüfen Sie die vollständige Historie von Aufgaben-Modifikationen mit Standard-Git-Tools
- **Nicht-blockierende Operationen**: Git-Fehler unterbrechen nicht die Aufgaben-Verwaltung
- **Isoliertes Repository**: Aufgaben-Historie getrennt von Ihrem Projekt-Repository verfolgt

### 🎨 Professionelle UI/UX
- **Dunkles Theme**: Optimiert für Entwicklungsumgebungen
- **Responsives Layout**: Passt sich allen Bildschirmgrößen an
- **Barrierefreiheit**: Vollständige Tastatur-Navigation und Screenreader-Unterstützung
- **Interaktive Elemente**: Hover-Tooltips und visuelles Feedback durchgehend

## 🚀 Schnellstart

### Installation & Setup

1. **Klonen und zum Task Viewer-Verzeichnis navigieren**
   ```bash
   cd pfad/zu/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **React-Anwendung bauen**
   ```bash
   npm run build
   ```

4. **Server starten**
   ```bash
   npm start
   ```

   Der Viewer wird unter `http://localhost:9998` verfügbar sein

### Entwicklungsmodus

Für Entwicklung mit Hot Reload:

```bash
# Sowohl API-Server als auch Entwicklungsserver starten
npm run start:all

# Oder separat ausführen:
npm start          # API-Server auf Port 9998
npm run dev        # Vite-Dev-Server auf Port 3000
```

Die App wird unter `http://localhost:3000` mit automatischer Neuerstellung bei Dateiänderungen verfügbar sein.

### Produktions-Deployment

#### Standard-Deployment

```bash
# Für Produktion bauen
npm run build

# Produktions-Server starten
npm start
```

#### Systemd-Service (Linux)

Für automatischen Start und Prozess-Verwaltung:

1. **Als Service installieren**
   ```bash
   sudo ./install-service.sh
   ```

2. **Service verwalten**
   ```bash
   # Status prüfen
   systemctl status shrimp-task-viewer
   
   # Starten/stoppen/neustarten
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Logs anzeigen
   journalctl -u shrimp-task-viewer -f
   
   # Auto-Start deaktivieren/aktivieren
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Service deinstallieren**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Verwendung

### Erste Schritte

1. **Server starten**:
   ```bash
   npm start
   ```
   
   **Hinweis**: Wenn Sie die App noch nicht gebaut haben oder den Entwicklungsmodus mit Hot Reload verwenden möchten, verwenden Sie stattdessen `npm run start:all`.

2. **Browser öffnen**:
   Navigieren Sie zu `http://127.0.0.1:9998` (Produktion) oder `http://localhost:3000` (Entwicklung)

3. **Ihr erstes Profil hinzufügen**:
   - Klicken Sie die "**+ Tab Hinzufügen**" Schaltfläche
   - Geben Sie einen beschreibenden Profilnamen ein (z.B. "Team Alpha Aufgaben")
   - Geben Sie den Pfad zu Ihrem Shrimp-Datenordner ein, der tasks.json enthält
   - **Tipp:** Navigieren Sie zu Ihrem Ordner im Terminal und tippen Sie `pwd`, um den vollständigen Pfad zu erhalten
   - Klicken Sie "**Profil Hinzufügen**"

4. **Ihre Aufgaben verwalten**:
   - Wechseln Sie zwischen Profilen mit den Tabs
   - Suchen Sie Aufgaben mit der Suchbox
   - Sortieren Sie Spalten durch Klicken der Header
   - Konfigurieren Sie Auto-Aktualisierung nach Bedarf

### Tab-Verwaltung

- **Profile wechseln**: Klicken Sie jeden Tab, um zu diesem Profil zu wechseln
- **Tabs neu ordnen**: Ziehen Sie Tabs, um sie in Ihrer bevorzugten Reihenfolge zu arrangieren
- **Neues Profil hinzufügen**: Klicken Sie die "**+ Tab Hinzufügen**" Schaltfläche
- **Profil entfernen**: Klicken Sie das × an jedem Tab (mit Bestätigung)

### Suche & Filterung

- **Globale Suche**: Tippen Sie in die Suchbox, um über alle Aufgaben-Felder zu filtern
- **Spalten-Sortierung**: Klicken Sie jeden Spalten-Header zum Sortieren (nochmals klicken zum Umkehren)
- **Paginierung**: Navigieren Sie große Aufgaben-Listen mit eingebauten Paginierungs-Kontrollen
- **Echtzeit-Updates**: Suche und Sortierung aktualisieren sich sofort während Sie tippen

### Auto-Aktualisierungs-Konfiguration

1. **Auto-Aktualisierung aktivieren**: Markieren Sie die "Auto-Aktualisierung" Checkbox
2. **Intervall setzen**: Wählen Sie aus dem Dropdown (5s bis 5m)
3. **Manuelle Aktualisierung**: Klicken Sie die 🔄 Schaltfläche jederzeit für sofortige Aktualisierung
4. **Visuelles Feedback**: Spinner zeigt während Aktualisierungs-Operationen

## 🔧 Konfiguration

### Umgebungsvariablen

Um Umgebungsvariablen über Terminal-Sitzungen hinweg persistent zu machen, fügen Sie sie zu Ihrer Shell-Konfigurationsdatei hinzu:

**Für macOS/Linux mit Zsh** (Standard auf modernem macOS):
```bash
# Zu ~/.zshrc hinzufügen
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Konfiguration neu laden
source ~/.zshrc
```

**Für Linux/Unix mit Bash**:
```bash
# Zu ~/.bashrc hinzufügen
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Konfiguration neu laden
source ~/.bashrc
```

**Warum zur Shell-Konfiguration hinzufügen?**
- **Persistenz**: Mit `export` im Terminal gesetzte Variablen dauern nur für diese Sitzung
- **Konsistenz**: Alle neuen Terminal-Fenster haben diese Einstellungen
- **Bequemlichkeit**: Keine Notwendigkeit, Variablen jedes Mal zu setzen, wenn Sie den Server starten

**Verfügbare Variablen**:
```bash
SHRIMP_VIEWER_PORT=9998           # Server-Port (Standard: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Server-Host (nur localhost)
OPENAI_API_KEY=sk-...             # OpenAI-API-Schlüssel für KI-Agent-Zuweisung
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # Alternative env var für OpenAI-Schlüssel
```

### Entwicklungs-Konfiguration

- **Entwicklung mit Hot Reload (empfohlen für Entwicklung)**:
  ```bash
  npm run start:all  # Führt API-Server (9998) + Vite-Dev-Server (3000) aus
  ```
  
  **Warum start:all verwenden?** Dieser Befehl führt sowohl API-Server als auch Vite-Dev-Server gleichzeitig aus. Sie erhalten sofortigen Hot Module Replacement (HMR) für UI-Änderungen bei voller API-Funktionalität. Ihre Änderungen erscheinen sofort im Browser unter `http://localhost:3000` ohne manuelles Aktualisieren.

- **Nur API-Server (für Produktion oder API-Tests)**:
  ```bash
  npm start  # Läuft auf Port 9998
  ```
  
  **Warum nur API-Server verwenden?** Verwenden Sie dies, wenn Sie Produktionsdateien gebaut haben und die komplette App wie in Produktion testen möchten, oder wenn Sie nur die API-Endpoints benötigen.

- **Bauen und für Produktion servieren**:
  ```bash
  npm run build && npm start  # Bauen dann auf Port 9998 servieren
  ```
  
  **Warum für Produktion bauen?** Der Produktions-Build optimiert Ihren Code durch Minifizierung von JavaScript, Entfernung von totem Code und effiziente Asset-Bündelung. Dies resultiert in schnelleren Ladezeiten und besserer Performance für Endbenutzer. Verwenden Sie immer den Produktions-Build beim Deployment.

### Profil-Daten-Speicherung

**Profil-Daten-Verwaltung verstehen**: Der Task Viewer verwendet einen hybriden Ansatz zur Datenspeicherung, der sowohl Persistenz als auch Echtzeit-Genauigkeit priorisiert. Profil-Konfigurationen (wie Tab-Namen, Ordner-Pfade und Tab-Reihenfolge) werden lokal in einer JSON-Einstellungsdatei in Ihrem Home-Verzeichnis gespeichert, während Aufgaben-Daten direkt aus Ihren Projekt-Ordnern in Echtzeit gelesen werden.

- **Einstellungsdatei**: `~/.shrimp-task-viewer-settings.json`
  
  Diese versteckte Datei in Ihrem Home-Verzeichnis speichert alle Ihre Profil-Konfigurationen einschließlich Tab-Namen, Ordner-Pfade, Tab-Reihenfolge und andere Präferenzen. Sie wird automatisch erstellt, wenn Sie Ihr erstes Profil hinzufügen und bei Änderungen aktualisiert. Sie können diese Datei manuell bearbeiten, wenn nötig, aber achten Sie darauf, gültiges JSON-Format beizubehalten.

- **Aufgaben-Dateien**: Direkt aus angegebenen Ordner-Pfaden gelesen (keine Uploads)
  
  Im Gegensatz zu traditionellen Web-Anwendungen, die Dateien hochladen und Kopien speichern, liest der Task Viewer `tasks.json` Dateien direkt aus Ihren angegebenen Ordner-Pfaden. Dies stellt sicher, dass Sie immer den aktuellen Status Ihrer Aufgaben sehen, ohne neu hochladen oder synchronisieren zu müssen. Wenn Sie ein Profil hinzufügen, sagen Sie dem Viewer nur, wo er nach der tasks.json Datei suchen soll.

- **Hot Reload**: Entwicklungsänderungen bauen automatisch neu
  
  Im Entwicklungsmodus (`npm run dev`) lösen alle Änderungen am Quellcode automatische Neubauten und Browser-Aktualisierungen aus. Dies gilt für React-Komponenten, Styles und Server-Code und macht Entwicklung schneller und effizienter.

### Git-Aufgaben-Historie

**Automatische Versionskontrolle**: Ab v3.0 verfolgt der Shrimp Task Manager automatisch alle Aufgaben-Änderungen mit Git. Dies bietet eine vollständige Audit-Spur ohne manuelle Konfiguration.

- **Repository-Standort**: `<shrimp-daten-verzeichnis>/.git`
  
  Jedes Projekt erhält sein eigenes Git-Repository im Daten-Verzeichnis, das in Ihrer `.mcp.json` Datei konfiguriert ist. Dies ist völlig getrennt vom Haupt-Git-Repository Ihres Projekts und verhindert Konflikte oder Interferenzen.

- **Historie anzeigen**: Verwenden Sie Standard-Git-Befehle, um Aufgaben-Historie zu erkunden
  ```bash
  cd <shrimp-daten-verzeichnis>
  git log --oneline          # Commit-Historie anzeigen
  git show <commit-hash>     # Spezifische Änderungen sehen
  git diff HEAD~5            # Mit 5 Commits vorher vergleichen
  ```

- **Commit-Format**: Alle Commits enthalten Zeitstempel und beschreibende Nachrichten
  ```
  [2025-08-07T13:45:23-07:00] Add new task: Implement user authentication
  [2025-08-07T14:12:10-07:00] Update task: Fix login validation
  [2025-08-07T14:45:55-07:00] Bulk task operation: append mode, 6 tasks
  ```

- **Wiederherstellung**: Vorherige Aufgaben-Zustände wiederherstellen, wenn nötig
  ```bash
  cd <shrimp-daten-verzeichnis>
  git checkout <commit-hash> -- tasks.json  # Spezifische Version wiederherstellen
  git reset --hard <commit-hash>            # Vollständige Rücksetzung zu vorherigem Zustand
  ```

## 🏗️ Technische Architektur

### Technologie-Stack

- **Frontend**: React 19 + Vite für Hot-Reload-Entwicklung
- **Tabellen-Komponente**: TanStack React Table für erweiterte Tabellen-Features
- **Styling**: Benutzerdefiniertes CSS mit dunklem Theme und responsivem Design
- **Backend**: Node.js HTTP-Server mit RESTful API
- **Build-System**: Vite für schnelle Entwicklung und optimierte Produktions-Builds

### Datei-Struktur

**Projekt-Organisation**: Der Task Viewer folgt einer sauberen, modularen Struktur, die Belange trennt und die Codebasis einfach zu navigieren und zu erweitern macht. Jedes Verzeichnis und jede Datei hat einen spezifischen Zweck in der Anwendungsarchitektur.

```
task-viewer/
├── src/                       # React-Anwendungs-Quellcode
│   ├── App.jsx               # Haupt-React-Komponente - verwaltet Status, Profile und Tabs
│   ├── components/           # Wiederverwendbare React-Komponenten
│   │   ├── TaskTable.jsx     # TanStack-Tabelle zum Anzeigen und Sortieren von Aufgaben
│   │   ├── Help.jsx          # README-Viewer mit Markdown-Rendering
│   │   └── ReleaseNotes.jsx  # Versions-Historie mit Syntax-Hervorhebung
│   ├── data/                 # Statische Daten und Konfiguration
│   │   └── releases.js       # Release-Metadaten und Versions-Informationen
│   └── index.css             # Vollständiges Styling-System mit dunklem Theme
├── releases/                  # Release-Notes-Markdown-Dateien und Bilder
│   ├── v*.md                 # Individuelle Release-Notes-Dateien
│   └── *.png                 # Screenshots und Bilder für Releases
├── dist/                     # Produktions-Build-Output (auto-generiert)
│   ├── index.html            # Optimierter HTML-Einstiegspunkt
│   └── assets/               # Gebündelte JS, CSS und andere Assets
├── server.js                 # Express-ähnlicher Node.js API-Server
├── cli.js                    # Kommandozeilen-Interface für Service-Verwaltung
├── vite.config.js            # Build-Tool-Konfiguration für Entwicklung/Produktion
├── package.json              # Projekt-Metadaten, Abhängigkeiten und npm-Skripte
├── install-service.sh        # Linux-Systemd-Service-Installer
└── README.md                 # Umfassende Dokumentation (diese Datei)
```

**Wichtige Verzeichnisse erklärt**:

- **`src/`**: Enthält allen React-Quellcode. Hier machen Sie die meisten UI-Änderungen.
- **`dist/`**: Auto-generierter Produktions-Build. Bearbeiten Sie niemals diese Dateien direkt.
- **`releases/`**: Speichert Release-Notes im Markdown-Format mit zugehörigen Bildern.
- **Root-Dateien**: Konfigurations- und Server-Dateien, die Build, Serving und Deployment handhaben.

### API-Endpoints

- `GET /` - Serviert die React-Anwendung
- `GET /api/agents` - Listet alle konfigurierten Profile
- `GET /api/tasks/{profileId}` - Gibt Aufgaben für spezifisches Profil zurück
- `POST /api/add-profile` - Fügt neues Profil mit Ordner-Pfad hinzu
- `DELETE /api/remove-profile/{profileId}` - Entfernt Profil
- `PUT /api/rename-profile/{profileId}` - Benennt Profil um
- `PUT /api/update-profile/{profileId}` - Aktualisiert Profil-Einstellungen
- `GET /api/readme` - Gibt README-Inhalt für Hilfe-Tab zurück
- `GET /releases/*.md` - Serviert Release-Notes-Markdown-Dateien
- `GET /releases/*.png` - Serviert Release-Notes-Bilder

## 🛠️ Entwicklung

### Entwicklungsumgebung einrichten

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver mit Hot Reload starten
npm run dev

# Entwicklungsserver läuft auf http://localhost:3000
# Backend-API-Server läuft auf http://localhost:9998
```

### Für Produktion bauen

```bash
# Optimiertes Produktions-Bundle bauen
npm run build

# Dateien werden im dist/ Verzeichnis generiert
# Produktions-Server starten
npm start
```

### Interface erweitern

Die modulare React-Architektur macht Erweiterungen einfach:

1. **Neue Komponenten hinzufügen**: Erstellen in `src/components/`
2. **Styling modifizieren**: `src/index.css` mit CSS-benutzerdefinierten Eigenschaften bearbeiten
3. **Features hinzufügen**: `App.jsx` mit neuem Status und Funktionalität erweitern
4. **API-Integration**: Endpoints in `server.js` hinzufügen

## 🔒 Sicherheit & Performance

### Sicherheits-Features

- **Localhost-Bindung**: Server nur von lokaler Maschine zugänglich
- **Direkter Dateizugriff**: Liest Aufgaben-Dateien direkt aus Dateisystem-Pfaden
- **Keine externen Abhängigkeiten**: Eigenständig mit minimaler Angriffsfläche
- **CORS-Schutz**: API-Endpoints mit CORS-Headern geschützt

### Performance-Optimierungen

- **Hot Module Replacement**: Sofortige Entwicklungs-Updates
- **Code Splitting**: Optimiertes Bundle-Loading
- **Effizientes Re-Rendering**: React-Optimierungs-Muster
- **Caching**: Statisches Asset-Caching für schnellere Ladevorgänge
- **Responsive Bilder**: Für alle Gerätegrößen optimiert

## 🐛 Fehlerbehebung

### Häufige Probleme

**Server startet nicht**
```bash
# Prüfen ob Port verwendet wird
lsof -i :9998

# Bestehende Prozesse beenden
pkill -f "node.*server.js"

# Anderen Port versuchen
SHRIMP_VIEWER_PORT=8080 node server.js
```

**Hilfe/Readme-Tab zeigt HTML**
Wenn der Hilfe-Tab HTML anstatt README-Inhalt anzeigt, muss der Server neugestartet werden, um die neuen API-Endpoints zu laden:
```bash
# Server stoppen (Ctrl+C) und neustarten
npm start
```

**Hot Reload funktioniert nicht**
```bash
# Sicherstellen, dass Entwicklungs-Abhängigkeiten installiert sind
npm install

# Entwicklungsserver neustarten
npm run dev
```

**Aufgaben laden nicht**
1. Prüfen Sie, dass `tasks.json` Dateien gültiges JSON enthalten
2. Verifizieren Sie, dass Datei-Berechtigungen lesbar sind
3. Prüfen Sie Browser-Konsole auf Fehlermeldungen
4. Verwenden Sie manuelle Aktualisierungs-Schaltfläche zum Neuladen der Daten

**Build-Fehler**
```bash
# node_modules leeren und neu installieren
rm -rf node_modules package-lock.json
npm install

# Vite-Cache leeren
rm -rf dist/
npm run build
```

## 📋 Änderungsprotokoll

### Version 2.1.0 (Aktuell) - 2025-07-29

#### 🚀 Haupt-Features
- **Direkter Dateipfad-Support**: Datei-Upload durch direkte Ordnerpfad-Eingabe für Live-Updates ersetzt
- **Hilfe/Readme-Tab**: Dokumentations-Tab mit Markdown-Rendering hinzugefügt
- **Release-Notes-Tab**: In-App-Release-Notes-Viewer mit Bild-Support  
- **Klickbare Abhängigkeiten**: Einfach zwischen abhängigen Aufgaben navigieren
- **KI-Aktionen-Spalte**: KI-Anweisungen für Aufgaben-Vervollständigung kopieren
- **Erweiterte UUID-Verwaltung**: Auf Aufgaben-Badges klicken, um UUIDs zu kopieren
- **Profil-Bearbeitung**: Profile umbenennen und Projekt-Roots konfigurieren
- **ES-Modul-Support**: Zu ES-Modulen für bessere Kompatibilität konvertiert

#### 🐛 Kritische Korrektur
- **Problem mit statischer Datei-Kopie behoben**: Dateien werden jetzt direkt aus angegebenen Pfaden gelesen anstatt statische Kopien in `/tmp/` zu erstellen

### Version 1.0.3 - 2025-07-26

#### 🧪 Tests & Zuverlässigkeit
- **Umfassende Test-Suite**: Vollständige Test-Abdeckung mit Vitest hinzugefügt
- **Komponenten-Tests**: React Testing Library Tests für alle Komponenten
- **Integrations-Tests**: End-to-End-Tests von Server und API-Endpoints
- **Bug-Fixes**: Multipart-Formulardaten-Handling in Profil-Verwaltung aufgelöst

### Version 1.0.2 - 2025-07-26

#### 🎨 Aufgaben-Detail-Ansicht
- **In-Tab-Navigation**: Modal durch nahtlose In-Tab-Aufgaben-Details ersetzt
- **Zurück-Schaltfläche**: Einfache Navigation zurück zur Aufgaben-Liste
- **Verbesserte UX**: Besserer Workflow ohne Popup-Unterbrechungen

### Version 1.0.1 - 2025-07-13

#### 🎨 Große UI-Überarbeitung
- **Moderne Tab-Oberfläche**: Professionelle Browser-Stil-Tabs mit Drag & Drop-Neuordnung
- **Verbundenes Design**: Nahtlose visuelle Verbindung zwischen Tabs und Inhalt
- **Verbessertes Layout**: Suche und Kontrollen für besseren Workflow repositioniert

#### ⚡ Erweiterte Funktionalität  
- **Konfigurierbare Auto-Aktualisierung**: Intervalle von 5 Sekunden bis 5 Minuten wählen
- **Erweiterte Suche**: Echtzeit-Filterung über alle Aufgaben-Felder
- **Sortierbare Spalten**: Header klicken, um nach jeder Spalte zu sortieren
- **Hot-Reload-Entwicklung**: Sofortige Updates während Entwicklung

#### 🔧 Technische Verbesserungen
- **React-Architektur**: Komplette Neuerstellung mit React 19 + Vite
- **TanStack Table**: Professionelle Tabellen-Komponente mit Paginierung
- **Responsives Design**: Mobile-First-Ansatz mit Breakpoint-Optimierung
- **Performance**: Optimiertes Rendering und effiziente Status-Verwaltung

### Version 1.0.0 - 2025-07-01

#### 🚀 Erste Veröffentlichung
- **Basis-Viewer**: Erste Implementierung mit grundlegender Web-Oberfläche
- **Profil-Verwaltung**: Aufgaben-Profile hinzufügen und entfernen
- **Server-API**: RESTful-Endpoints für Aufgaben-Daten
- **Aufgaben-Anzeige**: Aufgaben aus mehreren Projekten betrachten

## 📄 Lizenz

MIT-Lizenz - siehe Hauptprojekt-Lizenz für Details.

## 🤝 Mitwirken

Dieses Tool ist Teil des MCP Shrimp Task Manager-Projekts. Beiträge willkommen!

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Ihre Änderungen mit angemessenen Tests machen
4. Ihre Änderungen committen (`git commit -m 'Add amazing feature'`)
5. Zum Branch pushen (`git push origin feature/amazing-feature`)
6. Pull Request einreichen

### Entwicklungs-Richtlinien

- React-Best-Practices und Hooks-Muster befolgen
- Responsive-Design-Prinzipien beibehalten
- Angemessene TypeScript-Typen hinzufügen, wo anwendbar
- Über verschiedene Browser und Geräte testen
- Dokumentation für neue Features aktualisieren

---

**Frohes Aufgaben-Management! 🦐✨**

Gebaut mit ❤️ unter Verwendung von React, Vite und modernen Web-Technologien.