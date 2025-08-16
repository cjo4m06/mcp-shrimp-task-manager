# 🦐 Shrimp Task Manager Viewer

Un'interfaccia web moderna basata su React per visualizzare e gestire le attività di [Shrimp Task Manager](https://github.com/cjo4m06/mcp-shrimp-task-manager) create attraverso lo strumento MCP (Model Context Protocol). Questa interfaccia visuale ti permette di vedere informazioni dettagliate delle attività, tracciare i progressi su più progetti e copiare facilmente gli UUID delle attività per le interazioni con gli agenti IA.

## Perché usare Shrimp Task Viewer?

Quando usi Shrimp Task Manager come server MCP con agenti IA come Claude, questo visualizzatore fornisce visibilità essenziale nel tuo ecosistema di attività:

- **Panoramica Visuale delle Attività**: Vedi tutte le attività, il loro stato, dipendenze e progressi in un'interfaccia a schede pulita
- **Gestione UUID**: Clicca su qualsiasi badge di attività per copiare istantaneamente il suo UUID per comandi come `"Usa il task manager per completare questa attività shrimp: [UUID]"`
- **Esecuzione Parallela**: Apri più terminali e usa la colonna Azioni IA (🤖) per copiare istruzioni di attività per l'esecuzione parallela di agenti IA
- **Aggiornamenti Live**: La lettura diretta dei percorsi file assicura che vedi sempre lo stato attuale delle attività
- **Supporto Multi-Progetto**: Gestisci attività su diversi progetti con schede profilo trascinabili

