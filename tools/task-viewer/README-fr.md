# 🦐 Visualiseur du Gestionnaire de Tâches Shrimp

Une interface web moderne basée sur React pour visualiser et gérer les tâches du [Gestionnaire de Tâches Shrimp](https://github.com/cjo4m06/mcp-shrimp-task-manager) créées via l'outil MCP (Model Context Protocol). Cette interface visuelle vous permet de voir des informations détaillées sur les tâches, suivre les progrès sur plusieurs projets et copier facilement les UUID des tâches pour les interactions avec les agents IA.

## Pourquoi utiliser le Visualiseur de Tâches Shrimp ?

Lors de l'utilisation du Gestionnaire de Tâches Shrimp comme serveur MCP avec des agents IA comme Claude, ce visualiseur fournit une visibilité essentielle dans votre écosystème de tâches :

- **Vue d'ensemble visuelle des tâches** : Voyez toutes les tâches, leur statut, dépendances et progrès dans une interface à onglets propre
- **Gestion des UUID** : Cliquez sur n'importe quel badge de tâche pour copier instantanément son UUID pour des commandes comme `"Use task manager to complete this shrimp task: [UUID]"`
- **Exécution parallèle** : Ouvrez plusieurs terminaux et utilisez la colonne Actions IA (🤖) pour copier les instructions de tâches pour l'exécution parallèle d'agents IA
- **Mises à jour en temps réel** : La lecture directe des chemins de fichiers garantit que vous voyez toujours l'état actuel des tâches
- **Support multi-projets** : Gérez les tâches sur différents projets avec des onglets de profils déplaçables

Pour les informations sur la configuration du Gestionnaire de Tâches Shrimp comme serveur MCP, consultez le [dépôt principal](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 📖 Documentation Détaillée des Pages

### 📋 Page des Tâches

La page principale des Tâches est votre centre de commande pour la gestion des tâches. Elle fournit une vue complète de toutes les tâches dans le profil sélectionné avec des fonctionnalités puissantes pour l'organisation et l'exécution.

![Vue d'ensemble de la Page des Tâches](task-viewer-interface.png)

**Fonctionnalités clés :**
- **Tableau des tâches** : Affiche toutes les tâches avec des colonnes triables incluant N° Tâche, Statut, Agent, Date de création, Nom, Dépendances et Actions
- **Badges de statut** : Badges codés par couleur (🟡 En attente, 🔵 En cours, 🟢 Terminé, 🔴 Bloqué)
- **Attribution d'agents** : Sélecteur déroulant pour attribuer des agents IA spécifiques aux tâches
- **Popup Visualiseur d'agents** : Cliquez sur l'icône œil (👁️) pour ouvrir une popup où vous pouvez parcourir et sélectionner les agents
- **Colonne Dépendances** : Montre les ID de tâches liées avec fonctionnalité de clic pour naviguer
- **Colonne Actions** : Contient le puissant emoji robot (🤖) pour l'exécution de tâches IA
- **Navigation des détails de tâches** : Lors de la visualisation des détails de tâches, utilisez les boutons ← Précédent et Suivant → pour naviguer rapidement entre les tâches

#### 🤖 Emoji Robot - Exécution de Tâches IA

L'emoji robot dans la colonne Actions est une fonctionnalité puissante pour l'exécution de tâches assistée par IA :

![Infobulle Emoji Robot](releases/agent-copy-instruction-tooltip.png)

**Comment cela fonctionne :**
1. **Cliquez sur l'emoji 🤖** pour copier une instruction d'exécution de tâche dans votre presse-papiers
2. **Pour les tâches avec agents** : Copie `use the built in subagent located in ./claude/agents/[agent-name] to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
3. **Pour les tâches sans agents** : Copie `Use task manager to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
4. **Retour visuel** : L'emoji change brièvement en ✓ pour confirmer l'action de copie

**Cas d'utilisation :**
- **Exécution parallèle** : Ouvrez plusieurs fenêtres de terminal avec différents agents IA et collez les instructions pour un traitement concurrent des tâches
- **Spécialisation d'agents** : Attribuez des agents spécialisés (ex., `react-components.md`, `database-specialist.md`) aux tâches appropriées
- **Transfert rapide** : Déléguez rapidement les tâches aux agents IA sans taper des commandes complexes

#### 🤖 Attribution d'Agents en Lot Alimentée par IA

La page des Tâches inclut maintenant l'attribution d'agents en lot alimentée par IA utilisant GPT-4 d'OpenAI :

**Comment utiliser :**
1. **Sélectionner les tâches** : Utilisez les cases à cocher pour sélectionner plusieurs tâches nécessitant une attribution d'agents
2. **Barre d'actions en lot** : Une barre bleue apparaît affichant "🤖 AI Assign Agents (X tâches sélectionnées)"
3. **Attribution en un clic** : Cliquez sur le bouton pour que GPT-4 analyse les tâches et attribue les agents appropriés
4. **Correspondance automatique** : L'IA considère les descriptions des tâches, dépendances et capacités des agents

**Exigences de configuration :**
1. **Configurer la clé API** : Naviguez vers Paramètres → Paramètres globaux
2. **Entrer la clé OpenAI** : Collez votre clé API OpenAI dans le champ (affiché comme ✓ Configuré quand défini)
3. **Méthode alternative** : Définissez la variable d'environnement `OPENAI_API_KEY` ou `OPEN_AI_KEY_SHRIMP_TASK_VIEWER`
4. **Obtenir une clé API** : Visitez [OpenAI Platform](https://platform.openai.com/api-keys) pour générer une clé

![Clé OpenAI Paramètres Globaux](releases/global-settings-openai-key.png)
*La page Paramètres Globaux fournit un champ sécurisé pour configurer votre clé API OpenAI*

#### 📝 Vue Détails des Tâches

Cliquez sur n'importe quelle ligne de tâche pour ouvrir la vue détaillée avec des informations complètes :

**Fonctionnalités :**
- **Informations complètes de la tâche** : Visualisez les descriptions complètes, notes, guides d'implémentation et critères de vérification
- **Navigation des tâches** : Utilisez les boutons ← Précédent et Suivant → pour naviguer entre les tâches sans retourner à la liste
- **Fichiers associés** : Voyez tous les fichiers associés à la tâche avec numéros de ligne
- **Graphe des dépendances** : Représentation visuelle des dépendances des tâches
- **Mode édition** : Cliquez sur Modifier pour modifier les détails de la tâche (pour les tâches non terminées)
- **Actions rapides** : Copiez l'ID de la tâche, visualisez le JSON brut ou supprimez la tâche

**Avantages de la navigation :**
- **Révision efficace** : Révisez rapidement plusieurs tâches en séquence
- **Préservation du contexte** : Restez en vue détail en naviguant entre les tâches
- **Support clavier** : Utilisez les touches fléchées pour une navigation encore plus rapide

### 📜 Page Historique du Projet

La page Historique du Projet fournit des informations précieuses sur l'évolution de votre projet en affichant des instantanés des tâches terminées sauvegardées par le Gestionnaire de Tâches Shrimp.

![Vue d'ensemble Historique du Projet](releases/project-history-view.png)

**Fonctionnalités :**
- **Vue chronologique** : Parcourez les instantanés historiques des états de tâches de votre projet
- **Fichiers mémoire** : Automatiquement sauvegardés par le Gestionnaire de Tâches Shrimp lors du démarrage de nouvelles sessions
- **Évolution des tâches** : Suivez comment les tâches ont progressé de la création à l'achèvement
- **Système de notes** : Ajoutez des annotations personnelles aux entrées historiques

![Détail Historique du Projet](releases/project-history-detail-view.png)

**Navigation :**
- Cliquez sur n'importe quelle entrée historique pour voir l'état détaillé des tâches à ce moment-là
- Utilisez les boutons de navigation pour naviguer entre différents instantanés
- Recherchez et filtrez les tâches historiques comme dans la vue principale des tâches

### 🤖 Page Sous-Agents

La page Sous-Agents vous permet de gérer les agents IA spécialisés qui peuvent être attribués aux tâches pour une exécution optimale.

![Vue Liste d'Agents avec Instruction IA](releases/agent-list-view-with-ai-instruction.png)

**Fonctionnalités :**
- **Bibliothèque d'agents** : Visualisez tous les agents disponibles de votre dossier `.claude/agents`
- **Colonne Instructions IA** : Cliquez sur l'emoji robot (🤖) pour copier instantanément les instructions d'utilisation des agents
  - Exemple : `use subagent debugger.md located in ./claude/agents to perform:`
  - Pas besoin de taper manuellement les chemins d'agents ou de mémoriser la syntaxe
  - Retour visuel confirme la copie réussie dans le presse-papiers
- **Éditeur d'agents** : Éditeur markdown intégré pour créer et modifier les agents
- **Codage couleur** : Attribuez des couleurs aux agents pour l'organisation visuelle
- **Attribution d'agents** : Attribuez facilement des agents aux tâches via le menu déroulant dans le tableau des tâches
- **Popup Visualiseur d'agents** : Cliquez sur l'icône œil (👁️) pour parcourir et sélectionner les agents

![Éditeur d'Agents](releases/agent-editor-color-selection.png)

**Flux de travail d'attribution d'agents :**

![Menu Déroulant d'Agents](releases/agent-dropdown-task-table.png)

1. **Sélectionnez un agent** dans le menu déroulant du tableau des tâches
2. **Ou cliquez sur l'icône œil (👁️)** pour ouvrir la popup visualiseur d'agents
3. **Parcourez les agents** dans la popup pour trouver le bon pour votre tâche
4. **Sauvegarde automatique** met à jour les métadonnées de la tâche
5. **Utilisez l'emoji robot** pour copier les instructions d'exécution spécifiques à l'agent

![Popup Visualiseur d'Agents](releases/agent-viewer-popup.png)
*La popup visualiseur d'agents vous permet de parcourir tous les agents disponibles et sélectionner le meilleur pour chaque tâche*

### 🎨 Page Templates

Gérez les templates d'instructions IA qui guident comment le Gestionnaire de Tâches Shrimp analyse et exécute différents types d'opérations.

![Gestion des Templates](releases/template-management-system.png)

**Capacités :**
- **Éditeur de templates** : Éditeur markdown complet avec coloration syntaxique
- **Types de templates** : États Par défaut, Personnalisé et Personnalisé+Ajouter
- **Aperçu en direct** : Voyez les effets des templates avant activation
- **Export/Import** : Partagez les templates avec les membres de l'équipe

### ⚙️ Paramètres Globaux

Configurez les paramètres système incluant le chemin du dossier Claude pour accéder aux agents globaux.

**Les paramètres incluent :**
- **Chemin du dossier Claude** : Définissez le chemin vers votre dossier `.claude` global
- **Configuration de clé API** : Gérez les variables d'environnement pour les services IA
- **Préférences de langue** : Changez entre les langues supportées

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
- **Conseils d'erreur** : Instructions claires si la clé API n'est pas configurée

### 📚 Contrôle de Version et Historique
- **Intégration Git** : Les commits Git automatiques suivent chaque changement dans tasks.json avec messages horodatés
- **Piste d'audit complète** : Révisez l'historique complet des modifications de tâches en utilisant les outils Git standard
- **Opérations non-bloquantes** : Les échecs Git n'interrompent pas la gestion des tâches
- **Dépôt isolé** : Historique des tâches suivi séparément de votre dépôt de projet

### 🎨 UI/UX Professionnel
- **Thème sombre** : Optimisé pour les environnements de développement
- **Layout responsif** : S'adapte à toutes les tailles d'écran
- **Accessibilité** : Navigation clavier complète et support lecteur d'écran
- **Éléments interactifs** : Infobulles de survol et retour visuel dans toute l'application

## 🚀 Démarrage Rapide

### Installation et Configuration

1. **Cloner et naviguer vers le répertoire du visualiseur de tâches**
   ```bash
   cd chemin/vers/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Construire l'application React**
   ```bash
   npm run build
   ```

4. **Démarrer le serveur**
   ```bash
   npm start
   ```

   Le visualiseur sera disponible à `http://localhost:9998`

### Mode Développement

Pour le développement avec rechargement à chaud :

```bash
# Démarrer le serveur API et le serveur de développement
npm run start:all

# Ou les exécuter séparément :
npm start          # Serveur API sur le port 9998
npm run dev        # Serveur dev Vite sur le port 3000
```

L'application sera disponible à `http://localhost:3000` avec reconstruction automatique lors des changements de fichiers.

### Déploiement en Production

#### Déploiement Standard

```bash
# Construire pour la production
npm run build

# Démarrer le serveur de production
npm start
```

#### Service Systemd (Linux)

Pour le démarrage automatique et la gestion de processus :

1. **Installer comme service**
   ```bash
   sudo ./install-service.sh
   ```

2. **Gérer le service**
   ```bash
   # Vérifier le statut
   systemctl status shrimp-task-viewer
   
   # Démarrer/arrêter/redémarrer
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Voir les logs
   journalctl -u shrimp-task-viewer -f
   
   # Désactiver/activer le démarrage automatique
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Désinstaller le service**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Utilisation

### Commencer

1. **Démarrer le serveur** :
   ```bash
   npm start
   ```
   
   **Note** : Si vous n'avez pas encore construit l'application ou voulez utiliser le mode développement avec rechargement à chaud, utilisez plutôt `npm run start:all`.

2. **Ouvrir votre navigateur** :
   Naviguez vers `http://127.0.0.1:9998` (production) ou `http://localhost:3000` (développement)

3. **Ajouter votre premier profil** :
   - Cliquez sur le bouton "**+ Ajouter Onglet**"
   - Entrez un nom de profil descriptif (ex., "Tâches Équipe Alpha")
   - Entrez le chemin vers votre dossier de données shrimp contenant tasks.json
   - **Astuce :** Naviguez vers votre dossier dans le terminal et tapez `pwd` pour obtenir le chemin complet
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

### Recherche et Filtrage

- **Recherche globale** : Tapez dans la boîte de recherche pour filtrer sur tous les champs de tâches
- **Tri des colonnes** : Cliquez sur n'importe quel en-tête de colonne pour trier (cliquez encore pour inverser)
- **Pagination** : Naviguez dans de grandes listes de tâches avec des contrôles de pagination intégrés
- **Mises à jour en temps réel** : La recherche et le tri se mettent à jour instantanément pendant que vous tapez

### Configuration de l'Auto-Actualisation

1. **Activer l'auto-actualisation** : Cochez la case "Auto-actualisation"
2. **Définir l'intervalle** : Choisissez dans le menu déroulant (5s à 5m)
3. **Actualisation manuelle** : Cliquez sur le bouton 🔄 à tout moment pour une actualisation immédiate
4. **Retour visuel** : Le spinner apparaît pendant les opérations d'actualisation

## 🔧 Configuration

### Variables d'Environnement

Pour rendre les variables d'environnement persistantes entre les sessions de terminal, ajoutez-les à votre fichier de configuration shell :

**Pour macOS/Linux avec Zsh** (par défaut sur macOS moderne) :
```bash
# Ajouter à ~/.zshrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Recharger la configuration
source ~/.zshrc
```

**Pour Linux/Unix avec Bash** :
```bash
# Ajouter à ~/.bashrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Recharger la configuration
source ~/.bashrc
```

**Pourquoi ajouter à la configuration shell ?**
- **Persistance** : Les variables définies avec `export` dans le terminal ne durent que pour cette session
- **Cohérence** : Toutes les nouvelles fenêtres de terminal auront ces paramètres
- **Commodité** : Pas besoin de définir les variables à chaque fois que vous démarrez le serveur

**Variables disponibles** :
```bash
SHRIMP_VIEWER_PORT=9998           # Port du serveur (défaut : 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Hôte du serveur (localhost seulement)
OPENAI_API_KEY=sk-...             # Clé API OpenAI pour l'attribution d'agents IA
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # Variable env alternative pour la clé OpenAI
```

### Configuration Développement

- **Développement avec rechargement à chaud (recommandé pour le développement)** :
  ```bash
  npm run start:all  # Exécute serveur API (9998) + serveur dev Vite (3000)
  ```
  
  **Pourquoi utiliser start:all ?** Cette commande exécute simultanément le serveur API et le serveur dev Vite. Vous obtenez un remplacement de module à chaud instantané (HMR) pour les changements UI tout en ayant toute la fonctionnalité API. Vos changements apparaissent immédiatement dans le navigateur à `http://localhost:3000` sans actualisation manuelle.

- **Serveur API seulement (pour production ou test API)** :
  ```bash
  npm start  # S'exécute sur le port 9998
  ```
  
  **Pourquoi utiliser le serveur API seulement ?** Utilisez ceci quand vous avez construit les fichiers de production et voulez tester l'application complète comme elle s'exécuterait en production, ou quand vous avez seulement besoin des points de terminaison API.

- **Construire et servir pour la production** :
  ```bash
  npm run build && npm start  # Construire puis servir sur le port 9998
  ```
  
  **Pourquoi construire pour la production ?** La construction de production optimise votre code en minifiant JavaScript, supprimant le code mort et regroupant les ressources efficacement. Cela résulte en des temps de chargement plus rapides et de meilleures performances pour les utilisateurs finaux. Utilisez toujours la construction de production lors du déploiement.

### Stockage des Données de Profils

**Comprendre la gestion des données de profils** : Le Visualiseur de Tâches utilise une approche hybride du stockage de données qui privilégie à la fois la persistance et la précision en temps réel. Les configurations de profils (comme les noms d'onglets, chemins de dossiers et ordre des onglets) sont stockées localement dans un fichier JSON de paramètres dans votre répertoire home, tandis que les données de tâches sont lues directement depuis vos dossiers de projet en temps réel.

- **Fichier de paramètres** : `~/.shrimp-task-viewer-settings.json`
  
  Ce fichier caché dans votre répertoire home stocke toutes vos configurations de profils incluant les noms d'onglets, chemins de dossiers, ordre des onglets et autres préférences. Il est automatiquement créé quand vous ajoutez votre premier profil et mis à jour chaque fois que vous faites des changements. Vous pouvez éditer manuellement ce fichier si nécessaire, mais faites attention à maintenir un formatage JSON valide.

- **Fichiers de tâches** : Lus directement depuis les chemins de dossiers spécifiés (pas de téléchargements)
  
  Contrairement aux applications web traditionnelles qui téléchargent et stockent des copies de fichiers, le Visualiseur de Tâches lit les fichiers `tasks.json` directement depuis vos chemins de dossiers spécifiés. Ceci garantit que vous voyez toujours l'état actuel de vos tâches sans avoir besoin de re-télécharger ou synchroniser. Quand vous ajoutez un profil, vous dites simplement au visualiseur où chercher le fichier tasks.json.

- **Rechargement à chaud** : Les changements de développement se reconstruisent automatiquement
  
  Lors de l'exécution en mode développement (`npm run dev`), tous changements au code source déclenchent des reconstructions automatiques et actualisations du navigateur. Ceci s'applique aux composants React, styles et code serveur, rendant le développement plus rapide et efficace.

### Historique des Tâches Git

**Contrôle de version automatique** : Commençant avec v3.0, le Gestionnaire de Tâches Shrimp suit automatiquement tous les changements de tâches en utilisant Git. Ceci fournit une piste d'audit complète sans aucune configuration manuelle.

- **Emplacement du dépôt** : `<répertoire-données-shrimp>/.git`
  
  Chaque projet obtient son propre dépôt Git dans le répertoire de données configuré dans votre fichier `.mcp.json`. Ceci est complètement séparé du dépôt Git principal de votre projet, prévenant tous conflits ou interférences.

- **Voir l'historique** : Utilisez les commandes Git standard pour explorer l'historique des tâches
  ```bash
  cd <répertoire-données-shrimp>
  git log --oneline          # Voir l'historique des commits
  git show <hash-commit>     # Voir les changements spécifiques
  git diff HEAD~5            # Comparer avec 5 commits précédents
  ```

- **Format des commits** : Tous les commits incluent horodatages et messages descriptifs
  ```
  [2025-08-07T13:45:23-07:00] Add new task: Implement user authentication
  [2025-08-07T14:12:10-07:00] Update task: Fix login validation
  [2025-08-07T14:45:55-07:00] Bulk task operation: append mode, 6 tasks
  ```

- **Récupération** : Restaurez les états précédents des tâches si nécessaire
  ```bash
  cd <répertoire-données-shrimp>
  git checkout <hash-commit> -- tasks.json  # Restaurer version spécifique
  git reset --hard <hash-commit>            # Réinitialisation complète à l'état précédent
  ```

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend** : React 19 + Vite pour le développement avec rechargement à chaud
- **Composant Tableau** : TanStack React Table pour les fonctionnalités de tableau avancées
- **Stylisation** : CSS personnalisé avec thème sombre et design responsif
- **Backend** : Serveur HTTP Node.js avec API RESTful
- **Système de Construction** : Vite pour le développement rapide et les constructions de production optimisées

### Structure des Fichiers

**Organisation du projet** : Le Visualiseur de Tâches suit une structure propre et modulaire qui sépare les préoccupations et rend la base de code facile à naviguer et étendre. Chaque répertoire et fichier a un but spécifique dans l'architecture de l'application.

```
task-viewer/
├── src/                       # Code source de l'application React
│   ├── App.jsx               # Composant React principal - gère état, profils et onglets
│   ├── components/           # Composants React réutilisables
│   │   ├── TaskTable.jsx     # Tableau TanStack pour afficher et trier les tâches
│   │   ├── Help.jsx          # Visualiseur README avec rendu markdown
│   │   └── ReleaseNotes.jsx  # Historique des versions avec coloration syntaxique
│   ├── data/                 # Données statiques et configuration
│   │   └── releases.js       # Métadonnées de version et informations de version
│   └── index.css             # Système de stylisation complet avec thème sombre
├── releases/                  # Fichiers markdown des notes de version et images
│   ├── v*.md                 # Fichiers individuels de notes de version
│   └── *.png                 # Captures d'écran et images pour les versions
├── dist/                     # Sortie de construction de production (auto-générée)
│   ├── index.html            # Point d'entrée HTML optimisé
│   └── assets/               # JS, CSS et autres ressources regroupés
├── server.js                 # Serveur API Node.js style Express
├── cli.js                    # Interface en ligne de commande pour gestion de service
├── vite.config.js            # Configuration outil de construction pour développement/production
├── package.json              # Métadonnées projet, dépendances et scripts npm
├── install-service.sh        # Installeur de service systemd Linux
└── README.md                 # Documentation complète (ce fichier)
```

**Répertoires clés expliqués** :

- **`src/`** : Contient tout le code source React. C'est là que vous ferez la plupart des changements UI.
- **`dist/`** : Construction de production auto-générée. N'éditez jamais ces fichiers directement.
- **`releases/`** : Stocke les notes de version en format markdown avec images associées.
- **Fichiers racine** : Fichiers de configuration et serveur qui gèrent la construction, le service et le déploiement.

### Points de Terminaison API

- `GET /` - Sert l'application React
- `GET /api/agents` - Liste tous les profils configurés
- `GET /api/tasks/{profileId}` - Retourne les tâches pour un profil spécifique
- `POST /api/add-profile` - Ajoute un nouveau profil avec chemin de dossier
- `DELETE /api/remove-profile/{profileId}` - Supprime un profil
- `PUT /api/rename-profile/{profileId}` - Renomme un profil
- `PUT /api/update-profile/{profileId}` - Met à jour les paramètres de profil
- `GET /api/readme` - Retourne le contenu README pour l'onglet aide
- `GET /releases/*.md` - Sert les fichiers markdown de notes de version
- `GET /releases/*.png` - Sert les images de notes de version

## 🛠️ Développement

### Configuration de l'Environnement de Développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement avec rechargement à chaud
npm run dev

# Le serveur de développement s'exécute sur http://localhost:3000
# Le serveur API backend s'exécute sur http://localhost:9998
```

### Construction pour Production

```bash
# Construire le bundle de production optimisé
npm run build

# Les fichiers sont générés dans le répertoire dist/
# Démarrer le serveur de production
npm start
```

### Étendre l'Interface

L'architecture React modulaire rend l'extension facile :

1. **Ajouter de nouveaux composants** : Créer dans `src/components/`
2. **Modifier la stylisation** : Éditer `src/index.css` avec les propriétés personnalisées CSS
3. **Ajouter des fonctionnalités** : Étendre `App.jsx` avec nouveau état et fonctionnalité
4. **Intégration API** : Ajouter des points de terminaison dans `server.js`

## 🔒 Sécurité et Performance

### Fonctionnalités de Sécurité

- **Liaison localhost** : Serveur accessible seulement depuis la machine locale
- **Accès direct aux fichiers** : Lit les fichiers de tâches directement depuis les chemins du système de fichiers
- **Pas de dépendances externes** : Autonome avec surface d'attaque minimale
- **Protection CORS** : Points de terminaison API protégés avec en-têtes CORS

### Optimisations de Performance

- **Remplacement de Module à Chaud** : Mises à jour de développement instantanées
- **Division de Code** : Chargement de bundle optimisé
- **Re-rendu Efficace** : Modèles d'optimisation React
- **Mise en Cache** : Mise en cache de ressources statiques pour chargements plus rapides
- **Images Responsives** : Optimisées pour toutes les tailles d'appareil

## 🐛 Dépannage

### Problèmes Courants

**Le serveur ne démarre pas**
```bash
# Vérifier si le port est utilisé
lsof -i :9998

# Tuer les processus existants
pkill -f "node.*server.js"

# Essayer un port différent
SHRIMP_VIEWER_PORT=8080 node server.js
```

**L'onglet Aide/Readme affiche HTML**
Si l'onglet Aide affiche HTML au lieu du contenu README, le serveur doit être redémarré pour charger les nouveaux points de terminaison API :
```bash
# Arrêter le serveur (Ctrl+C) et redémarrer
npm start
```

**Le rechargement à chaud ne fonctionne pas**
```bash
# S'assurer que les dépendances de développement sont installées
npm install

# Redémarrer le serveur de développement
npm run dev
```

**Les tâches ne se chargent pas**
1. Vérifiez que les fichiers `tasks.json` contiennent du JSON valide
2. Vérifiez que les permissions de fichiers sont lisibles
3. Vérifiez la console du navigateur pour les messages d'erreur
4. Utilisez le bouton d'actualisation manuelle pour recharger les données

**Erreurs de construction**
```bash
# Vider node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Vider le cache Vite
rm -rf dist/
npm run build
```

## 📋 Journal des Changements

### Version 2.1.0 (Dernière) - 2025-07-29

#### 🚀 Fonctionnalités Principales
- **Support de Chemin de Fichier Direct** : Remplacé le téléchargement de fichier par entrée de chemin de dossier direct pour mises à jour en direct
- **Onglet Aide/Readme** : Ajout d'onglet de documentation avec rendu markdown
- **Onglet Notes de Version** : Visualiseur de notes de version dans l'application avec support d'images  
- **Dépendances Clicables** : Naviguez entre tâches dépendantes facilement
- **Colonne Actions IA** : Copiez les instructions IA pour achèvement de tâches
- **Gestion UUID Améliorée** : Cliquez sur les badges de tâches pour copier les UUID
- **Édition de Profils** : Renommez les profils et configurez les racines de projets
- **Support Module ES** : Converti en modules ES pour meilleure compatibilité

#### 🐛 Correction Critique
- **Correction Problème Copie Fichier Statique** : Les fichiers sont maintenant lus directement depuis les chemins spécifiés au lieu de créer des copies statiques dans `/tmp/`

### Version 1.0.3 - 2025-07-26

#### 🧪 Tests et Fiabilité
- **Suite de Tests Complète** : Ajout de couverture de test complète avec Vitest
- **Tests de Composants** : Tests React Testing Library pour tous les composants
- **Tests d'Intégration** : Tests bout-en-bout du serveur et points de terminaison API
- **Corrections de Bogues** : Résolution du handling des données de formulaire multipart dans la gestion de profils

### Version 1.0.2 - 2025-07-26

#### 🎨 Vue Détail des Tâches
- **Navigation Dans l'Onglet** : Remplacé le modal par des détails de tâches transparents dans l'onglet
- **Bouton Retour** : Navigation facile de retour à la liste des tâches
- **UX Améliorée** : Meilleur flux de travail sans interruptions de popup

### Version 1.0.1 - 2025-07-13

#### 🎨 Refonte Majeure de l'UI
- **Interface à Onglets Moderne** : Onglets professionnels style navigateur avec réorganisation glisser-déposer
- **Design Connecté** : Connexion visuelle transparente entre onglets et contenu
- **Layout Amélioré** : Recherche et contrôles repositionnés pour meilleur flux de travail

#### ⚡ Fonctionnalité Améliorée  
- **Auto-actualisation Configurable** : Choisissez intervalles de 5 secondes à 5 minutes
- **Recherche Avancée** : Filtrage en temps réel sur tous les champs de tâches
- **Colonnes Triables** : Cliquez sur les en-têtes pour trier par n'importe quelle colonne
- **Développement Rechargement à Chaud** : Mises à jour instantanées pendant le développement

#### 🔧 Améliorations Techniques
- **Architecture React** : Réécriture complète utilisant React 19 + Vite
- **TanStack Table** : Composant de tableau professionnel avec pagination
- **Design Responsif** : Approche mobile-first avec optimisation des points de rupture
- **Performance** : Rendu optimisé et gestion d'état efficace

### Version 1.0.0 - 2025-07-01

#### 🚀 Version Initiale
- **Visualiseur de Base** : Implémentation initiale avec interface web de base
- **Gestion de Profils** : Ajouter et supprimer des profils de tâches
- **API Serveur** : Points de terminaison RESTful pour données de tâches
- **Affichage de Tâches** : Voir les tâches depuis plusieurs projets

## 📄 Licence

Licence MIT - voir la licence du projet principal pour les détails.

## 🤝 Contribuer

Cet outil fait partie du projet MCP Gestionnaire de Tâches Shrimp. Les contributions sont bienvenues !

1. Forkez le dépôt
2. Créez une branche de fonctionnalité (`git checkout -b feature/fonctionnalite-geniale`)
3. Faites vos changements avec tests appropriés
4. Commitez vos changements (`git commit -m 'Add amazing feature'`)
5. Poussez vers la branche (`git push origin feature/fonctionnalite-geniale`)
6. Soumettez une pull request

### Directives de Développement

- Suivez les meilleures pratiques React et modèles de hooks
- Maintenez les principes de design responsif
- Ajoutez les types TypeScript appropriés là où applicable
- Testez sur différents navigateurs et appareils
- Mettez à jour la documentation pour les nouvelles fonctionnalités

---

**Bonne gestion de tâches ! 🦐✨**

Construit avec ❤️ utilisant React, Vite et technologies web modernes.