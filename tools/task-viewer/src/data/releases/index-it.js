// Metadati delle versioni solamente - il contenuto effettivo viene caricato dai file /releases/*.md
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Sistema di Archiviazione Riassunti Completamento Task',
    summary: 'Dettagli di completamento task migliorati con modello dati strutturato e capacità intelligenti di analisi riassunti'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Note di Rilascio Migliorate e Sistema di Archiviazione',
    summary: 'Tracciamento del contesto con Visualizzazione Richiesta Iniziale, riassunti potenziati da IA, Note di Rilascio migliorate con TOC e gestione Archivio completa'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'Visualizzazione Richiesta Iniziale',
    summary: 'Cattura e visualizza la richiesta utente originale che ha avviato la pianificazione dei task, fornendo contesto essenziale per le liste di task'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Internazionalizzazione, Cronologia Task, Sub-agenti, Lightbox',
    summary: 'Supporto multi-lingua, personalizzazione template, cronologia progetto, gestione agenti, lightbox immagini e importanti miglioramenti UI'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Gestione Task Migliorata e Integrazione VS Code',
    summary: 'Link file VS Code, gestione UUID migliorata, colonna dipendenze e note di rilascio in-app'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Rilascio Standalone Iniziale',
    summary: 'Visualizzatore task basato su web con gestione profili, aggiornamenti in tempo reale e UI moderna'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};