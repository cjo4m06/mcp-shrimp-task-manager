export const itDocumentation = {
  releaseNotes: {
    header: '📋 Note di Rilascio',
    versions: 'Versioni',
    loading: 'Caricamento note di rilascio...',
    notFound: 'Note di rilascio non trovate.',
    error: 'Errore nel caricamento delle note di rilascio.',
    copy: 'Copia',
    copied: 'Copiato!'
  },
  help: {
    header: 'ℹ️ Aiuto e Documentazione',
    loading: 'Caricamento documentazione...',
    notFound: 'README non trovato.',
    error: 'Errore nel caricamento del README.',
    copy: 'Copia',
    copied: 'Copiato!'
  },
  releases: {
    'v2.1.0': {
      title: '🚀 Note di Rilascio Task Viewer v2.1.0',
      date: 'Rilasciato: 29 luglio 2025',
      content: `# 🚀 Note di Rilascio Task Viewer v2.1.0

*Rilasciato: 29 luglio 2025*

## 🎉 Novità

### 🔗 Percorsi File Cliccabili con Supporto Root Progetto
**Copia percorsi file completi con un clic!**

- **Percorsi File Click-to-Copy**: Ora quando clicchi su un'attività e vai alla pagina Dettagli Attività, se ci sono file correlati elencati che l'attività modifica o crea, quel nome file avrà ora un hyperlink al file reale nel tuo filesystem (purché tu configuri la cartella progetto quando crei/modifichi la scheda profilo)

### 📋 Gestione UUID Migliorata
**Copia UUID semplificata con interazioni intuitive**

Quando interagisci con Claude, a volte è utile referenziare facilmente un'attività shrimp, per esempio:
"Claude, per favore completa questa attività shrimp: da987923-2afe-4ac3-985e-ac029cc831e7". Quindi, abbiamo aggiunto una funzione Click-to-copy sui badge Attività # e sull'UUID elencato nella colonna Nome Attività.

- **Badge Attività Click-to-Copy**: Clicca su qualsiasi badge numero attività per copiare istantaneamente il suo UUID
- **UUID troncato visualizzato sotto il nome attività nella Colonna Nome Attività**: Clicca sull'UUID per copiare

### 🔄 Colonna Dipendenze Attività per Facile Parallelizzazione

Abbiamo aggiunto una colonna Dipendenze che elenca gli UUID collegati di qualsiasi attività dipendente. Ora puoi facilmente navigare alle attività dipendenti.

### 🤖 Azioni Istruzioni AI
**Istruzioni attività AI con un clic**

Abbiamo aggiunto una Colonna Azioni che ha un'emoji Robot utile. Se clicchi sull'emoji, copierà un'Istruzione AI negli appunti che puoi poi incollare nella chat del tuo agente. L'istruzione è stata codificata per copiare quanto segue: "Usa il task manager per completare questa attività shrimp: < UUID >"

Questa istruzione è utile per la parallelizzazione. Per esempio, se le seguenti 3 attività non hanno dipendenze, puoi aprire più finestre terminale e incollare le Istruzioni AI. Esempio:

Terminale 1: Usa il task manager per completare questa attività shrimp: da987923-2afe-4ac3-985e-ac029cc831e7
Terminale 2: Usa il task manager per completare questa attività shrimp: 4afe3f1c-bf7f-4642-8485-668c33a1e0fc
Terminale 3: Usa il task manager per completare questa attività shrimp: 21bd2cb9-4109-4897-9904-885ee2b0792e

### ✏️ Pulsante Modifica Profilo

**Configurazione Root Progetto**: Ora puoi impostare la root progetto per profilo, questo ti permetterà di abilitare la copia percorso file completo quando visualizzi "file correlati" guardando la pagina dettagli attività.

**Capacità di Rinominare un Profilo**: Ora puoi rinominare una scheda profilo senza dover eliminare e ricreare.

## 🔄 Cambiamenti

### Miglioramenti UI/UX
- **Azioni Copia Semplificate**: Copia UUID consolidata solo al clic del badge attività
- **Dipendenze sopra Note**: Sostituita colonna Note con colonna Dipendenze più utile
- **Note Versione In-App**: Le note versione per il task viewer sono mostrate nel banner superiore
- **Navigazione Basata su Schede**: Note rilascio integrate nel sistema schede con funzionalità chiusura

### Aggiornamenti Architettura
- **Compatibilità Moduli ES**: Rimossa dipendenza busboy per migliore supporto moduli ES
- **Parsing Form Nativo**: Sostituito parsing form terze parti con funzioni Node.js integrate
- **Aggiornamento Versione**: Aggiornato a v2.1.0 (per task viewer) per riflettere aggiunte significative funzionalità

## 🐛 Correzioni Bug

### 🚨 CORREZIONE CRITICA: Upload File Crea Copie Statiche
**Il Problema**: Quando si aggiungevano profili caricando un file tasks.json, il sistema stava creando una copia statica nella directory \`/tmp/\`. Questo significava che qualsiasi cambiamento nel tuo file attività reale NON si rifletterebbe nel viewer: le attività apparirebbero bloccate nel loro stato originale (es. mostrando "in progresso" quando erano in realtà "completate").

**La Soluzione**: Rimosso completamente l'upload file. Ora devi inserire il percorso cartella direttamente, e il sistema aggiunge automaticamente \`/tasks.json\`. Questo assicura che il viewer legga sempre dal tuo file reale live.

**Come usare**:
1. Naviga alla tua cartella dati shrimp nel terminale
2. Digita \`pwd\` per ottenere il percorso completo (evidenziato in giallo nella UI)
3. Incolla questo percorso nel campo "Percorso Cartella Attività"
4. Il sistema usa automaticamente \`[tuo-percorso]/tasks.json\`

### Gestione Profili
- **Auto-Selezione Corretta**: I nuovi profili ora sono automaticamente selezionati e caricati dopo la creazione
- **Problemi Import Risolti**: Corretti problemi import moduli ES con libreria busboy
- **Modal Modifica Unificato**: Combinato rinomina e modifica root progetto in un'interfaccia singola

### Gestione Dati
- **Persistenza Root Progetto**: I percorsi root progetto ora sono salvati correttamente con i dati profilo
- **Caricamento Attività**: Corrette condizioni race quando si cambia tra profili
- **Gestione Stato**: Migliorata gestione stato selezione profilo

## 🗑️ Rimosso

### Funzionalità Deprecate
- **Dipendenza Busboy**: Sostituita con parsing form nativo Node.js
- **Colonna Note**: Sostituita dalla colonna Dipendenze più utile
- **Pulsanti Copia Individuali**: Copia UUID consolidata al clic badge attività
- **Pulsante Rinomina Separato**: Fuso nel pulsante Modifica Profilo unificato

## 📝 Dettagli Tecnici

### Nuovi Endpoint API
- **PUT /api/update-profile/:id**: Aggiorna nome e impostazioni profilo
- **Migliorato /api/tasks/:id**: Ora include projectRoot nella risposta
- **GET /releases/*.md**: Servire file markdown note rilascio

### Componenti Frontend
- **Componente ReleaseNotes**: Belle note rilascio renderizzate in markdown
- **TaskTable Migliorato**: Supporto per colonne dipendenze e azioni
- **TaskDetailView Migliorato**: Percorsi file cliccabili con copia percorso completo

### Configurazione
- **Storage Root Progetto**: I profili ora memorizzano il percorso opzionale projectRoot
- **Persistenza Impostazioni**: Tutti i dati profilo sono salvati in ~/.shrimp-task-viewer-settings.json

## 🎯 Riepilogo

La versione 2.1.0 trasforma il Task Viewer in uno strumento sviluppo più integrato con gestione percorsi file migliorata, gestione UUID potenziata e migliore visualizzazione relazioni attività. La gestione profili unificata e le note rilascio in-app forniscono un'esperienza utente più coesa mantenendo l'interfaccia pulita e intuitiva.`
    },
    'v2.0.0': {
      title: 'Note di Rilascio Task Viewer v2.0.0',
      date: 'Rilasciato: 27 luglio 2025',
      content: `# Note di Rilascio Task Viewer v2.0.0

*Rilasciato: 27 luglio 2025*

## 🚀 Rilascio Standalone Iniziale

### Funzionalità Principali
- **Task Viewer Basato su Web**: Interfaccia moderna con gestione profili
- **Aggiornamenti Real-time**: Aggiornamento automatico stato attività
- **UI Moderna**: Tema scuro con design responsive
- **Gestione Profili**: Supporto per tracking attività multi-progetto

### Stack Tecnologico
- React 19 + Vite
- TanStack Table
- Backend Node.js
- Sviluppo hot reload

## 🎉 Nuove Funzionalità
- Riordinamento schede drag and drop
- Ricerca e filtraggio avanzati
- Intervalli auto-refresh configurabili
- Dashboard statistiche attività

## 🔧 Installazione
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

Il viewer sarà disponibile su http://localhost:9998`
    }
  },
  readme: {
    title: '🦐 Shrimp Task Manager Viewer',
    content: `# 🦐 Shrimp Task Manager Viewer

Un'interfaccia web moderna basata su React per visualizzare e gestire le attività di [Shrimp Task Manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) create attraverso lo strumento MCP (Model Context Protocol). Questa interfaccia visuale ti permette di vedere informazioni dettagliate delle attività, tracciare i progressi su più progetti e copiare facilmente gli UUID delle attività per le interazioni con gli agenti IA.

## Perché usare Shrimp Task Viewer?

Quando usi Shrimp Task Manager come server MCP con agenti IA come Claude, questo visualizzatore fornisce visibilità essenziale nel tuo ecosistema di attività:

- **Panoramica Visuale delle Attività**: Vedi tutte le attività, il loro stato, dipendenze e progressi in un'interfaccia a schede pulita
- **Gestione UUID**: Clicca su qualsiasi badge di attività per copiare istantaneamente il suo UUID per comandi come \`"Usa il task manager per completare questa attività shrimp: [UUID]"\`
- **Esecuzione Parallela**: Apri più terminali e usa la colonna Azioni IA (🤖) per copiare istruzioni di attività per l'esecuzione parallela di agenti IA
- **Aggiornamenti Live**: La lettura diretta dei percorsi file assicura che vedi sempre lo stato attuale delle attività
- **Supporto Multi-Progetto**: Gestisci attività su diversi progetti con schede profilo trascinabili

Per informazioni sulla configurazione di Shrimp Task Manager come server MCP, consulta il [repository principale](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 🌟 Funzionalità

### 🏷️ Interfaccia Tab Moderna
- **Tab Trascinabili**: Riordina profili trascinando le tab
- **Design Professionale**: Tab stile browser che si connettono perfettamente al contenuto
- **Feedback Visuale**: Indicazione chiara tab attiva ed effetti hover
- **Aggiungi Nuovi Profili**: Pulsante integrato "+ Aggiungi Tab" che si abbina al design dell'interfaccia

### 🔍 Ricerca e Filtraggio Avanzati
- **Ricerca Real-time**: Filtraggio istantaneo attività per nome, descrizione, stato o ID
- **Colonne Ordinabili**: Clicca intestazioni colonna per ordinare per qualsiasi campo
- **TanStack Table**: Componente tabella potente con paginazione e filtraggio
- **Design Responsive**: Funziona perfettamente su desktop, tablet e mobile

### 🔄 Auto-Refresh Intelligente
- **Intervalli Configurabili**: Scegli da 5s, 10s, 15s, 30s, 1m, 2m o 5m
- **Controlli Smart**: Auto-refresh toggle con selezione intervallo
- **Indicatori Visuali**: Stati di caricamento e stato refresh
- **Refresh Manuale**: Pulsante refresh dedicato per aggiornamenti su richiesta

### 📊 Gestione Attività Completa
- **Statistiche Attività**: Conteggi live per attività Totali, Completate, In Corso e In Attesa
- **Gestione Profili**: Aggiungi/rimuovi/riordina profili via interfaccia intuitiva
- **Impostazioni Persistenti**: Configurazioni profilo salvate tra sessioni
- **Hot Reload**: Modalità sviluppo con aggiornamenti istantanei

### 🎨 UI/UX Professionale
- **Tema Scuro**: Ottimizzato per ambienti di sviluppo
- **Layout Responsive**: Si adatta a tutte le dimensioni schermo
- **Accessibilità**: Navigazione completa da tastiera e supporto screen reader
- **Elementi Interattivi**: Tooltip hover e feedback visuale in tutta l'app

## 🚀 Avvio Rapido

### Installazione e Configurazione

1. **Clona e naviga alla directory task viewer**
   \`\`\`bash
   cd path/to/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Installa dipendenze**
   \`\`\`bash
   npm install
   \`\`\`

3. **Costruisci l'applicazione React**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Avvia il server**
   \`\`\`bash
   npm start
   \`\`\`

   Il visualizzatore sarà disponibile su \`http://localhost:9998\`

### Modalità Sviluppo

Per sviluppo con hot reload:

\`\`\`bash
# Avvia il server di sviluppo
npm run dev
\`\`\`

L'app sarà disponibile su \`http://localhost:3000\` con ricostruzione automatica sui cambiamenti file.

## 🖥️ Utilizzo

### Iniziare

1. **Avvia il server**:
   \`\`\`bash
   npm start
   \`\`\`

2. **Apri il tuo browser**:
   Naviga a \`http://127.0.0.1:9998\`

3. **Aggiungi il tuo primo profilo**:
   - Clicca il pulsante "**+ Aggiungi Tab**"
   - Inserisci un nome profilo descrittivo (es. "Attività Team Alpha")
   - Inserisci il percorso alla tua cartella dati shrimp contenente tasks.json
   - **Suggerimento:** Naviga alla tua cartella nel terminale e digita \`pwd\` per ottenere il percorso completo
   - Clicca "**Aggiungi Profilo**"

4. **Gestisci le tue attività**:
   - Cambia tra profili usando le tab
   - Cerca attività usando la casella ricerca
   - Ordina colonne cliccando le intestazioni
   - Configura auto-refresh come necessario

### Gestione Tab

- **Cambia Profili**: Clicca qualsiasi tab per cambiare a quel profilo
- **Riordina Tab**: Trascina le tab per riorganizzarle nel tuo ordine preferito
- **Aggiungi Nuovo Profilo**: Clicca il pulsante "**+ Aggiungi Tab**"
- **Rimuovi Profilo**: Clicca la × su qualsiasi tab (con conferma)

## 📄 Licenza

Licenza MIT - vedi la licenza progetto principale per dettagli.

## 🤝 Contribuire

Questo strumento è parte del progetto MCP Shrimp Task Manager. I contributi sono benvenuti!

---

**Felice gestione attività! 🦐✨**

Costruito con ❤️ usando React, Vite e tecnologie web moderne.`
  }
};