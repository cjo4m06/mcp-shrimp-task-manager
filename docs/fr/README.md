[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇫🇷 Français](README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

## Table des matières

- [✨ Fonctionnalités](#fonctionnalites1)
- [🧭 Guide d'utilisation](#guide-utilisation)
- [🖥️ Outil Task Viewer](#task-viewer-tool)
- [🔬 Mode recherche](#mode-recherche)
- [🤖 Système de gestion des agents](#systeme-gestion-agents)
- [🧠 Fonction de mémoire des tâches](#fonction-memoire-taches)
- [📋 Initialisation des règles de projet](#regles-projet)
- [🌐 Interface Web](#interface-web)
- [📚 Ressources de documentation](#documentation)
- [🔧 Installation et utilisation](#installation)
- [🔌 Utilisation avec les clients compatibles MCP](#clients)
- [💡 Guide des invites système](#invite)
- [🛠️ Aperçu des outils disponibles](#outils)
- [🏗️ Vue d'ensemble de l'architecture](#vue-ensemble-architecture)
- [📄 Licence](#licence)
- [🤖 Modèles recommandés](#modeles-recommandes)

# MCP Shrimp Task Manager

[![Shrimp Task Manager Demo](/docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)

> 🚀 Un système intelligent de gestion des tâches basé sur le Model Context Protocol (MCP), fournissant un framework de workflow de programmation efficace pour les Agents IA.

<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" />
</a>

Shrimp Task Manager guide les Agents à travers des workflows structurés pour la programmation systématique, améliore les mécanismes de gestion de la mémoire des tâches et évite efficacement les travaux de codage redondants et répétitifs.

## ✨ <a id="fonctionnalites1"></a>Fonctionnalités

- **Planification et analyse des tâches** : Compréhension approfondie et analyse des exigences de tâches complexes
- **Décomposition intelligente des tâches** : Divise automatiquement les grandes tâches en tâches plus petites gérables
- **Gestion des dépendances** : Traite précisément les dépendances entre les tâches, assurant l'ordre d'exécution correct
- **Suivi du statut d'exécution** : Surveillance en temps réel du progrès et du statut d'exécution des tâches
- **Vérification de complétude des tâches** : Assure que les résultats des tâches répondent aux exigences attendues
- **Évaluation de la complexité des tâches** : Évalue automatiquement la complexité des tâches et fournit des suggestions de traitement optimales
- **Mises à jour automatiques du résumé des tâches** : Génère automatiquement des résumés à la fin des tâches, optimisant les performances de la mémoire
- **Fonction de mémoire des tâches** : Sauvegarde automatique de l'historique des tâches, fournissant des capacités de mémoire et de référence à long terme
- **Mode recherche** : Capacités de recherche technique systématique avec des workflows guidés pour explorer les technologies, les meilleures pratiques et les comparaisons de solutions
- **Initialisation des règles de projet** : Définit les standards et règles de projet pour maintenir la cohérence dans les grands projets
- **<a id="interface-web"></a>Interface Web** : Fournit une interface utilisateur graphique web optionnelle pour la gestion des tâches. Activez en définissant `ENABLE_GUI=true` dans votre fichier `.env`. Lorsqu'activé, un fichier `WebGUI.md` contenant l'adresse d'accès sera créé dans votre `DATA_DIR`. Vous pouvez personnaliser le port web en définissant `WEB_PORT` (si non spécifié, un port disponible sera automatiquement sélectionné).
- **<a id="task-viewer"></a>Task Viewer** : Une interface web moderne basée sur React pour visualiser et gérer les données de tâches sur plusieurs profils avec des fonctionnalités avancées comme les onglets glisser-déposer, la recherche en temps réel et l'actualisation automatique configurable. Voir la [documentation Task Viewer](../../tools/task-viewer) pour les instructions de configuration et d'utilisation.

  <kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Interface Task Viewer" /></kbd>
  
  <kbd><img src="../../tools/task-viewer/task-details-view.png" alt="Vue détails des tâches" /></kbd>

- **<a id="systeme-gestion-agents"></a>Gestion des agents** : Système complet de gestion des sous-agents pour le traitement spécialisé des tâches. Assignez des agents IA spécifiques aux tâches, gérez les métadonnées des agents et tirez parti du système d'agents de Claude pour une exécution optimale des tâches.

## 🧭 <a id="guide-utilisation"></a>Guide d'utilisation

Shrimp Task Manager offre une approche structurée de la programmation assistée par IA grâce à des workflows guidés et une gestion systématique des tâches.

### Qu'est-ce que Shrimp ?

Shrimp est essentiellement un modèle d'invite qui guide les Agents IA pour mieux comprendre et travailler avec votre projet. Il utilise une série d'invites pour s'assurer que l'Agent s'aligne étroitement avec les besoins spécifiques et les conventions de votre projet.

### Mode recherche en pratique

Avant de vous plonger dans la planification des tâches, vous pouvez tirer parti du mode recherche pour l'investigation technique et la collecte de connaissances. Ceci est particulièrement utile quand :

- Vous devez explorer de nouvelles technologies ou frameworks
- Vous voulez comparer différentes approches de solution
- Vous enquêtez sur les meilleures pratiques pour votre projet
- Vous devez comprendre des concepts techniques complexes

Dites simplement à l'Agent "research [votre sujet]" ou "enter research mode for [technologie/problème]" pour commencer l'investigation systématique. Les résultats de recherche informeront ensuite votre planification de tâches et vos décisions de développement ultérieures.

### Configuration initiale

Lors du travail avec un nouveau projet, dites simplement à l'Agent "init project rules". Cela guidera l'Agent pour générer un ensemble de règles adaptées aux exigences spécifiques et à la structure de votre projet.

### Processus de planification des tâches

Pour développer ou mettre à jour des fonctionnalités, utilisez la commande "plan task [votre description]". Le système référencera les règles précédemment établies, tentera de comprendre votre projet, recherchera les sections de code pertinentes et proposera un plan complet basé sur l'état actuel de votre projet.

*[Les autres sections restent en anglais car la traduction est en cours]*

## 🏗️ <a id="vue-ensemble-architecture"></a>Vue d'ensemble de l'architecture

### Architecture centrale

Le MCP Shrimp Task Manager est construit comme un serveur Model Context Protocol (MCP) qui fournit des capacités de gestion de tâches structurées pour les agents IA à travers des workflows guidés et une décomposition systématique des tâches.

#### 1. **Fondations du serveur MCP**
- Construit sur `@modelcontextprotocol/sdk` pour la conformité au protocole MCP
- Utilise le transport stdio pour la communication avec les clients IA
- Expose 16 outils spécialisés via des définitions JSON Schema
- Prend en charge les opérations synchrones et asynchrones

#### 2. **Modèle de données des tâches** (`src/types/index.ts`, `src/models/taskModel.ts`)
- **Entité tâche** : Structure de données centrale avec ID unique, nom, description, statut et dépendances
- **États des tâches** : PENDING → IN_PROGRESS → COMPLETED (ou BLOCKED)
- **Graphe de dépendances** : Gère les relations entre tâches et l'ordre d'exécution
- **Fichiers associés** : Suit les fichiers associés à chaque tâche (TO_MODIFY, REFERENCE, CREATE, etc.)
- **Persistance** : Stockage de fichiers JSON avec versioning Git pour un historique complet
- **Système de mémoire** : Sauvegardes automatiques et préservation de l'historique des tâches à long terme

#### 3. **Architecture du système d'outils** (`src/tools/`)
Le système fournit des outils spécialisés organisés en trois catégories principales :

**Outils de gestion des tâches :**
- `plan_task` : Convertit le langage naturel en plans de développement structurés
- `analyze_task` : Analyse technique approfondie avec évaluation de complexité
- `split_tasks` : Décomposition intelligente des tâches complexes en sous-tâches gérables
- `execute_task` : Implémentation guidée avec instructions étape par étape
- `verify_task` : Vérification de complétude et assurance qualité
- `list_tasks`, `query_task`, `get_task_detail` : Inspection et récupération des tâches
- `update_task`, `delete_task`, `clear_all_tasks` : Manipulation des tâches

**Outils cognitifs :**
- `process_thought` : Framework de raisonnement en chaîne de pensée pour la résolution de problèmes complexes
- `reflect_task` : Analyse post-complétude et extraction d'apprentissage
- `research_mode` : Investigation technique systématique avec workflows guidés

**Outils de projet :**
- `init_project_rules` : Établit les conventions et standards spécifiques au projet

#### 4. **Système de modèles d'invites** (`src/prompts/`)
- **Support multi-langues** : Modèles anglais et chinois traditionnel
- **Génération basée sur modèles** : Construction modulaire d'invites
- **Invites sensibles au contexte** : Génération dynamique d'invites basée sur l'état des tâches
- **Modèles personnalisables** : Remplacement ou extension via variables d'environnement
- **Chargement de modèles** : Sélection dynamique de modèles basée sur la configuration

#### 5. **Système d'intégration des agents** (`src/utils/agentLoader.ts`)
- **Attribution d'agents** : Les tâches peuvent être assignées à des agents IA spécialisés
- **Métadonnées d'agents** : Stocke les capacités et spécialisations des agents
- **Correspondance d'agents** : Sélection intelligente d'agents basée sur les exigences des tâches
- **Intégration Claude** : Intégration transparente avec le système d'agents de Claude

### Flux de données et workflow

#### 1. **Phase de planification des tâches**
```
Demande utilisateur → plan_task → analyze_task → split_tasks (si complexe)
```
- Le langage naturel est analysé et converti en tâches structurées
- L'évaluation de complexité détermine si la division des tâches est nécessaire
- Les dépendances sont automatiquement identifiées et mappées

#### 2. **Phase d'exécution**
```
execute_task → Guide d'implémentation → Mises à jour du statut → Suivi des fichiers
```
- Guide d'implémentation étape par étape généré
- Fichiers associés suivis et surveillés
- Statut de progrès mis à jour en temps réel
- Commits Git créés pour le contrôle de version

#### 3. **Phase de vérification**
```
verify_task → reflect_task → Résumé de tâche → Stockage en mémoire
```
- Complétude vérifiée contre les critères d'acceptation
- Leçons apprises extraites pour référence future
- Résumé de tâche généré et stocké
- Le système de mémoire préserve les connaissances pour les futures tâches

#### 4. **Mémoire et persistance**
- **Stockage primaire** : `tasks.json` dans DATA_DIR
- **Contrôle de version** : Le dépôt Git suit tous les changements
- **Système de sauvegarde** : Sauvegardes automatiques horodatées
- **Répertoire de mémoire** : Stockage à long terme des tâches complétées
- **Isolation de projet** : Le protocole ListRoots permet la séparation des données par projet

### Principes de conception clés

1. **Raisonnement en chaîne de pensée** : Les outils guident l'IA à travers des processus de pensée structurés
2. **Raffinement itératif** : Les tâches peuvent être analysées, divisées et affinées plusieurs fois
3. **Préservation du contexte** : L'historique Git et le système de mémoire empêchent la perte de contexte entre les sessions
4. **Flexibilité linguistique** : Support bilingue avec des modèles personnalisables
5. **Gestion avec état** : Le stockage persistant maintient l'état des tâches entre les conversations
6. **Workflows guidés** : Le système guide plutôt que de commander, assurant la cohérence

### Interfaces web

#### 1. **GUI Web intégrée** (`src/web/webServer.ts`)
- Serveur Express.js optionnel (ENABLE_GUI=true)
- Visualisation des tâches en temps réel
- Sélection automatique de port avec fallback
- Génère WebGUI.md avec l'URL d'accès

#### 2. **Outil Task Viewer** (`tools/task-viewer/`)
- Application React autonome
- Support multi-profils pour différents projets
- Surveillance des tâches en temps réel avec actualisation automatique
- Interface glisser-déposer pour l'organisation
- Intégration de gestion des agents

### Points d'intégration

- **Protocole MCP** : Protocole standard pour l'interaction avec les modèles IA
- **Système de fichiers** : Manipulation directe des fichiers pour les données de tâches
- **Intégration Git** : Contrôle de version pour l'historique des tâches
- **Variables d'environnement** : Options de configuration étendues
- **APIs Web** : Points de terminaison RESTful pour l'interaction GUI

## 🔧 Implémentation technique

- **Node.js** : Environnement d'exécution JavaScript haute performance
- **TypeScript** : Fournit un environnement de développement type-safe
- **MCP SDK** : Interface pour l'interaction transparente avec les modèles de langage large
- **UUID** : Génère des identifiants de tâches uniques et fiables
- **Express.js** : Serveur web pour GUI optionnelle
- **Git** : Contrôle de version pour l'historique des tâches

*[Les autres sections seront traduites lorsque la traduction complète sera demandée]*

## 📄 <a id="licence"></a>Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](../../LICENSE) pour les détails.

## <a id="modeles-recommandes"></a>Modèles recommandés

Pour la meilleure expérience, nous recommandons d'utiliser les modèles suivants :

- **Claude 3.7** : Offre de fortes capacités de compréhension et de génération.
- **Gemini 2.5** : Le dernier modèle de Google, performance excellente.

En raison des différences dans les méthodes d'entraînement et les capacités de compréhension entre les modèles, l'utilisation d'autres modèles pourrait conduire à des résultats variables pour les mêmes invites. Ce projet a été optimisé pour Claude 3.7 et Gemini 2.5.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)