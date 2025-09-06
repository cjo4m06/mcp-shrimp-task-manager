[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇪🇸 Español](../es/README.md) | [🇫🇷 Français](../fr/README.md) | [🇮🇹 Italiano](README.md) | [🇮🇳 हिन्दी](../hi/README.md) | [🇯🇵 日本語](../ja/README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

# MCP Shrimp Task Manager

> 🦐 **Gestione intelligente delle attività per lo sviluppo assistito da IA** - Scomponi progetti complessi in attività gestibili, mantieni il contesto tra le sessioni e accelera il tuo flusso di lavoro di sviluppo.

<div align="center">
  
[![Shrimp Task Manager Demo](../yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[Guarda il video dimostrativo](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Avvio rapido](#-avvio-rapido)** • **[Documentazione](#-documentazione)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 Avvio rapido

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Client IA compatibile MCP (Claude Code, ecc.)

### Installazione

#### Installare Claude Code

**Windows 11 (con WSL2):**
```bash
# Prima, assicurati che WSL2 sia installato (in PowerShell come amministratore)
wsl --install

# Entra nell'ambiente Ubuntu/WSL
wsl -d Ubuntu

# Installa Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Avvia Claude Code
claude
```

**macOS/Linux:**
```bash
# Installa Claude Code globalmente
npm install -g @anthropic-ai/claude-code

# Avvia Claude Code
claude
```

#### Installare Shrimp Task Manager

```bash
# Clona il repository
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# Installa le dipendenze
npm install

# Costruisci il progetto
npm run build
```

### Configurare Claude Code

Crea un file `.mcp.json` nella tua directory del progetto:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/percorso/a/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/percorso/ai/tuoi/dati_shrimp",
        "TEMPLATES_USE": "it",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

Esempio di configurazione:
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/progetto/dati_shrimp",
        "TEMPLATES_USE": "it",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

Poi avvia Claude Code con la tua configurazione MCP personalizzata:

```bash
claude --dangerously-skip-permissions --mcp-config .mcp.json
```

<details>
<summary><b>Altri client IA</b></summary>

**Cline (Estensione VS Code)**: Un'estensione VS Code per la codifica assistita da IA. Aggiungi a VS Code settings.json sotto `cline.mcpServers`

**Claude Desktop**: Aggiungi a `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) o `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
</details>

### Iniziare a usare

1. **Inizializza il tuo progetto**: `"init project rules"`
2. **Pianifica un'attività**: `"plan task: implementare autenticazione utente"`
3. **Esegui attività**: `"execute task"` o `"continuous mode"`

## 💡 Cos'è Shrimp?

Shrimp Task Manager è un server MCP (Model Context Protocol) che trasforma il modo in cui gli agenti IA affrontano lo sviluppo software. Invece di perdere contesto o ripetere lavoro, Shrimp fornisce:

- **🧠 Memoria persistente**: Le attività e il progresso persistono tra le sessioni
- **📋 Flussi di lavoro strutturati**: Processi guidati per pianificazione, esecuzione e verifica
- **🔄 Scomposizione intelligente**: Scompone automaticamente attività complesse in sottoattività gestibili
- **🎯 Preservazione del contesto**: Non perdere mai la tua posizione, anche con limiti di token

## ✨ Caratteristiche principali

### Gestione delle attività
- **Pianificazione intelligente**: Analisi approfondita dei requisiti prima dell'implementazione
- **Scomposizione delle attività**: Divide grandi progetti in unità atomiche e testabili
- **Tracciamento delle dipendenze**: Gestione automatica delle relazioni tra attività
- **Monitoraggio del progresso**: Tracciamento e aggiornamenti dello stato in tempo reale

### Capacità avanzate
- **🔬 Modalità ricerca**: Esplorazione sistematica di tecnologie e soluzioni
- **🤖 Sistema di agenti**: Assegna agenti IA specializzati ad attività specifiche ([Scopri di più](../agents.md))
- **📏 Regole del progetto**: Definisci e mantieni standard di codifica nel tuo progetto
- **💾 Memoria delle attività**: Backup e ripristino automatici della cronologia delle attività

### Interfacce web

#### 🖥️ Visualizzatore attività
Interfaccia React moderna per la gestione visuale delle attività con drag-and-drop, ricerca in tempo reale e supporto multi-profilo.

**Configurazione rapida:**
```bash
cd tools/task-viewer
npm install
npm run start:all
# Accesso su http://localhost:5173
```

[📖 Documentazione completa del visualizzatore attività](../../tools/task-viewer/README.md)

<kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Interfaccia visualizzatore attività" width="600"/></kbd>

#### 🌐 GUI web
Interfaccia web leggera opzionale per panoramica rapida delle attività.

Abilita in `.env`: `ENABLE_GUI=true`

## 📚 Documentazione

- [📖 Documentazione completa](../README.md)
- [🛠️ Strumenti disponibili](../tools.md)
- [🤖 Gestione agenti](../agents.md)
- [🎨 Personalizzazione prompt](prompt-customization.md)
- [🔧 Riferimento API](../api.md)

## 🎯 Casi d'uso comuni

<details>
<summary><b>Sviluppo funzionalità</b></summary>

```
Agente: "plan task: aggiungere autenticazione utente con JWT"
# L'agente analizza il codebase, crea sottoattività

Agente: "execute task"
# Implementa l'autenticazione passo dopo passo
```
</details>

<details>
<summary><b>Correzione bug</b></summary>

```
Agente: "plan task: correggere memory leak nell'elaborazione dati"
# L'agente ricerca il problema, crea piano di correzione

Agente: "continuous mode"
# Esegue tutte le attività di correzione automaticamente
```
</details>

<details>
<summary><b>Ricerca e apprendimento</b></summary>

```
Agente: "research: confrontare React vs Vue per questo progetto"
# Analisi sistematica con pro/contro

Agente: "plan task: migrare componente al framework scelto"
# Crea piano di migrazione basato sulla ricerca
```
</details>

## 🛠️ Configurazione

### Variabili di ambiente

Crea un file `.env`:

```bash
# Richiesto
DATA_DIR=/percorso/all/archiviazione/dati

# Opzionale
ENABLE_GUI=true          # Abilita GUI web
WEB_PORT=3000           # Porta web personalizzata
PROMPT_LANGUAGE=it      # Lingua dei prompt (it, en, zh, ecc.)
```

### Comandi disponibili

| Comando | Descrizione |
|---------|-------------|
| `init project rules` | Inizializzare standard del progetto |
| `plan task [descrizione]` | Creare un piano di attività |
| `execute task [id]` | Eseguire attività specifica |
| `continuous mode` | Eseguire tutte le attività sequenzialmente |
| `list tasks` | Mostrare tutte le attività |
| `research [argomento]` | Entrare in modalità ricerca |
| `reflect task [id]` | Rivedere e migliorare attività |

## 🤝 Contribuire

Accogliamo i contributi! Si prega di consultare la nostra [Guida ai contributi](../../CONTRIBUTING.md) per i dettagli.

## 📄 Licenza

Questo progetto è concesso in licenza sotto la Licenza MIT - vedere il file [LICENSE](../../LICENSE) per i dettagli.

## 🌟 Crediti

Creato da [cjo4m06](https://github.com/cjo4m06) e mantenuto dalla community.

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">Discussioni</a>
</p>