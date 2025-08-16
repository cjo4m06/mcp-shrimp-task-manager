[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇫🇷 Français](../fr/README.md) | [🇮🇳 हिंदी](../hi/README.md) | [🇮🇹 Italiano](README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇹🇭 ไทย](../th/README.md) | [🇹🇷 Türkçe](../tr/README.md) | [🇻🇳 Tiếng Việt](../vi/README.md) | [🇨🇳 中文](../zh/README.md)

## Indice dei Contenuti

- [✨ Funzionalità](#funzionalità1)
- [🧭 Guida all'Uso](#guida-uso)
- [🖥️ Task Viewer Tool](#task-viewer-tool)
- [🔬 Modalità Ricerca](#modalità-ricerca)
- [🤖 Sistema di Gestione Agenti](#sistema-gestione-agenti)
- [🧠 Funzione Memoria Task](#funzione-memoria-task)
- [📋 Inizializzazione Regole Progetto](#regole-progetto)
- [🌐 Web GUI](#web-gui)
- [📚 Risorse Documentazione](#documentazione)
- [🔧 Installazione e Uso](#installazione)
- [🔌 Uso con Client Compatibili MCP](#client)
- [💡 Guida System Prompt](#prompt)
- [🛠️ Panoramica Strumenti Disponibili](#strumenti)
- [🏗️ Panoramica dell'Architettura](#panoramica-architettura)
- [📄 Licenza](#licenza)
- [🤖 Modelli Consigliati](#modelli-consigliati)

# MCP Shrimp Task Manager

[![Shrimp Task Manager Demo](/docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)

> 🚀 Un sistema intelligente di gestione dei task basato sul Model Context Protocol (MCP), che fornisce un framework di workflow di programmazione efficiente per gli AI Agents.

<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" />
</a>

Shrimp Task Manager guida gli Agents attraverso workflow strutturati per la programmazione sistematica, migliorando i meccanismi di gestione della memoria dei task ed evitando efficacemente il lavoro di codifica ridondante e ripetitivo.

## ✨ <a id="funzionalità1"></a>Funzionalità

- **Pianificazione e Analisi Task**: Comprensione approfondita e analisi dei requisiti dei task complessi
- **Decomposizione Intelligente Task**: Suddivisione automatica di task grandi in task più piccoli gestibili
- **Gestione Dipendenze**: Gestione precisa delle dipendenze tra i task, garantendo l'ordine corretto di esecuzione
- **Monitoraggio Stato Esecuzione**: Monitoraggio in tempo reale del progresso e stato di esecuzione dei task
- **Verifica Completezza Task**: Assicurarsi che i risultati dei task soddisfino i requisiti attesi
- **Valutazione Complessità Task**: Valutazione automatica della complessità dei task e fornire suggerimenti di gestione ottimali
- **Aggiornamenti Automatici Riassunto Task**: Generazione automatica di riassunti al completamento del task, ottimizzando le prestazioni della memoria
- **Funzione Memoria Task**: Backup automatico della cronologia dei task, fornendo capacità di memoria e riferimento a lungo termine
- **Modalità Ricerca**: Capacità di ricerca tecnica sistematica con workflow guidati per esplorare tecnologie, best practices e confronti di soluzioni
- **Inizializzazione Regole Progetto**: Definire standard e regole del progetto per mantenere coerenza in progetti grandi
- **<a id="web-gui"></a>Web GUI**: Fornisce un'interfaccia utente grafica web opzionale per la gestione dei task. Abilitare impostando `ENABLE_GUI=true` nel file `.env`. Quando abilitato, un file `WebGUI.md` contenente l'indirizzo di accesso verrà creato nel `DATA_DIR`. È possibile personalizzare la porta web impostando `WEB_PORT` (se non specificato, verrà automaticamente selezionata una porta disponibile).
- **<a id="task-viewer"></a>Task Viewer**: Un'interfaccia web moderna basata su React per visualizzare e gestire i dati dei task attraverso più profili con funzionalità avanzate come tab drag & drop, ricerca in tempo reale e auto-refresh configurabile. Vedere la [documentazione Task Viewer](../../tools/task-viewer) per istruzioni di setup e utilizzo.

  <kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Task Viewer Interface" /></kbd>
  
  <kbd><img src="../../tools/task-viewer/task-details-view.png" alt="Task Details View" /></kbd>

- **<a id="agent-management"></a>Gestione Agenti**: Sistema completo di gestione subagent per gestione specializzata dei task. Assegnare agenti AI specifici ai task, gestire metadati degli agenti e sfruttare il sistema agenti di Claude per un'esecuzione ottimale dei task.

## 🧭 <a id="guida-uso"></a>Guida all'Uso

Shrimp Task Manager offre un approccio strutturato alla programmazione assistita da AI attraverso workflow guidati e gestione sistematica dei task.

### Cos'è Shrimp?

Shrimp è essenzialmente un template di prompt che guida gli AI Agents a comprendere meglio e lavorare con il tuo progetto. Utilizza una serie di prompt per garantire che l'Agent si allinei strettamente con le esigenze e convenzioni specifiche del tuo progetto.

### Modalità Ricerca in Pratica

Prima di immergersi nella pianificazione dei task, puoi sfruttare la modalità ricerca per l'investigazione tecnica e la raccolta di conoscenze. Questo è particolarmente utile quando:

- Hai bisogno di esplorare nuove tecnologie o framework
- Vuoi confrontare diversi approcci di soluzione
- Stai investigando le best practices per il tuo progetto
- Hai bisogno di comprendere concetti tecnici complessi

Basta dire all'Agent "ricerca [il tuo argomento]" o "entra in modalità ricerca per [tecnologia/problema]" per iniziare l'investigazione sistematica. I risultati della ricerca informeranno quindi le tue successive decisioni di pianificazione dei task e sviluppo.

### Setup Iniziale

Quando lavori con un nuovo progetto, basta dire all'Agent "init project rules". Questo guiderà l'Agent a generare un set di regole adatte ai requisiti e struttura specifici del tuo progetto.

### Processo di Pianificazione Task

Per sviluppare o aggiornare funzionalità, usa il comando "plan task [la tua descrizione]". Il sistema farà riferimento alle regole precedentemente stabilite, tenterà di comprendere il tuo progetto, cercherà sezioni di codice pertinenti e proporrà un piano completo basato sullo stato attuale del tuo progetto.

### Meccanismo di Feedback

Durante il processo di pianificazione, Shrimp guida l'Agent attraverso più fasi di ragionamento. Puoi rivedere questo processo e fornire feedback se senti che sta andando nella direzione sbagliata. Basta interrompere e condividere la tua prospettiva - l'Agent incorporerà il tuo feedback e continuerà il processo di pianificazione.

### Esecuzione Task

Quando sei soddisfatto del piano, usa "execute task [nome task o ID]" per implementarlo. Se non specifichi un nome task o ID, il sistema identificherà automaticamente ed eseguirà il task con la priorità più alta.

### Modalità Continua

Se preferisci eseguire tutti i task in sequenza senza intervento manuale per ogni task, usa "continuous mode" per processare automaticamente l'intera coda dei task.

### Nota Limitazione Token

A causa dei limiti di token LLM, il contesto può essere perso durante conversazioni lunghe. Se questo accade, basta aprire una nuova sessione chat e chiedi all'Agent di continuare l'esecuzione. Il sistema riprenderà da dove ha lasciato senza richiedere di ripetere i dettagli del task o il contesto.

### Lingua Prompt e Personalizzazione

Puoi cambiare la lingua dei prompt di sistema impostando la variabile d'ambiente `TEMPLATES_USE`. Supporta `en` (Inglese) e `zh` (Cinese Tradizionale) di default. Inoltre, puoi copiare una directory template esistente (es. `src/prompts/templates_en`) nella posizione specificata da `DATA_DIR`, modificarla, e poi puntare `TEMPLATES_USE` al nome della tua directory template personalizzata. Questo permette una personalizzazione più profonda dei prompt. Per istruzioni dettagliate.

## 🔬 <a id="modalità-ricerca"></a>Modalità Ricerca

Shrimp Task Manager include una modalità ricerca specializzata progettata per l'investigazione tecnica sistematica e la raccolta di conoscenze.

### Cos'è la Modalità Ricerca?

La Modalità Ricerca è un sistema di workflow guidato che aiuta gli AI Agents a condurre ricerche tecniche approfondite e sistematiche. Fornisce approcci strutturati per esplorare tecnologie, confrontare soluzioni, investigare best practices e raccogliere informazioni complete per i task di programmazione.

### Funzionalità Chiave

- **Investigazione Sistematica**: Workflow strutturati assicurano copertura completa degli argomenti di ricerca
- **Ricerca Multi-Sorgente**: Combina ricerca web e analisi codebase per comprensione completa
- **Gestione Stato**: Mantiene contesto e progresso di ricerca attraverso più sessioni
- **Esplorazione Guidata**: Previene che la ricerca diventi non focalizzata o vada fuori argomento
- **Integrazione Conoscenza**: Integra senza problemi i risultati della ricerca con pianificazione ed esecuzione dei task

### Quando Usare la Modalità Ricerca

La Modalità Ricerca è particolarmente preziosa per:

- **Esplorazione Tecnologia**: Investigare nuovi framework, librerie o strumenti
- **Ricerca Best Practices**: Trovare standard industriali e approcci raccomandati
- **Confronto Soluzioni**: Valutare diversi approcci tecnici o architetture
- **Investigazione Problemi**: Approfondire sfide tecniche complesse
- **Pianificazione Architettura**: Ricercare pattern di design e architetture di sistema

### Come Usare la Modalità Ricerca

Basta dire all'Agent di entrare in modalità ricerca con il tuo argomento:

- **Uso base**: "Entra in modalità ricerca per [il tuo argomento]"
- **Ricerca specifica**: "Ricerca [tecnologia/problema specifico]"
- **Analisi comparativa**: "Ricerca e confronta [opzione A vs B]"

Il sistema guiderà l'Agent attraverso fasi di ricerca strutturate, assicurando investigazione approfondita mantenendo focus sui tuoi bisogni specifici.

### Workflow di Ricerca

1. **Definizione Argomento**: Definire chiaramente ambito e obiettivi della ricerca
2. **Raccolta Informazioni**: Collezione sistematica di informazioni pertinenti
3. **Analisi e Sintesi**: Processare e organizzare i risultati
4. **Aggiornamenti Stato**: Monitoraggio regolare progresso e preservazione contesto
5. **Integrazione**: Applicare risultati ricerca al contesto del tuo progetto

> **💡 Raccomandazione**: Per la migliore esperienza modalità ricerca, raccomandiamo di usare **Claude 4 Sonnet**, che fornisce capacità analitiche eccezionali e sintesi di ricerca completa.

## 🏗️ <a id="panoramica-architettura"></a>Panoramica dell'Architettura

### Architettura Core

L'MCP Shrimp Task Manager è costruito come un server Model Context Protocol (MCP) che fornisce capacità strutturate di gestione task per agenti AI attraverso workflow guidati e decomposizione sistematica dei task.

#### 1. **Fondazione MCP Server**
- Costruito su `@modelcontextprotocol/sdk` per conformità protocollo MCP
- Usa trasporto stdio per comunicazione con client AI
- Espone 16 strumenti specializzati tramite definizioni JSON Schema
- Supporta operazioni sia sincrone che asincrone

#### 2. **Modello Dati Task** (`src/types/index.ts`, `src/models/taskModel.ts`)
- **Entità Task**: Struttura dati core con ID unico, nome, descrizione, stato e dipendenze
- **Stati Task**: PENDING → IN_PROGRESS → COMPLETED (o BLOCKED)
- **Grafo Dipendenze**: Gestisce relazioni task e ordine di esecuzione
- **File Correlati**: Traccia file associati a ogni task (TO_MODIFY, REFERENCE, CREATE, ecc.)
- **Persistenza**: Archiviazione file JSON con versioning Git per cronologia completa
- **Sistema Memoria**: Backup automatici e preservazione cronologia task a lungo termine

#### 3. **Architettura Sistema Strumenti** (`src/tools/`)
Il sistema fornisce strumenti specializzati organizzati in tre categorie principali:

**Strumenti Gestione Task:**
- `plan_task`: Converte linguaggio naturale in piani di sviluppo strutturati
- `analyze_task`: Analisi tecnica approfondita con valutazione complessità
- `split_tasks`: Decomposizione intelligente di task complessi in subtask gestibili
- `execute_task`: Implementazione guidata con istruzioni passo-passo
- `verify_task`: Verifica completamento e assicurazione qualità
- `list_tasks`, `query_task`, `get_task_detail`: Ispezione e recupero task
- `update_task`, `delete_task`, `clear_all_tasks`: Manipolazione task

**Strumenti Cognitivi:**
- `process_thought`: Framework ragionamento chain-of-thought per risoluzione problemi complessi
- `reflect_task`: Analisi post-completamento ed estrazione apprendimento
- `research_mode`: Investigazione tecnica sistematica con workflow guidati

**Strumenti Progetto:**
- `init_project_rules`: Stabilisce convenzioni e standard specifici del progetto

#### 4. **Sistema Template Prompt** (`src/prompts/`)
- **Supporto Multi-lingua**: Template inglese e cinese tradizionale
- **Generazione Basata Template**: Costruzione prompt modulare
- **Prompt Context-aware**: Generazione prompt dinamica basata su stato task
- **Template Personalizzabili**: Override o estensione tramite variabili ambiente
- **Caricamento Template**: Selezione template dinamica basata su configurazione

#### 5. **Sistema Integrazione Agente** (`src/utils/agentLoader.ts`)
- **Assegnazione Agente**: I task possono essere assegnati ad agenti AI specializzati
- **Metadati Agente**: Memorizza capacità e specializzazioni agenti
- **Matching Agente**: Selezione agente intelligente basata su requisiti task
- **Integrazione Claude**: Integrazione senza problemi con sistema agenti Claude

### Flusso Dati e Workflow

#### 1. **Fase Pianificazione Task**
```
Richiesta Utente → plan_task → analyze_task → split_tasks (se complesso)
```
- Il linguaggio naturale viene analizzato e convertito in task strutturati
- La valutazione complessità determina se è necessaria la suddivisione task
- Le dipendenze vengono automaticamente identificate e mappate

#### 2. **Fase Esecuzione**
```
execute_task → Guida Implementazione → Aggiornamenti Stato → Tracciamento File
```
- Viene generata guida implementazione passo-passo
- I file correlati vengono tracciati e monitorati
- Lo stato progresso viene aggiornato in tempo reale
- I commit Git vengono creati per controllo versione

#### 3. **Fase Verifica**
```
verify_task → reflect_task → Riassunto Task → Archiviazione Memoria
```
- Il completamento viene verificato contro criteri di accettazione
- Le lezioni apprese vengono estratte per riferimento futuro
- Il riassunto task viene generato e memorizzato
- Il sistema memoria preserva conoscenza per task futuri

#### 4. **Memoria e Persistenza**
- **Archiviazione Primaria**: `tasks.json` in DATA_DIR
- **Controllo Versione**: Il repository Git traccia tutti i cambiamenti
- **Sistema Backup**: Backup automatici con timestamp
- **Directory Memoria**: Archiviazione a lungo termine di task completati
- **Isolamento Progetto**: Il protocollo ListRoots abilita separazione dati per progetto

### Principi Chiave di Design

1. **Ragionamento Chain-of-Thought**: Gli strumenti guidano l'AI attraverso processi di pensiero strutturati
2. **Raffinamento Iterativo**: I task possono essere analizzati, suddivisi e raffinati più volte
3. **Preservazione Contesto**: La cronologia Git e il sistema memoria prevengono perdita contesto tra sessioni
4. **Flessibilità Linguaggio**: Supporto bilingue con template personalizzabili
5. **Gestione Stateful**: L'archiviazione persistente mantiene stato task tra conversazioni
6. **Workflow Guidati**: Il sistema guida piuttosto che comandare, assicurando coerenza

### Interfacce Web

#### 1. **Web GUI Integrata** (`src/web/webServer.ts`)
- Server Express.js opzionale (ENABLE_GUI=true)
- Visualizzazione task in tempo reale
- Selezione porta automatica con fallback
- Genera WebGUI.md con URL accesso

#### 2. **Strumento Task Viewer** (`tools/task-viewer/`)
- Applicazione React standalone
- Supporto multi-profilo per progetti diversi
- Monitoraggio task in tempo reale con auto-refresh
- Interfaccia drag-and-drop per organizzazione
- Integrazione gestione agenti

### Punti di Integrazione

- **Protocollo MCP**: Protocollo standard per interazione modelli AI
- **File System**: Manipolazione diretta file per dati task
- **Integrazione Git**: Controllo versione per cronologia task
- **Variabili Ambiente**: Opzioni configurazione estese
- **API Web**: Endpoint RESTful per interazione GUI

## 🔧 Implementazione Tecnica

- **Node.js**: Ambiente runtime JavaScript ad alte prestazioni
- **TypeScript**: Fornisce ambiente sviluppo type-safe
- **MCP SDK**: Interfaccia per interazione senza problemi con modelli linguaggio grandi
- **UUID**: Genera identificatori task unici e affidabili
- **Express.js**: Server web per GUI opzionale
- **Git**: Controllo versione per cronologia task

## 📄 <a id="licenza"></a>Licenza

Questo progetto è licenziato sotto MIT License - vedere il file [LICENSE](../../LICENSE) per dettagli.

## <a id="modelli-consigliati"></a>Modelli Consigliati

Per la migliore esperienza, raccomandiamo di usare i seguenti modelli:

- **Claude 3.7**: Offre forti capacità di comprensione e generazione.
- **Gemini 2.5**: L'ultimo modello di Google, performa eccellentemente.

A causa delle differenze nei metodi di training e capacità di comprensione tra modelli, usare altri modelli potrebbe portare a risultati variabili per gli stessi prompt. Questo progetto è stato ottimizzato per Claude 3.7 e Gemini 2.5.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)