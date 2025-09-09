// Métadonnées des versions uniquement - le contenu réel est chargé depuis les fichiers /releases/*.md
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Système de Stockage des Résumés d\'Achèvement de Tâches',
    summary: 'Détails d\'achèvement de tâches améliorés avec modèle de données structuré et capacités d\'analyse intelligente des résumés'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Notes de Version Améliorées & Système d\'Archives',
    summary: 'Suivi de contexte avec affichage de la demande initiale, résumés alimentés par IA, notes de version améliorées avec table des matières, et gestion d\'archives complète'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'Affichage de la Demande Initiale',
    summary: 'Capture et affiche la demande utilisateur originale qui a initié la planification des tâches, fournissant un contexte essentiel pour les listes de tâches'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Internationalisation, Historique des Tâches, Sous-agents, Lightbox',
    summary: 'Support multi-langues, personnalisation de modèles, historique de projet, gestion d\'agents, lightbox d\'images, et améliorations majeures de l\'interface utilisateur'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Gestion de Tâches Améliorée & Intégration VS Code',
    summary: 'Liens de fichiers VS Code, gestion UUID améliorée, colonne des dépendances, et notes de version intégrées'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Version Autonome Initiale',
    summary: 'Visualiseur de tâches basé sur le web avec gestion de profils, mises à jour en temps réel, et interface utilisateur moderne'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};