Per informazioni sulla configurazione di Shrimp Task Manager come server MCP, consulta il [repository principale](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 📖 Documentazione Dettagliata delle Pagine

### 📋 Pagina Attività

La pagina principale Attività è il tuo centro di comando per la gestione delle attività. Fornisce una vista completa di tutte le attività nel profilo selezionato con potenti funzionalità per organizzazione ed esecuzione.

![Panoramica Pagina Attività](task-viewer-interface.png)

**Funzionalità Principali:**
- **Tabella Attività**: Visualizza tutte le attività con colonne ordinabili inclusi Attività #, Stato, Agente, Data Creazione, Nome, Dipendenze e Azioni
- **Badge di Stato**: Badge con codice colore (🟡 In Attesa, 🔵 In Corso, 🟢 Completato, 🔴 Bloccato)
- **Assegnazione Agenti**: Selettore dropdown per assegnare agenti IA specifici alle attività
- **Popup Visualizzatore Agenti**: Clicca l'icona occhio (👁️) per aprire un popup dove puoi sfogliare e selezionare agenti
- **Colonna Dipendenze**: Mostra ID attività collegate con funzionalità click-to-navigate
- **Colonna Azioni**: Contiene la potente emoji robot (🤖) per l'esecuzione attività IA
- **Navigazione Dettagli Attività**: Quando visualizzi i dettagli dell'attività, usa i pulsanti ← Precedente e Successivo → per navigare rapidamente tra le attività

#### 🤖 Emoji Robot - Esecuzione Attività IA

L'emoji robot nella colonna Azioni è una funzionalità potente per l'esecuzione attività assistita da IA:

![Tooltip Emoji Robot](releases/agent-copy-instruction-tooltip.png)

**Come funziona:**
1. **Clicca l'emoji 🤖** per copiare un'istruzione di esecuzione attività nei tuoi appunti
2. **Per attività con agenti**: Copia `usa il subagent integrato situato in ./claude/agents/[nome-agente] per completare questa attività shrimp: [task-id] per favore quando inizi a lavorare marca l'attività shrimp come in corso`
3. **Per attività senza agenti**: Copia `Usa il task manager per completare questa attività shrimp: [task-id] per favore quando inizi a lavorare marca l'attività shrimp come in corso`
4. **Feedback Visuale**: L'emoji cambia brevemente in ✓ per confermare l'azione di copia

**Casi d'Uso:**
- **Esecuzione Parallela**: Apri più finestre terminale con diversi agenti IA e incolla istruzioni per l'elaborazione attività concorrente
- **Specializzazione Agenti**: Assegna agenti specializzati (es. `react-components.md`, `database-specialist.md`) alle attività appropriate
- **Consegna Rapida**: Delega rapidamente attività agli agenti IA senza digitare comandi complessi

#### 🤖 Assegnazione Agenti in Blocco IA

La pagina Attività ora include l'assegnazione agenti in blocco alimentata da IA usando GPT-4 di OpenAI:

**Come usare:**
1. **Seleziona Attività**: Usa le checkbox per selezionare più attività che necessitano assegnazione agente
2. **Barra Azioni Bulk**: Appare una barra blu che mostra "🤖 IA Assegna Agenti (X attività selezionate)"
3. **Assegnazione Un-Click**: Clicca il pulsante per far analizzare le attività a GPT-4 e assegnare agenti appropriati
4. **Abbinamento Automatico**: L'IA considera descrizioni attività, dipendenze e capacità agenti

**Requisiti Configurazione:**
1. **Configura Chiave API**: Naviga a Impostazioni → Impostazioni Globali
2. **Inserisci Chiave OpenAI**: Incolla la tua chiave API OpenAI nel campo (mostrato come ✓ Configurato quando impostato)
3. **Metodo Alternativo**: Imposta la variabile ambiente `OPENAI_API_KEY` o `OPEN_AI_KEY_SHRIMP_TASK_VIEWER`
4. **Ottieni Chiave API**: Visita [OpenAI Platform](https://platform.openai.com/api-keys) per generare una chiave

![Chiave OpenAI Impostazioni Globali](releases/global-settings-openai-key.png)
*La pagina Impostazioni Globali fornisce un campo sicuro per configurare la tua chiave API OpenAI*

#### 📝 Vista Dettagli Attività

Clicca su qualsiasi riga di attività per aprire la vista dettagliata con informazioni complete:

**Funzionalità:**
- **Informazioni Complete Attività**: Visualizza descrizioni complete, note, guide implementazione e criteri verifica
- **Navigazione Attività**: Usa i pulsanti ← Precedente e Successivo → per muoverti tra le attività senza tornare alla lista
- **File Correlati**: Vedi tutti i file associati all'attività con numeri di riga
- **Grafico Dipendenze**: Rappresentazione visuale delle dipendenze attività
- **Modalità Modifica**: Clicca Modifica per modificare i dettagli dell'attività (per attività non completate)
- **Azioni Rapide**: Copia ID attività, visualizza JSON grezzo o elimina l'attività

**Benefici Navigazione:**
- **Revisione Efficiente**: Rivedi rapidamente più attività in sequenza
- **Preservazione Contesto**: Rimani nella vista dettagli muovendoti tra le attività
- **Supporto Tastiera**: Usa i tasti freccia per navigazione ancora più veloce

### 📜 Pagina Cronologia Progetto

La pagina Cronologia Progetto fornisce preziose intuizioni sull'evoluzione del tuo progetto mostrando istantanee delle attività completate salvate da Shrimp Task Manager.

![Panoramica Cronologia Progetto](releases/project-history-view.png)

**Funzionalità:**
- **Vista Timeline**: Sfoglia istantanee storiche degli stati attività del tuo progetto
- **File Memoria**: Salvati automaticamente da Shrimp Task Manager all'avvio di nuove sessioni
- **Evoluzione Attività**: Traccia come le attività sono progredite dalla creazione al completamento
- **Sistema Note**: Aggiungi annotazioni personali alle voci storiche

![Dettaglio Cronologia Progetto](releases/project-history-detail-view.png)

**Navigazione:**
- Clicca su qualsiasi voce storica per visualizzare lo stato dettagliato dell'attività in quel momento
- Usa i pulsanti di navigazione per muoverti tra diverse istantanee
- Cerca e filtra attività storiche proprio come nella vista attività principale

### 🤖 Pagina Sub-Agenti

La pagina Sub-Agenti ti permette di gestire agenti IA specializzati che possono essere assegnati alle attività per un'esecuzione ottimale.

![Vista Lista Agenti con Istruzione IA](releases/agent-list-view-with-ai-instruction.png)

**Funzionalità:**
- **Libreria Agenti**: Visualizza tutti gli agenti disponibili dalla tua cartella `.claude/agents`
- **Colonna Istruzioni IA**: Clicca l'emoji robot (🤖) per copiare istantaneamente istruzioni uso agente
  - Esempio: `usa subagent debugger.md situato in ./claude/agents per eseguire:`
  - Non serve digitare manualmente percorsi agenti o ricordare la sintassi
  - Il feedback visuale conferma la copia riuscita negli appunti
- **Editor Agenti**: Editor markdown integrato per creare e modificare agenti
- **Codifica Colori**: Assegna colori agli agenti per organizzazione visuale
- **Assegnazione Agenti**: Assegna facilmente agenti alle attività via dropdown nella tabella attività
- **Popup Visualizzatore Agenti**: Clicca l'icona occhio (👁️) per sfogliare e selezionare agenti

![Editor Agenti](releases/agent-editor-color-selection.png)

**Workflow Assegnazione Agenti:**

![Dropdown Agenti](releases/agent-dropdown-task-table.png)

1. **Seleziona un agente** dal dropdown nella tabella attività
2. **O clicca l'icona occhio (👁️)** per aprire il popup visualizzatore agenti
3. **Sfoglia gli agenti** nel popup per trovare quello giusto per la tua attività
4. **Salvataggio automatico** aggiorna i metadati dell'attività
5. **Usa l'emoji robot** per copiare istruzioni esecuzione specifiche dell'agente

![Popup Visualizzatore Agenti](releases/agent-viewer-popup.png)
*Il popup visualizzatore agenti ti permette di sfogliare tutti gli agenti disponibili e selezionare il migliore per ogni attività*

### 🎨 Pagina Template

Gestisci template di istruzioni IA che guidano come Shrimp Task Manager analizza ed esegue diversi tipi di operazioni.

![Gestione Template](releases/template-management-system.png)

**Capacità:**
- **Editor Template**: Editor markdown completo con evidenziazione sintassi
- **Tipi Template**: Stati Default, Custom e Custom+Append
- **Anteprima Live**: Vedi gli effetti del template prima dell'attivazione
- **Esporta/Importa**: Condividi template con membri del team

### ⚙️ Impostazioni Globali

Configura impostazioni di sistema incluso il percorso cartella Claude per accedere agli agenti globali.

**Le Impostazioni Includono:**
- **Percorso Cartella Claude**: Imposta il percorso alla tua cartella globale `.claude`
- **Configurazione Chiave API**: Gestisci variabili ambiente per servizi IA
- **Preferenze Lingua**: Cambia tra le lingue supportate

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

### 🤖 Funzionalità IA
- **Assegnazione Agenti in Blocco**: Seleziona più attività e usa GPT-4 per assegnare automaticamente gli agenti più appropriati
- **Integrazione OpenAI**: Configura la tua chiave API nelle Impostazioni Globali o via variabili ambiente
- **Abbinamento Intelligente**: L'IA analizza descrizioni attività e capacità agenti per assegnazioni ottimali
- **Guida Errori**: Istruzioni chiare se la chiave API non è configurata

### 📚 Controllo Versione e Cronologia
- **Integrazione Git**: Commit Git automatici tracciano ogni cambiamento a tasks.json con messaggi timestampati
- **Traccia Audit Completa**: Rivedi la cronologia completa delle modifiche attività usando strumenti Git standard
- **Operazioni Non-Bloccanti**: I fallimenti Git non interrompono la gestione attività
- **Repository Isolato**: Cronologia attività tracciata separatamente dal tuo repository progetto

### 🎨 UI/UX Professionale
- **Tema Scuro**: Ottimizzato per ambienti di sviluppo
- **Layout Responsive**: Si adatta a tutte le dimensioni schermo
- **Accessibilità**: Navigazione completa da tastiera e supporto screen reader
- **Elementi Interattivi**: Tooltip hover e feedback visuale in tutta l'app

## 🚀 Avvio Rapido

### Installazione e Configurazione

1. **Clona e naviga alla directory task viewer**
   ```bash
   cd path/to/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Installa dipendenze**
   ```bash
   npm install
   ```

3. **Costruisci l'applicazione React**
   ```bash
   npm run build
   ```

4. **Avvia il server**
   ```bash
   npm start
   ```

   Il visualizzatore sarà disponibile su `http://localhost:9998`

### Modalità Sviluppo

Per sviluppo con hot reload:

```bash
# Avvia sia il server API che il server di sviluppo
npm run start:all

# O eseguili separatamente:
npm start          # Server API sulla porta 9998
npm run dev        # Server dev Vite sulla porta 3000
```

L'app sarà disponibile su `http://localhost:3000` con ricostruzione automatica sui cambiamenti file.

### Deployment Produzione

#### Deployment Standard

```bash
# Costruisci per produzione
npm run build

# Avvia il server produzione
npm start
```

#### Servizio Systemd (Linux)

Per avvio automatico e gestione processo:

1. **Installa come servizio**
   ```bash
   sudo ./install-service.sh
   ```

2. **Gestisci il servizio**
   ```bash
   # Controlla stato
   systemctl status shrimp-task-viewer
   
   # Avvia/ferma/riavvia
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Visualizza log
   journalctl -u shrimp-task-viewer -f
   
   # Disabilita/abilita auto-avvio
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Disinstalla il servizio**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Utilizzo

### Iniziare

1. **Avvia il server**:
   ```bash
   npm start
   ```
   
   **Nota**: Se non hai ancora costruito l'app o vuoi usare la modalità sviluppo con hot reload, usa invece `npm run start:all`.

2. **Apri il tuo browser**:
   Naviga a `http://127.0.0.1:9998` (produzione) o `http://localhost:3000` (sviluppo)

3. **Aggiungi il tuo primo profilo**:
   - Clicca il pulsante "**+ Aggiungi Tab**"
   - Inserisci un nome profilo descrittivo (es. "Attività Team Alpha")
   - Inserisci il percorso alla tua cartella dati shrimp contenente tasks.json
   - **Suggerimento:** Naviga alla tua cartella nel terminale e digita `pwd` per ottenere il percorso completo
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

### Ricerca e Filtraggio

- **Ricerca Globale**: Digita nella casella ricerca per filtrare tutti i campi attività
- **Ordinamento Colonne**: Clicca qualsiasi intestazione colonna per ordinare (clicca di nuovo per invertire)
- **Paginazione**: Naviga liste attività grandi con controlli paginazione integrati
- **Aggiornamenti Real-time**: Ricerca e ordinamento si aggiornano istantaneamente mentre digiti

### Configurazione Auto-Refresh

1. **Abilita Auto-refresh**: Spunta la checkbox "Auto-refresh"
2. **Imposta Intervallo**: Scegli dal dropdown (da 5s a 5m)
3. **Refresh Manuale**: Clicca il pulsante 🔄 in qualsiasi momento per refresh immediato
4. **Feedback Visuale**: Lo spinner mostra durante le operazioni refresh

## 🔧 Configurazione

### Variabili Ambiente

Per rendere le variabili ambiente persistenti tra le sessioni terminale, aggiungile al tuo file configurazione shell:

**Per macOS/Linux con Zsh** (default su macOS moderno):
```bash
# Aggiungi a ~/.zshrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Ricarica configurazione
source ~/.zshrc
```

**Per Linux/Unix con Bash**:
```bash
# Aggiungi a ~/.bashrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Ricarica configurazione
source ~/.bashrc
```

**Perché aggiungere alla configurazione shell?**
- **Persistenza**: Le variabili impostate con `export` nel terminale durano solo per quella sessione
- **Consistenza**: Tutte le nuove finestre terminale avranno queste impostazioni
- **Convenienza**: Non serve impostare variabili ogni volta che avvii il server

**Variabili Disponibili**:
```bash
SHRIMP_VIEWER_PORT=9998           # Porta server (default: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Host server (solo localhost)
OPENAI_API_KEY=sk-...             # Chiave API OpenAI per assegnazione agenti IA
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # Var env alternativa per chiave OpenAI
```

### Configurazione Sviluppo

- **Sviluppo con hot reload (raccomandato per sviluppo)**:
  ```bash
  npm run start:all  # Esegue server API (9998) + server dev Vite (3000)
  ```
  
  **Perché usare start:all?** Questo comando esegue sia il server API che il server dev Vite simultaneamente. Ottieni hot module replacement (HMR) istantaneo per cambiamenti UI mantenendo la funzionalità API completa. I tuoi cambiamenti appaiono immediatamente nel browser su `http://localhost:3000` senza refresh manuale.

- **Solo server API (per produzione o test API)**:
  ```bash
  npm start  # Esegue sulla porta 9998
  ```
  
  **Perché usare solo server API?** Usa questo quando hai costruito i file produzione e vuoi testare l'app completa come girerebbe in produzione, o quando hai bisogno solo degli endpoint API.

- **Costruisci e servi per produzione**:
  ```bash
  npm run build && npm start  # Costruisci poi servi sulla porta 9998
  ```
  
  **Perché costruire per produzione?** La build produzione ottimizza il tuo codice minificando JavaScript, rimuovendo codice morto e raggruppando asset efficientemente. Questo risulta in tempi caricamento più veloci e migliori prestazioni per utenti finali. Usa sempre la build produzione quando fai deployment.

### Storage Dati Profilo

**Comprendere la Gestione Dati Profilo**: Il Task Viewer usa un approccio ibrido allo storage dati che prioritizza sia persistenza che accuratezza real-time. Le configurazioni profilo (come nomi tab, percorsi cartella e ordine tab) sono memorizzate localmente in un file impostazioni JSON nella tua directory home, mentre i dati attività sono letti direttamente dalle cartelle progetto in tempo reale.

- **File Impostazioni**: `~/.shrimp-task-viewer-settings.json`
  
  Questo file nascosto nella tua directory home memorizza tutte le configurazioni profilo inclusi nomi tab, percorsi cartella, ordinamento tab e altre preferenze. È creato automaticamente quando aggiungi il tuo primo profilo e aggiornato ogni volta che fai cambiamenti. Puoi modificare manualmente questo file se necessario, ma fai attenzione a mantenere una formattazione JSON valida.

- **File Attività**: Letti direttamente dai percorsi cartella specificati (nessun upload)
  
  Diversamente dalle applicazioni web tradizionali che caricano e memorizzano copie file, il Task Viewer legge file `tasks.json` direttamente dai percorsi cartella specificati. Questo assicura che vedi sempre lo stato corrente delle tue attività senza bisogno di ri-upload o sincronizzazione. Quando aggiungi un profilo, stai semplicemente dicendo al visualizzatore dove cercare il file tasks.json.

- **Hot Reload**: I cambiamenti sviluppo si ricostruiscono automaticamente
  
  Quando esegui in modalità sviluppo (`npm run dev`), qualsiasi cambiamento al codice sorgente innesca ricostruzioni automatiche e refresh browser. Questo si applica a componenti React, stili e codice server, rendendo lo sviluppo più veloce ed efficiente.

### Cronologia Attività Git

**Controllo Versione Automatico**: A partire dalla v3.0, Shrimp Task Manager traccia automaticamente tutti i cambiamenti attività usando Git. Questo fornisce una traccia audit completa senza configurazione manuale.

- **Posizione Repository**: `<shrimp-data-directory>/.git`
  
  Ogni progetto ottiene il suo repository Git nella directory dati configurata nel tuo file `.mcp.json`. Questo è completamente separato dal repository Git principale del tuo progetto, prevenendo conflitti o interferenze.

- **Visualizzare Cronologia**: Usa comandi Git standard per esplorare la cronologia attività
  ```bash
  cd <shrimp-data-directory>
  git log --oneline          # Visualizza cronologia commit
  git show <commit-hash>     # Vedi cambiamenti specifici
  git diff HEAD~5            # Confronta con 5 commit fa
  ```

- **Formato Commit**: Tutti i commit includono timestamp e messaggi descrittivi
  ```
  [2025-08-07T13:45:23-07:00] Aggiungi nuova attività: Implementa autenticazione utente
  [2025-08-07T14:12:10-07:00] Aggiorna attività: Correggi validazione login
  [2025-08-07T14:45:55-07:00] Operazione attività bulk: modalità append, 6 attività
  ```

- **Recupero**: Ripristina stati attività precedenti se necessario
  ```bash
  cd <shrimp-data-directory>
  git checkout <commit-hash> -- tasks.json  # Ripristina versione specifica
  git reset --hard <commit-hash>            # Reset completo a stato precedente
  ```

## 🏗️ Architettura Tecnica

### Stack Tecnologico

- **Frontend**: React 19 + Vite per sviluppo hot reload
- **Componente Tabella**: TanStack React Table per funzionalità tabella avanzate
- **Styling**: CSS personalizzato con tema scuro e design responsive
- **Backend**: Server HTTP Node.js con API RESTful
- **Sistema Build**: Vite per sviluppo veloce e build produzione ottimizzate

### Struttura File

**Organizzazione Progetto**: Il Task Viewer segue una struttura pulita e modulare che separa le responsabilità e rende la codebase facile da navigare ed estendere. Ogni directory e file ha uno scopo specifico nell'architettura applicazione.

```
task-viewer/
├── src/                       # Codice sorgente applicazione React
│   ├── App.jsx               # Componente React principale - gestisce stato, profili e tab
│   ├── components/           # Componenti React riutilizzabili
│   │   ├── TaskTable.jsx     # Tabella TanStack per visualizzare e ordinare attività
│   │   ├── Help.jsx          # Visualizzatore README con rendering markdown
│   │   └── ReleaseNotes.jsx  # Cronologia versioni con evidenziazione sintassi
│   ├── data/                 # Dati statici e configurazione
│   │   └── releases.js       # Metadati release e informazioni versione
│   └── index.css             # Sistema styling completo con tema scuro
├── releases/                  # File markdown note release e immagini
│   ├── v*.md                 # File note release individuali
│   └── *.png                 # Screenshot e immagini per release
├── dist/                     # Output build produzione (auto-generato)
│   ├── index.html            # Punto ingresso HTML ottimizzato
│   └── assets/               # JS, CSS e altri asset raggruppati
├── server.js                 # Server API Node.js stile Express
├── cli.js                    # Interfaccia comando per gestione servizio
├── vite.config.js            # Configurazione strumento build per sviluppo/produzione
├── package.json              # Metadati progetto, dipendenze e script npm
├── install-service.sh        # Installer servizio systemd Linux
└── README.md                 # Documentazione completa (questo file)
```

**Directory Principali Spiegate**:

- **`src/`**: Contiene tutto il codice sorgente React. Qui farai la maggior parte dei cambiamenti UI.
- **`dist/`**: Build produzione auto-generata. Non modificare mai questi file direttamente.
- **`releases/`**: Memorizza note release in formato markdown con immagini associate.
- **File Root**: File configurazione e server che gestiscono building, serving e deployment.

### Endpoint API

- `GET /` - Serve l'applicazione React
- `GET /api/agents` - Elenca tutti i profili configurati
- `GET /api/tasks/{profileId}` - Ritorna attività per profilo specifico
- `POST /api/add-profile` - Aggiunge nuovo profilo con percorso cartella
- `DELETE /api/remove-profile/{profileId}` - Rimuove profilo
- `PUT /api/rename-profile/{profileId}` - Rinomina profilo
- `PUT /api/update-profile/{profileId}` - Aggiorna impostazioni profilo
- `GET /api/readme` - Ritorna contenuto README per tab aiuto
- `GET /releases/*.md` - Serve file markdown note release
- `GET /releases/*.png` - Serve immagini note release

## 🛠️ Sviluppo

### Configurare Ambiente Sviluppo

```bash
# Installa dipendenze
npm install

# Avvia server sviluppo con hot reload
npm run dev

# Server sviluppo esegue su http://localhost:3000
# Server API backend esegue su http://localhost:9998
```

### Building per Produzione

```bash
# Costruisci bundle produzione ottimizzato
npm run build

# File generati in directory dist/
# Avvia server produzione
npm start
```

### Estendere l'Interfaccia

L'architettura React modulare rende facile l'estensione:

1. **Aggiungi Nuovi Componenti**: Crea in `src/components/`
2. **Modifica Styling**: Modifica `src/index.css` con proprietà personalizzate CSS
3. **Aggiungi Funzionalità**: Estendi `App.jsx` con nuovo stato e funzionalità
4. **Integrazione API**: Aggiungi endpoint in `server.js`

## 🔒 Sicurezza e Prestazioni

### Funzionalità Sicurezza

- **Binding Localhost**: Server accessibile solo da macchina locale
- **Accesso File Diretto**: Legge file attività direttamente da percorsi filesystem
- **Nessuna Dipendenza Esterna**: Auto-contenuto con superficie attacco minimale
- **Protezione CORS**: Endpoint API protetti con header CORS

### Ottimizzazioni Prestazioni

- **Hot Module Replacement**: Aggiornamenti sviluppo istantanei
- **Code Splitting**: Caricamento bundle ottimizzato
- **Re-rendering Efficiente**: Pattern ottimizzazione React
- **Caching**: Caching asset statici per caricamenti più veloci
- **Immagini Responsive**: Ottimizzate per tutte le dimensioni dispositivo

## 🐛 Risoluzione Problemi

### Problemi Comuni

**Il Server Non Si Avvia**
```bash
# Controlla se la porta è in uso
lsof -i :9998

# Termina processi esistenti
pkill -f "node.*server.js"

# Prova porta diversa
SHRIMP_VIEWER_PORT=8080 node server.js
```

**Tab Aiuto/Readme Mostra HTML**
Se il tab Aiuto visualizza HTML invece del contenuto README, il server deve essere riavviato per caricare i nuovi endpoint API:
```bash
# Ferma il server (Ctrl+C) e riavvia
npm start
```

**Hot Reload Non Funziona**
```bash
# Assicurati che le dipendenze sviluppo siano installate
npm install

# Riavvia server sviluppo
npm run dev
```

**Attività Non Si Caricano**
1. Controlla che i file `tasks.json` contengano JSON valido
2. Verifica che i permessi file siano leggibili
3. Controlla console browser per messaggi errore
4. Usa pulsante refresh manuale per ricaricare dati

**Errori Build**
```bash
# Pulisci node_modules e reinstalla
rm -rf node_modules package-lock.json
npm install

# Pulisci cache Vite
rm -rf dist/
npm run build
```

## 📋 Changelog

### Versione 2.1.0 (Ultima) - 2025-07-29

#### 🚀 Funzionalità Principali
- **Supporto Percorso File Diretto**: Sostituito upload file con input percorso cartella diretto per aggiornamenti live
- **Tab Aiuto/Readme**: Aggiunto tab documentazione con rendering markdown
- **Tab Note Release**: Visualizzatore note release in-app con supporto immagini  
- **Dipendenze Cliccabili**: Naviga tra attività dipendenti facilmente
- **Colonna Azioni IA**: Copia istruzioni IA per completamento attività
- **Gestione UUID Migliorata**: Clicca badge attività per copiare UUID
- **Modifica Profili**: Rinomina profili e configura radici progetto
- **Supporto Moduli ES**: Convertito a moduli ES per migliore compatibilità

#### 🐛 Correzione Critica
- **Risolto Problema Copia File Statici**: I file ora sono letti direttamente da percorsi specificati invece di creare copie statiche in `/tmp/`

## 📄 Licenza

Licenza MIT - vedi la licenza progetto principale per dettagli.

## 🤝 Contribuire

Questo strumento è parte del progetto MCP Shrimp Task Manager. I contributi sono benvenuti!

1. Fai fork del repository
2. Crea un branch feature (`git checkout -b feature/amazing-feature`)
3. Fai i tuoi cambiamenti con test appropriati
4. Committa i tuoi cambiamenti (`git commit -m 'Add amazing feature'`)
5. Push al branch (`git push origin feature/amazing-feature`)
6. Invia una pull request

### Linee Guida Sviluppo

- Segui le best practice React e i pattern hooks
- Mantieni i principi design responsive
- Aggiungi tipi TypeScript appropriati dove applicabile
- Testa su diversi browser e dispositivi
- Aggiorna documentazione per nuove funzionalità

---

**Felice gestione attività! 🦐✨**

Costruito con ❤️ usando React, Vite e tecnologie web moderne.