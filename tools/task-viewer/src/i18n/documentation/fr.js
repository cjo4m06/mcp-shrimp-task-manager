export const frDocumentation = {
  releaseNotes: {
    header: '📋 Notes de Version',
    versions: 'Versions',
    loading: 'Chargement des notes de version...',
    notFound: 'Notes de version non trouvées.',
    error: 'Erreur lors du chargement des notes de version.',
    copy: 'Copier',
    copied: 'Copié !'
  },
  help: {
    header: 'ℹ️ Aide et Documentation',
    loading: 'Chargement de la documentation...',
    notFound: 'README non trouvé.',
    error: 'Erreur lors du chargement du README.',
    copy: 'Copier',
    copied: 'Copié !'
  },
  releases: {
    'v3.0.0': {
      title: '🚀 Notes de Version v3.0.0 du Visualiseur de Tâches',
      date: 'Publié : 7 août 2025',
      content: `# 🚀 Notes de Version v3.0.0 du Visualiseur de Tâches

*Publié : 7 août 2025*

## 🎉 Nouvelles Fonctionnalités Principales

### 🤖 Système de Gestion des Agents
**Gestion complète des sous-agents pour la gestion spécialisée des tâches**

Le SHRIMP-TASK-MANAGER prend désormais en charge de puissantes capacités de gestion des agents, vous permettant de définir et d'utiliser des agents IA spécialisés pour différents types de tâches.

### 🤖 Attribution d'Agents en Lot Alimentée par IA
**Assignez automatiquement les agents les plus appropriés à plusieurs tâches en utilisant OpenAI GPT-4**

### 📊 Contrôle de Version Git pour l'Historique des Tâches
**Les commits Git automatiques suivent chaque changement de vos tâches**

### 📊 Vue de l'Historique du Projet
**Suivez et analysez l'historique d'exécution des tâches de votre projet**

### 🎨 Système de Gestion des Modèles
**Personnalisation puissante des modèles pour l'exécution de tâches IA**

### 🌍 Support d'Internationalisation (i18n)
**Support multi-langues avec changement de langue transparent**

- **Trois Langues Supportées** : Anglais (en), Chinois (中文), et Espagnol (Español)
- **Sélection de Langue Persistante** : Votre préférence de langue est sauvegardée et mémorisée
- **Traduction Complète de l'Interface** : Tous les éléments UI, boutons, étiquettes, et messages sont entièrement traduits
- **Changement de Langue Dynamique** : Changez de langues à la volée sans rechargement de page

### 🧭 Navigation et Interface Améliorées
**Améliorations d'interface moderne et intuitive**

- **Système d'Onglets Imbriqués** : Navigation organisée avec onglets primaires et secondaires
- **Synchronisation d'État URL** : L'URL du navigateur se met à jour pour refléter la vue actuelle
- **Navigation des Détails de Tâches** : Les boutons Précédent/Suivant permettent la révision séquentielle des tâches

## 🔄 Améliorations Significatives

### Navigation des Détails de Tâches
**Flux de travail de révision de tâches transparent**

La vue Détails de Tâches inclut maintenant des boutons de navigation Précédent/Suivant qui transforment la façon dont vous révisez et travaillez sur les tâches.

### Améliorations de Performance
- **Rendus Optimisés** : Hooks React correctement mémorisés pour de meilleures performances
- **Chargement Paresseux** : Les composants se chargent sur demande pour un chargement de page initial plus rapide

### Expérience Développeur
- **Suite de Tests Complète** : Ajout de tests d'intégration et de fonctionnalités de langue
- **Meilleur Gestion des Erreurs** : Messages d'erreur plus informatifs

## 🐛 Corrections de Bogues

### Corrections Critiques
- **Erreur Hook useRef** : Correction de l'import de hook React manquant causant des plantages d'application
- **Clés de Traduction** : Ajout des clés de traduction manquantes pour toutes les langues supportées
- **Boucle de Lien Symbolique** : Résolution du problème de boucle infinie du répertoire Screenshots

## 🏗️ Mises à Jour Techniques

### Nouvelles Dépendances
- \`@headlessui/react\` : Composants UI modernes
- \`@tanstack/react-table\` : Fonctionnalité de tableau avancée
- \`@uiw/react-md-editor\` : Édition Markdown pour les modèles

### Améliorations API
- **GET /api/templates** : Lister tous les modèles disponibles
- **PUT /api/templates/:name** : Mettre à jour le contenu du modèle
- **POST /api/templates/:name/duplicate** : Dupliquer les modèles

## 📝 Changements de Rupture

### Mises à Jour de Configuration
- **Paramètres de Langue** : Nouveau format de stockage de préférence de langue
- **Stockage de Modèles** : Les modèles sont maintenant stockés dans le répertoire home utilisateur

### Changements API
- **Points de Terminaison de Profils** : Formats de réponse mis à jour incluent plus de métadonnées
- **Points de Terminaison de Tâches** : Améliorés avec des options de filtrage supplémentaires

## 🚀 Guide de Migration

### De v2.1 vers v3.0
1. **Sélection de Langue** : Votre langue par défaut sera l'anglais ; sélectionnez la langue préférée depuis le nouveau sélecteur
2. **Modèles** : Les modèles personnalisés existants seront préservés mais pourraient nécessiter une réactivation
3. **Cache Navigateur** : Videz le cache du navigateur pour des performances optimales

## 🎯 Résumé

La version 3.0 représente un bond majeur en avant pour le Visualiseur de Tâches, le transformant d'un simple outil de visualisation de tâches en une plateforme complète de gestion et personnalisation des tâches. Avec le support complet d'internationalisation, la gestion puissante des modèles, l'automation alimentée par IA, et les capacités de suivi historique basées sur Git, cette version fournit aux équipes un contrôle sans précédent sur leurs flux de travail de développement assisté par IA.`
    },
    'v2.1.0': {
      title: '🚀 Notes de Version v2.1.0 du Visualiseur de Tâches',
      date: 'Publié : 29 juillet 2025',
      content: `# 🚀 Notes de Version v2.1.0 du Visualiseur de Tâches

*Publié : 29 juillet 2025*

## 🎉 Nouvelles Fonctionnalités

### 🔗 Chemins de Fichiers Clicables avec Support de Racine de Projet
**Copiez des chemins de fichiers complets en un clic !**

- **Chemins de Fichiers Clic pour Copier** : Maintenant, lorsque vous cliquez sur une tâche et allez à la page Détails de Tâche, si des fichiers liés sont listés que la tâche modifie ou crée, ce nom de fichier aura maintenant un hyperlien vers le fichier réel dans votre système de fichiers

### 📋 Gestion UUID Améliorée
**Copie UUID simplifiée avec interactions intuitives**

Lors de l'interaction avec Claude, il est parfois utile de référencer facilement une tâche shrimp, par exemple :
"Claude, veuillez compléter cette tâche shrimp : da987923-2afe-4ac3-985e-ac029cc831e7". Par conséquent, nous avons ajouté une fonction Clic pour copier sur les badges Tâche # et sur l'UUID listé dans la colonne Nom de Tâche.

### 🔄 Colonne Dépendances de Tâches pour Parallélisation Facile

Nous avons ajouté une colonne Dépendances qui liste les UUID liés de toute tâche dépendante. Maintenant vous pouvez facilement naviguer vers les tâches dépendantes.

### 🤖 Actions Instructions IA
**Instructions de tâches IA en un clic**

Nous avons ajouté une Colonne Actions qui a un emoji Robot utile. Si vous cliquez sur l'emoji, il copiera une Instruction IA dans le presse-papiers que vous pouvez ensuite coller dans le chat de votre agent.

## 🔄 Changements

### Améliorations UI/UX
- **Actions de Copie Simplifiées** : Copie UUID consolidée seulement au clic du badge de tâche
- **Dépendances sur Notes** : Remplacé la colonne Notes par la colonne Dépendances plus utile
- **Notes de Version dans l'App** : Les notes de version pour le visualiseur de tâches s'affichent dans la bannière supérieure

### Mises à Jour d'Architecture
- **Compatibilité Modules ES** : Suppression de la dépendance busboy pour meilleur support modules ES
- **Analyse de Formulaires Native** : Remplacement de l'analyse de formulaires tiers par des fonctions Node.js intégrées

## 🐛 Corrections de Bogues

### 🚨 CORRECTION CRITIQUE : Chargement de Fichiers Crée des Copies Statiques
**Le Problème** : Lors de l'ajout de profils en chargeant un fichier tasks.json, le système créait une copie statique dans le répertoire \`/tmp/\`. Cela signifiait que tout changement dans votre fichier de tâches réel NE se refléterait PAS dans le visualiseur.

**La Solution** : Suppression complète du chargement de fichiers. Maintenant vous devez entrer le chemin du dossier directement, et le système ajoute automatiquement \`/tasks.json\`.

### Gestion de Profils
- **Auto-Sélection Corrigée** : Les nouveaux profils sont maintenant sélectionnés et chargés automatiquement après création
- **Problèmes d'Import Résolus** : Correction des problèmes d'import de modules ES avec la bibliothèque busboy

## 🎯 Résumé

La version 2.1.0 transforme le Visualiseur de Tâches en un outil de développement plus intégré avec gestion améliorée des chemins de fichiers, manipulation améliorée des UUID et meilleure visualisation des relations de tâches.`
    },
    'v2.0.0': {
      title: 'Notes de Version v2.0.0 du Visualiseur de Tâches',
      date: 'Publié : 27 juillet 2025',
      content: `# Notes de Version v2.0.0 du Visualiseur de Tâches

*Publié : 27 juillet 2025*

## 🚀 Version Indépendante Initiale

### Fonctionnalités Principales
- **Visualiseur de Tâches Basé Web** : Interface moderne avec gestion de profils
- **Mises à Jour Temps Réel** : Auto-actualisation du statut des tâches
- **Interface Moderne** : Thème sombre avec design responsif
- **Gestion de Profils** : Support pour suivi de tâches multi-projets

### Stack Technologique
- React 19 + Vite
- TanStack Table
- Backend Node.js
- Développement avec rechargement à chaud

## 🎉 Nouvelles Fonctionnalités
- Réorganisation des onglets par glisser-déposer
- Recherche et filtrage avancés
- Intervalles d'auto-actualisation configurables
- Panneau statistiques de tâches

## 🔧 Installation
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

Le visualiseur sera disponible à http://localhost:9998`
    }
  },
  readme: {
    title: '🦐 Visualiseur du Gestionnaire de Tâches Shrimp',
    content: `# 🦐 Visualiseur du Gestionnaire de Tâches Shrimp

Une interface web moderne basée sur React pour visualiser et gérer les tâches du [Gestionnaire de Tâches Shrimp](https://github.com/cjo4m06/mcp-shrimp-task-manager) créées via l'outil MCP (Model Context Protocol). Cette interface visuelle vous permet de voir des informations détaillées sur les tâches, suivre les progrès sur plusieurs projets et copier facilement les UUID des tâches pour les interactions avec les agents IA.

## Pourquoi utiliser le Visualiseur de Tâches Shrimp ?

Lors de l'utilisation du Gestionnaire de Tâches Shrimp comme serveur MCP avec des agents IA comme Claude, ce visualiseur fournit une visibilité essentielle dans votre écosystème de tâches :

- **Vue d'ensemble visuelle des tâches** : Voyez toutes les tâches, leur statut, dépendances et progrès dans une interface à onglets propre
- **Gestion des UUID** : Cliquez sur n'importe quel badge de tâche pour copier instantanément son UUID pour des commandes comme \`"Use task manager to complete this shrimp task: [UUID]"\`
- **Exécution parallèle** : Ouvrez plusieurs terminaux et utilisez la colonne Actions IA (🤖) pour copier les instructions de tâches pour l'exécution parallèle d'agents IA
- **Mises à jour en temps réel** : La lecture directe des chemins de fichiers garantit que vous voyez toujours l'état actuel des tâches
- **Support multi-projets** : Gérez les tâches sur différents projets avec des onglets de profils déplaçables

Pour les informations sur la configuration du Gestionnaire de Tâches Shrimp comme serveur MCP, consultez le [dépôt principal](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 🌟 Fonctionnalités

### 🏷️ Interface à Onglets Moderne
- **Onglets déplaçables** : Réorganisez les profils en déplaçant les onglets
- **Design professionnel** : Onglets style navigateur qui se connectent parfaitement au contenu
- **Retour visuel** : Indication claire d'onglet actif et effets de survol
- **Ajouter nouveaux profils** : Bouton intégré "+ Ajouter Onglet" correspondant au design de l'interface

### 🔍 Recherche et Filtrage Avancés
- **Recherche en temps réel** : Filtrage instantané des tâches par nom, description, statut ou ID
- **Colonnes triables** : Cliquez sur les en-têtes de colonnes pour trier par n'importe quel champ
- **TanStack Table** : Composant de tableau puissant avec pagination et filtrage
- **Design responsif** : Fonctionne parfaitement sur bureau, tablette et mobile

### 🔄 Auto-Actualisation Intelligente
- **Intervalles configurables** : Choisissez parmi 5s, 10s, 15s, 30s, 1m, 2m ou 5m
- **Contrôles intelligents** : Basculement d'auto-actualisation avec sélection d'intervalle
- **Indicateurs visuels** : États de chargement et statut d'actualisation
- **Actualisation manuelle** : Bouton d'actualisation dédié pour les mises à jour à la demande

### 📊 Gestion Complète des Tâches
- **Statistiques de tâches** : Comptes en direct pour Total, Terminées, En cours et En attente
- **Gestion de profils** : Ajouter/supprimer/réorganiser les profils via une interface intuitive
- **Paramètres persistants** : Configurations de profils sauvegardées entre les sessions
- **Rechargement à chaud** : Mode développement avec mises à jour instantanées

### 🤖 Fonctionnalités Alimentées par IA
- **Attribution d'agents en lot** : Sélectionnez plusieurs tâches et utilisez GPT-4 pour attribuer automatiquement les agents les plus appropriés
- **Intégration OpenAI** : Configurez votre clé API dans Paramètres Globaux ou via des variables d'environnement
- **Correspondance intelligente** : L'IA analyse les descriptions des tâches et capacités des agents pour des attributions optimales

### 🎨 UI/UX Professionnel
- **Thème sombre** : Optimisé pour les environnements de développement
- **Layout responsif** : S'adapte à toutes les tailles d'écran
- **Accessibilité** : Navigation clavier complète et support lecteur d'écran
- **Éléments interactifs** : Infobulles de survol et retour visuel dans toute l'application

## 🚀 Démarrage Rapide

### Installation et Configuration

1. **Cloner et naviguer vers le répertoire du visualiseur de tâches**
   \`\`\`bash
   cd chemin/vers/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Installer les dépendances**
   \`\`\`bash
   npm install
   \`\`\`

3. **Construire l'application React**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Démarrer le serveur**
   \`\`\`bash
   npm start
   \`\`\`

   Le visualiseur sera disponible à \`http://localhost:9998\`

### Mode Développement

Pour le développement avec rechargement à chaud :

\`\`\`bash
# Démarrer le serveur de développement
npm run dev
\`\`\`

L'application sera disponible à \`http://localhost:3000\` avec reconstruction automatique lors des changements de fichiers.

## 🖥️ Utilisation

### Commencer

1. **Démarrer le serveur** :
   \`\`\`bash
   npm start
   \`\`\`

2. **Ouvrir votre navigateur** :
   Naviguez vers \`http://127.0.0.1:9998\`

3. **Ajouter votre premier profil** :
   - Cliquez sur le bouton "**+ Ajouter Onglet**"
   - Entrez un nom de profil descriptif (ex., "Tâches Équipe Alpha")
   - Entrez le chemin vers votre dossier de données shrimp contenant tasks.json
   - **Astuce :** Naviguez vers votre dossier dans le terminal et tapez \`pwd\` pour obtenir le chemin complet
   - Cliquez sur "**Ajouter Profil**"

4. **Gérer vos tâches** :
   - Changez entre profils en utilisant les onglets
   - Recherchez des tâches en utilisant la boîte de recherche
   - Triez les colonnes en cliquant sur les en-têtes
   - Configurez l'auto-actualisation selon les besoins

### Gestion des Onglets

- **Changer de profils** : Cliquez sur n'importe quel onglet pour passer à ce profil
- **Réorganiser les onglets** : Glissez les onglets pour les réorganiser dans votre ordre préféré
- **Ajouter un nouveau profil** : Cliquez sur le bouton "**+ Ajouter Onglet**"
- **Supprimer un profil** : Cliquez sur le × sur n'importe quel onglet (avec confirmation)

## 📄 Licence

Licence MIT - voir la licence du projet principal pour les détails.

## 🤝 Contribuer

Cet outil fait partie du projet MCP Gestionnaire de Tâches Shrimp. Les contributions sont bienvenues !

---

**Bonne gestion de tâches ! 🦐✨**

Construit avec ❤️ utilisant React, Vite et technologies web modernes.`
  }
};