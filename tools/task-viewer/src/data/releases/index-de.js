// Release-Metadaten nur - tatsächlicher Inhalt wird aus /releases/*.md Dateien geladen
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Task-Abschluss-Zusammenfassungs-Speichersystem',
    summary: 'Erweiterte Task-Abschlussdetails mit strukturiertem Datenmodell und intelligenten Zusammenfassungs-Parsing-Funktionen'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Erweiterte Release Notes & Archiv-System',
    summary: 'Kontext-Verfolgung mit Anzeige der ursprünglichen Anfrage, KI-gestützte Zusammenfassungen, erweiterte Release Notes mit Inhaltsverzeichnis und umfassendes Archiv-Management'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'Anzeige der ursprünglichen Anfrage',
    summary: 'Erfasst und zeigt die ursprüngliche Benutzeranfrage an, die die Task-Planung initiiert hat, und bietet wesentlichen Kontext für Task-Listen'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Internationalisierung, Task-Historie, Sub-Agenten, Lightbox',
    summary: 'Mehrsprachige Unterstützung, Template-Anpassung, Projekt-Historie, Agenten-Verwaltung, Bild-Lightbox und größere UI-Verbesserungen'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Erweiterte Task-Verwaltung & VS Code Integration',
    summary: 'VS Code Datei-Links, verbesserte UUID-Verwaltung, Abhängigkeiten-Spalte und integrierte Release Notes'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Erste eigenständige Veröffentlichung',
    summary: 'Webbasierter Task-Viewer mit Profil-Verwaltung, Echtzeit-Updates und moderner Benutzeroberfläche'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};