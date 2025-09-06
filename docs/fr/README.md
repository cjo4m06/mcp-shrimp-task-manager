[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇪🇸 Español](../es/README.md) | [🇫🇷 Français](README.md) | [🇮🇹 Italiano](../it/README.md) | [🇮🇳 हिन्दी](../hi/README.md) | [🇯🇵 日本語](../ja/README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

# MCP Shrimp Task Manager

> 🦐 **Gestion intelligente des tâches pour le développement assisté par IA** - Décomposez les projets complexes en tâches gérables, maintenez le contexte entre les sessions et accélérez votre flux de travail de développement.

<div align="center">
  
[![Shrimp Task Manager Demo](../yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[Regarder la vidéo de démonstration](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Démarrage rapide](#-démarrage-rapide)** • **[Documentation](#-documentation)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Client IA compatible MCP (Claude Code, etc.)

### Installation

#### Installer Claude Code

**Windows 11 (avec WSL2) :**
```bash
# D'abord, assurez-vous que WSL2 est installé (dans PowerShell en tant qu'administrateur)
wsl --install

# Entrer dans l'environnement Ubuntu/WSL
wsl -d Ubuntu

# Installer Claude Code globalement
npm install -g @anthropic-ai/claude-code

# Démarrer Claude Code
claude
```

**macOS/Linux :**
```bash
# Installer Claude Code globalement
npm install -g @anthropic-ai/claude-code

# Démarrer Claude Code
claude
```

#### Installer Shrimp Task Manager

```bash
# Cloner le dépôt
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# Installer les dépendances
npm install

# Construire le projet
npm run build
```

### Configurer Claude Code

Créez un fichier `.mcp.json` dans votre répertoire de projet :

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/chemin/vers/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/chemin/vers/vos/donnees_shrimp",
        "TEMPLATES_USE": "fr",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

Exemple de configuration :
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/projet/donnees_shrimp",
        "TEMPLATES_USE": "fr",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

Ensuite, démarrez Claude Code avec votre configuration MCP personnalisée :

```bash
claude --dangerously-skip-permissions --mcp-config .mcp.json
```

<details>
<summary><b>Autres clients IA</b></summary>

**Cline (Extension VS Code)** : Une extension VS Code pour le codage assisté par IA. Ajouter à VS Code settings.json sous `cline.mcpServers`

**Claude Desktop** : Ajouter à `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
</details>

### Commencer à utiliser

1. **Initialiser votre projet** : `"init project rules"`
2. **Planifier une tâche** : `"plan task: implémenter l'authentification utilisateur"`
3. **Exécuter les tâches** : `"execute task"` ou `"continuous mode"`

## 💡 Qu'est-ce que Shrimp ?

Shrimp Task Manager est un serveur MCP (Model Context Protocol) qui transforme la façon dont les agents IA abordent le développement logiciel. Au lieu de perdre le contexte ou de répéter le travail, Shrimp fournit :

- **🧠 Mémoire persistante** : Les tâches et le progrès persistent entre les sessions
- **📋 Flux de travail structurés** : Processus guidés pour la planification, l'exécution et la vérification
- **🔄 Décomposition intelligente** : Décompose automatiquement les tâches complexes en sous-tâches gérables
- **🎯 Préservation du contexte** : Ne perdez jamais votre place, même avec les limites de tokens

## ✨ Fonctionnalités principales

### Gestion des tâches
- **Planification intelligente** : Analyse approfondie des exigences avant l'implémentation
- **Décomposition des tâches** : Divise les grands projets en unités atomiques et testables
- **Suivi des dépendances** : Gestion automatique des relations entre tâches
- **Surveillance du progrès** : Suivi et mises à jour du statut en temps réel

### Capacités avancées
- **🔬 Mode recherche** : Exploration systématique des technologies et solutions
- **🤖 Système d'agents** : Assigner des agents IA spécialisés à des tâches spécifiques ([En savoir plus](../agents.md))
- **📏 Règles de projet** : Définir et maintenir les standards de codage dans votre projet
- **💾 Mémoire des tâches** : Sauvegarde et restauration automatiques de l'historique des tâches

### Interfaces web

#### 🖥️ Visualiseur de tâches
Interface React moderne pour la gestion visuelle des tâches avec glisser-déposer, recherche en temps réel et support multi-profils.

**Configuration rapide :**
```bash
cd tools/task-viewer
npm install
npm run start:all
# Accès sur http://localhost:5173
```

[📖 Documentation complète du visualiseur de tâches](../../tools/task-viewer/README.md)

<kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Interface du visualiseur de tâches" width="600"/></kbd>

#### 🌐 Interface Web
Interface web légère optionnelle pour un aperçu rapide des tâches.

Activer dans `.env` : `ENABLE_GUI=true`

## 📚 Documentation

- [📖 Documentation complète](../README.md)
- [🛠️ Outils disponibles](../tools.md)
- [🤖 Gestion des agents](../agents.md)
- [🎨 Personnalisation des prompts](prompt-customization.md)
- [🔧 Référence API](../api.md)

## 🎯 Cas d'usage courants

<details>
<summary><b>Développement de fonctionnalités</b></summary>

```
Agent: "plan task: ajouter l'authentification utilisateur avec JWT"
# L'agent analyse la base de code, crée des sous-tâches

Agent: "execute task"
# Implémente l'authentification étape par étape
```
</details>

<details>
<summary><b>Correction de bugs</b></summary>

```
Agent: "plan task: corriger la fuite mémoire dans le traitement des données"
# L'agent recherche le problème, crée un plan de correction

Agent: "continuous mode"
# Exécute toutes les tâches de correction automatiquement
```
</details>

<details>
<summary><b>Recherche et apprentissage</b></summary>

```
Agent: "research: comparer React vs Vue pour ce projet"
# Analyse systématique avec avantages/inconvénients

Agent: "plan task: migrer le composant vers le framework choisi"
# Crée un plan de migration basé sur la recherche
```
</details>

## 🛠️ Configuration

### Variables d'environnement

Créez un fichier `.env` :

```bash
# Requis
DATA_DIR=/chemin/vers/stockage/donnees

# Optionnel
ENABLE_GUI=true          # Activer l'interface web
WEB_PORT=3000           # Port web personnalisé
PROMPT_LANGUAGE=fr      # Langue des prompts (fr, en, zh, etc.)
```

### Commandes disponibles

| Commande | Description |
|---------|-------------|
| `init project rules` | Initialiser les standards du projet |
| `plan task [description]` | Créer un plan de tâche |
| `execute task [id]` | Exécuter une tâche spécifique |
| `continuous mode` | Exécuter toutes les tâches séquentiellement |
| `list tasks` | Afficher toutes les tâches |
| `research [sujet]` | Entrer en mode recherche |
| `reflect task [id]` | Examiner et améliorer une tâche |

## 🤝 Contribuer

Nous accueillons les contributions ! Veuillez consulter notre [Guide de contribution](../../CONTRIBUTING.md) pour plus de détails.

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](../../LICENSE) pour plus de détails.

## 🌟 Crédits

Créé par [cjo4m06](https://github.com/cjo4m06) et maintenu par la communauté.

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">Discussions</a>
</p>