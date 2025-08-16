export const deDocumentation = {
  releaseNotes: {
    header: '📋 Versionshinweise',
    versions: 'Versionen',
    loading: 'Lade Versionshinweise...',
    notFound: 'Versionshinweise nicht gefunden.',
    error: 'Fehler beim Laden der Versionshinweise.',
    copy: 'Kopieren',
    copied: 'Kopiert!'
  },
  help: {
    header: 'ℹ️ Hilfe und Dokumentation',
    loading: 'Lade Dokumentation...',
    notFound: 'README nicht gefunden.',
    error: 'Fehler beim Laden der README.',
    copy: 'Kopieren',
    copied: 'Kopiert!'
  },
  releases: {
    'v3.0.0': {
      title: '🚀 Task Viewer v3.0.0 Versionshinweise',
      date: 'Veröffentlicht: 7. August 2025',
      content: `# 🚀 Task Viewer v3.0.0 Versionshinweise

*Veröffentlicht: 7. August 2025*

## 🎉 Wichtige Neue Features

### 🤖 Agenten-Verwaltungssystem
**Umfassende Subagenten-Verwaltung für spezialisierte Aufgabenbearbeitung**

Der SHRIMP-TASK-MANAGER unterstützt jetzt leistungsstarke Agenten-Verwaltungsfunktionen, die es Ihnen ermöglichen, spezialisierte KI-Agenten für verschiedene Aufgabentypen zu definieren und zu verwenden.

### 🤖 KI-gesteuerte Massen-Agenten-Zuweisung
**Weisen Sie automatisch die am besten geeigneten Agenten mehreren Aufgaben mit OpenAI GPT-4 zu**

### 📊 Git-Versionskontrolle für Aufgabenverlauf
**Automatische Git-Commits verfolgen jede Änderung Ihrer Aufgaben**

### 📊 Projekt-Historie-Ansicht
**Verfolgen und analysieren Sie den Ausführungsverlauf der Aufgaben Ihres Projekts**

### 🎨 Template-Verwaltungssystem
**Mächtige Template-Anpassung für KI-Aufgaben-Ausführung**

### 🌍 Internationalisierungsunterstützung (i18n)
**Multi-Sprach-Unterstützung mit nahtlosem Sprachwechsel**

- **Drei unterstützte Sprachen**: Englisch (en), Chinesisch (中文) und Spanisch (Español)
- **Persistente Sprachauswahl**: Ihre Sprachpräferenz wird gespeichert und gemerkt
- **Vollständige UI-Übersetzung**: Alle UI-Elemente, Buttons, Labels und Nachrichten sind vollständig übersetzt
- **Dynamischer Sprachwechsel**: Sprachen im laufenden Betrieb wechseln ohne Seitenneuladung

### 🧭 Verbesserte Navigation und Benutzeroberfläche
**Moderne, intuitive Oberflächenverbesserungen**

- **Verschachteltes Tab-System**: Organisierte Navigation mit primären und sekundären Tabs
- **URL-Status-Synchronisation**: Browser-URL wird aktualisiert, um die aktuelle Ansicht widerzuspiegeln
- **Aufgabendetail-Navigation**: Vorherige/Nächste-Buttons ermöglichen sequenzielle Aufgabenüberprüfung

## 🔄 Bedeutende Verbesserungen

### Aufgabendetail-Navigation
**Nahtloser Aufgabenüberprüfungs-Workflow**

Die Aufgabendetail-Ansicht enthält jetzt Vorherige/Nächste-Navigationsbuttons, die die Art und Weise transformieren, wie Sie Aufgaben überprüfen und bearbeiten.

### Performance-Verbesserungen
- **Optimierte Re-Renders**: React Hooks ordnungsgemäß memorisiert für bessere Performance
- **Lazy Loading**: Komponenten laden bei Bedarf für schnelleres initial Page Loading

### Entwickler-Erfahrung
- **Umfassende Test-Suite**: Integration und Sprachfeature-Tests hinzugefügt
- **Bessere Fehlerbehandlung**: Informativere Fehlermeldungen

## 🐛 Fehlerbehebungen

### Kritische Korrekturen
- **useRef Hook Fehler**: Fehlenden React Hook Import behoben, der App-Abstürze verursachte
- **Übersetzungsschlüssel**: Fehlende Übersetzungsschlüssel für alle unterstützten Sprachen hinzugefügt
- **Symbolic Link Loop**: Screenshot-Verzeichnis Endlosschleifen-Problem behoben

## 🏗️ Technische Updates

### Neue Abhängigkeiten
- \`@headlessui/react\`: Moderne UI-Komponenten
- \`@tanstack/react-table\`: Erweiterte Tabellenfunktionalität
- \`@uiw/react-md-editor\`: Markdown-Bearbeitung für Templates

### API-Verbesserungen
- **GET /api/templates**: Alle verfügbaren Templates auflisten
- **PUT /api/templates/:name**: Template-Inhalte aktualisieren
- **POST /api/templates/:name/duplicate**: Templates duplizieren

## 📝 Breaking Changes

### Konfigurationsupdates
- **Spracheinstellungen**: Neues Sprachpräferenz-Speicherformat
- **Template-Speicherung**: Templates werden jetzt im User-Home-Verzeichnis gespeichert

### API-Änderungen
- **Profil-Endpoints**: Aktualisierte Antwortformate enthalten mehr Metadaten
- **Aufgaben-Endpoints**: Verbessert mit zusätzlichen Filteroptionen

## 🚀 Migrationsanleitung

### Von v2.1 zu v3.0
1. **Sprachauswahl**: Ihre Standardsprache wird Englisch sein; wählen Sie die bevorzugte Sprache aus dem neuen Selektor
2. **Templates**: Bestehende benutzerdefinierte Templates werden beibehalten, benötigen aber möglicherweise Reaktivierung
3. **Browser-Cache**: Browser-Cache für optimale Performance leeren

## 🎯 Zusammenfassung

Version 3.0 stellt einen großen Sprung für den Task Viewer dar und verwandelt ihn von einem einfachen Aufgabenvisualisierungstool in eine umfassende Aufgabenverwaltungs- und Anpassungsplattform. Mit vollständiger Internationalisierungsunterstützung, mächtigem Template-Management, KI-gesteuerter Automatisierung und Git-basierten Historien-Tracking-Fähigkeiten bietet dieses Release Teams beispiellose Kontrolle über ihre KI-assistierten Entwicklungsworkflows.`
    },
    'v2.1.0': {
      title: '🚀 Task Viewer v2.1.0 Versionshinweise',
      date: 'Veröffentlicht: 29. Juli 2025',
      content: `# 🚀 Task Viewer v2.1.0 Versionshinweise

*Veröffentlicht: 29. Juli 2025*

## 🎉 Neue Features

### 🔗 Anklickbare Dateipfade mit Projektwurzel-Unterstützung
**Kopiere vollständige Dateipfade mit einem Klick!**

- **Klick-zum-Kopieren Dateipfade**: Wenn Sie auf eine Aufgabe klicken und zur Aufgabendetail-Seite gehen, haben verwandte Dateien, die die Aufgabe modifiziert oder erstellt, jetzt einen Hyperlink zur echten Datei in Ihrem Dateisystem

### 📋 Verbesserte UUID-Verwaltung
**Vereinfachte UUID-Kopierung mit intuitiven Interaktionen**

Bei der Interaktion mit Claude ist es manchmal nützlich, einfach auf eine Shrimp-Aufgabe zu verweisen, zum Beispiel:
"Claude, bitte vervollständige diese Shrimp-Aufgabe: da987923-2afe-4ac3-985e-ac029cc831e7". Daher haben wir eine Klick-zum-Kopieren-Funktion auf Aufgaben-# Badges und auf die UUID in der Aufgabennamen-Spalte hinzugefügt.

### 🔄 Aufgaben-Abhängigkeiten-Spalte für einfache Parallelisierung

Wir haben eine Abhängigkeiten-Spalte hinzugefügt, die die verknüpften UUIDs aller abhängigen Aufgaben auflistet. Jetzt können Sie einfach zu abhängigen Aufgaben navigieren.

### 🤖 KI-Anweisungs-Aktionen
**Ein-Klick KI-Aufgaben-Anweisungen**

Wir haben eine Aktionen-Spalte hinzugefügt, die ein nützliches Roboter-Emoji hat. Wenn Sie auf das Emoji klicken, kopiert es eine KI-Anweisung in die Zwischenablage, die Sie dann in den Chat Ihres Agenten einfügen können.

## 🔄 Änderungen

### UI/UX-Verbesserungen
- **Vereinfachte Kopier-Aktionen**: UUID-Kopierung nur beim Klick auf Aufgaben-Badge konsolidiert
- **Abhängigkeiten über Notizen**: Notizen-Spalte durch nützlichere Abhängigkeiten-Spalte ersetzt
- **In-App-Versionshinweise**: Versionshinweise für den Task Viewer werden im oberen Banner angezeigt

### Architektur-Updates
- **ES-Module-Kompatibilität**: Busboy-Abhängigkeit für bessere ES-Module-Unterstützung entfernt
- **Native Formular-Analyse**: Drittanbieter-Formular-Parsing durch eingebaute Node.js-Funktionen ersetzt

## 🐛 Fehlerbehebungen

### 🚨 KRITISCHE KORREKTUR: Datei-Upload erstellt statische Kopien
**Das Problem**: Beim Hinzufügen von Profilen durch Hochladen einer tasks.json-Datei erstellte das System eine statische Kopie im \`/tmp/\` Verzeichnis. Das bedeutete, dass Änderungen an Ihrer echten Aufgabendatei NICHT im Viewer reflektiert würden.

**Die Lösung**: Datei-Upload vollständig entfernt. Jetzt müssen Sie den Ordnerpfad direkt eingeben, und das System fügt automatisch \`/tasks.json\` hinzu.

### Profilverwaltung
- **Auto-Auswahl korrigiert**: Neue Profile werden jetzt nach der Erstellung automatisch ausgewählt und geladen
- **Import-Probleme behoben**: ES-Module-Import-Probleme mit der Busboy-Bibliothek korrigiert

## 🎯 Zusammenfassung

Version 2.1.0 verwandelt den Task Viewer in ein integrierteres Entwicklungstool mit verbesserter Dateipfad-Verwaltung, verbesserter UUID-Handhabung und besserer Visualisierung von Aufgabenbeziehungen.`
    },
    'v2.0.0': {
      title: 'Task Viewer v2.0.0 Versionshinweise',
      date: 'Veröffentlicht: 27. Juli 2025',
      content: `# Task Viewer v2.0.0 Versionshinweise

*Veröffentlicht: 27. Juli 2025*

## 🚀 Erstes Standalone-Release

### Hauptfunktionen
- **Web-basierter Task Viewer**: Moderne Oberfläche mit Profilverwaltung
- **Echtzeit-Updates**: Automatische Aktualisierung des Aufgabenstatus
- **Moderne UI**: Dunkles Theme mit responsivem Design
- **Profilverwaltung**: Unterstützung für Multi-Projekt-Aufgaben-Tracking

### Technologie-Stack
- React 19 + Vite
- TanStack Table
- Node.js Backend
- Hot-Reload-Entwicklung

## 🎉 Neue Features
- Drag-and-Drop-Tab-Umordnung
- Erweiterte Suche und Filterung
- Konfigurierbare Auto-Refresh-Intervalle
- Aufgaben-Statistik-Panel

## 🔧 Installation
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

Der Viewer wird unter http://localhost:9998 verfügbar sein`
    }
  },
  readme: {
    title: '🦐 Shrimp Task Manager Viewer',
    content: `# 🦐 Shrimp Task Manager Viewer

Eine moderne, React-basierte Weboberfläche zum Anzeigen und Verwalten von [Shrimp Task Manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) Aufgaben, die über das MCP (Model Context Protocol) Tool erstellt wurden. Diese visuelle Oberfläche ermöglicht es Ihnen, detaillierte Aufgabeninformationen einzusehen, den Fortschritt über mehrere Projekte hinweg zu verfolgen und Aufgaben-UUIDs für KI-Agent-Interaktionen einfach zu kopieren.

## Warum den Shrimp Task Viewer verwenden?

Bei der Verwendung des Shrimp Task Managers als MCP-Server mit KI-Agenten wie Claude bietet dieser Viewer wesentliche Einblicke in Ihr Aufgaben-Ökosystem:

- **Visuelle Aufgabenübersicht**: Sehen Sie alle Aufgaben, ihren Status, Abhängigkeiten und Fortschritt in einer sauberen Tab-Oberfläche
- **UUID-Verwaltung**: Klicken Sie auf beliebige Aufgaben-Badges, um sofort deren UUID für Befehle wie \`"Use task manager to complete this shrimp task: [UUID]"\` zu kopieren
- **Parallele Ausführung**: Öffnen Sie mehrere Terminals und verwenden Sie die KI-Aktionen-Spalte (🤖), um Aufgabenanweisungen für parallele KI-Agent-Ausführung zu kopieren
- **Live-Updates**: Direkte Dateipfad-Lesung stellt sicher, dass Sie immer den aktuellen Aufgabenstatus sehen
- **Multi-Projekt-Unterstützung**: Verwalten Sie Aufgaben über verschiedene Projekte mit ziehbaren Profil-Tabs

Für Informationen zur Einrichtung des Shrimp Task Managers als MCP-Server siehe das [Haupt-Repository](https://github.com/cjo4m06/mcp-shrimp-task-manager).

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

### 🎨 Professionelle UI/UX
- **Dunkles Theme**: Optimiert für Entwicklungsumgebungen
- **Responsives Layout**: Passt sich allen Bildschirmgrößen an
- **Barrierefreiheit**: Vollständige Tastatur-Navigation und Screenreader-Unterstützung
- **Interaktive Elemente**: Hover-Tooltips und visuelles Feedback durchgehend

## 🚀 Schnellstart

### Installation & Setup

1. **Klonen und zum Task Viewer-Verzeichnis navigieren**
   \`\`\`bash
   cd pfad/zu/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Abhängigkeiten installieren**
   \`\`\`bash
   npm install
   \`\`\`

3. **React-Anwendung bauen**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Server starten**
   \`\`\`bash
   npm start
   \`\`\`

   Der Viewer wird unter \`http://localhost:9998\` verfügbar sein

### Entwicklungsmodus

Für Entwicklung mit Hot Reload:

\`\`\`bash
# Entwicklungsserver starten
npm run dev
\`\`\`

Die App wird unter \`http://localhost:3000\` mit automatischer Neuerstellung bei Dateiänderungen verfügbar sein.

## 🖥️ Verwendung

### Erste Schritte

1. **Server starten**:
   \`\`\`bash
   npm start
   \`\`\`

2. **Browser öffnen**:
   Navigieren Sie zu \`http://127.0.0.1:9998\`

3. **Ihr erstes Profil hinzufügen**:
   - Klicken Sie die "**+ Tab Hinzufügen**" Schaltfläche
   - Geben Sie einen beschreibenden Profilnamen ein (z.B. "Team Alpha Aufgaben")
   - Geben Sie den Pfad zu Ihrem Shrimp-Datenordner ein, der tasks.json enthält
   - **Tipp:** Navigieren Sie zu Ihrem Ordner im Terminal und tippen Sie \`pwd\`, um den vollständigen Pfad zu erhalten
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

## 📄 Lizenz

MIT-Lizenz - siehe Hauptprojekt-Lizenz für Details.

## 🤝 Mitwirken

Dieses Tool ist Teil des MCP Shrimp Task Manager-Projekts. Beiträge willkommen!

---

**Frohes Aufgaben-Management! 🦐✨**

Gebaut mit ❤️ unter Verwendung von React, Vite und modernen Web-Technologien.`
  }
};