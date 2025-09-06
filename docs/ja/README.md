[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇪🇸 Español](../es/README.md) | [🇫🇷 Français](../fr/README.md) | [🇮🇹 Italiano](../it/README.md) | [🇮🇳 हिन्दी](../hi/README.md) | [🇯🇵 日本語](../ja/README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](../pt/README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

# MCP Shrimp タスクマネージャー

> 🦐 **AI駆動開発のためのインテリジェントなタスク管理** - 複雑なプロジェクトを管理しやすいタスクに分解し、セッション間でコンテキストを維持し、開発ワークフローを加速させます。

<div align="center">

[![Shrimp Task Manager Demo](../yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[デモ動画を見る](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[クイックスタート](#-クイックスタート)** • **[ドキュメント](#-ドキュメント)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 クイックスタート

### 前提条件
- Node.js 18以上
- npmまたはyarn
- MCP対応AIクライアント（Claude Code等）

### インストール

#### Claude Codeのインストール

**Windows 11（WSL2使用）:**
```bash
# まず、WSL2がインストールされていることを確認（PowerShellを管理者として実行）
wsl --install

# Ubuntu/WSL環境に入る
wsl -d Ubuntu

# Claude Codeをグローバルにインストール
npm install -g @anthropic-ai/claude-code

# Claude Codeを起動
claude
```

**macOS/Linux:**
```bash
# Claude Codeをグローバルにインストール
npm install -g @anthropic-ai/claude-code

# Claude Codeを起動
claude
```

#### Shrimp Task Managerのインストール

```bash
# リポジトリをクローン
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build
```

### Claude Codeの設定

プロジェクトディレクトリに`.mcp.json`ファイルを作成:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/shrimp_data",
        "TEMPLATES_USE": "ja",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

設定例:
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/project/shrimp_data",
        "TEMPLATES_USE": "ja",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

カスタムMCP設定でClaude Codeを起動:

```bash
claude --dangerously-skip-permissions --mcp-config .mcp.json
```

<details>
<summary><b>その他のAIクライアント</b></summary>

**Cline（VS Code拡張機能）**: AI支援コーディングのためのVS Code拡張機能。VS Codeのsettings.jsonの`cline.mcpServers`に追加

**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）または`%APPDATA%\Claude\claude_desktop_config.json`（Windows）に追加
</details>

### 使用開始

1. **プロジェクトを初期化**: `"init project rules"`
2. **タスクを計画**: `"plan task: ユーザー認証を実装"`
3. **タスクを実行**: `"execute task"` または `"continuous mode"`

## 💡 Shrimpとは？

Shrimp Task ManagerはMCP（Model Context Protocol）サーバーで、AIエージェントがソフトウェア開発にアプローチする方法を変革します。コンテキストを失ったり作業を繰り返したりする代わりに、Shrimpは以下を提供します：

- **🧠 永続的メモリ**: タスクと進捗がセッション間で永続化
- **📋 構造化ワークフロー**: 計画、実行、検証のためのガイド付きプロセス
- **🔄 スマート分解**: 複雑なタスクを管理可能なサブタスクに自動分解
- **🎯 コンテキスト保持**: トークン制限があっても場所を失わない

## ✨ コア機能

### タスク管理
- **インテリジェント計画**: 実装前の要件の深い分析
- **タスク分解**: 大規模プロジェクトを原子的でテスト可能な単位に分解
- **依存関係追跡**: タスク関係の自動管理
- **進捗モニタリング**: リアルタイムステータス追跡と更新

### 高度な機能
- **🔬 リサーチモード**: テクノロジーとソリューションの体系的な探索
- **🤖 エージェントシステム**: 特定のタスクに特化したAIエージェントを割り当て（[詳細](../agents.md)）
- **📏 プロジェクトルール**: プロジェクト全体でコーディング標準を定義・維持
- **💾 タスクメモリ**: タスク履歴の自動バックアップと復元

### Webインターフェース

#### 🖥️ タスクビューアー
ドラッグ＆ドロップ、リアルタイム検索、マルチプロファイルサポートを備えた、視覚的なタスク管理のための最新のReactインターフェース。

**クイックセットアップ:**
```bash
cd tools/task-viewer
npm install
npm run start:all
# http://localhost:5173でアクセス
```

[📖 タスクビューアーの完全なドキュメント](../../tools/task-viewer/README.md)

<kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="タスクビューアーインターフェース" width="600"/></kbd>

#### 🌐 Web GUI
タスクの概要を素早く確認するためのオプションの軽量Webインターフェース。

`.env`で有効化: `ENABLE_GUI=true`

## 📚 ドキュメント

- [📖 完全なドキュメント](../README.md)
- [🛠️ 利用可能なツール](../tools.md)
- [🤖 エージェント管理](../agents.md)
- [🎨 プロンプトのカスタマイズ](../en/prompt-customization.md)
- [🔧 APIリファレンス](../api.md)

## 🎯 一般的な使用例

<details>
<summary><b>機能開発</b></summary>

```
エージェント: "plan task: JWTでユーザー認証を追加"
# エージェントがコードベースを分析し、サブタスクを作成

エージェント: "execute task"
# 段階的に認証を実装
```
</details>

<details>
<summary><b>バグ修正</b></summary>

```
エージェント: "plan task: データ処理のメモリリークを修正"
# エージェントが問題を調査し、修正計画を作成

エージェント: "continuous mode"
# すべての修正タスクを自動実行
```
</details>

<details>
<summary><b>リサーチと学習</b></summary>

```
エージェント: "research: このプロジェクトのReact vs Vueを比較"
# 長所と短所を含む体系的な分析

エージェント: "plan task: 選択したフレームワークにコンポーネントを移行"
# リサーチに基づいて移行計画を作成
```
</details>

## 🛠️ 設定

### 環境変数

`.env`ファイルを作成:

```bash
# 必須
DATA_DIR=/path/to/data/storage

# オプション
ENABLE_GUI=true          # Web GUIを有効化
WEB_PORT=3000           # カスタムWebポート
PROMPT_LANGUAGE=ja      # プロンプト言語（en、zh等）
```

### 利用可能なコマンド

| コマンド | 説明 |
|---------|-------------|
| `init project rules` | プロジェクト標準を初期化 |
| `plan task [説明]` | タスク計画を作成 |
| `execute task [id]` | 特定のタスクを実行 |
| `continuous mode` | すべてのタスクを順次実行 |
| `list tasks` | すべてのタスクを表示 |
| `research [トピック]` | リサーチモードに入る |
| `reflect task [id]` | タスクをレビューして改善 |

## 🤝 貢献

貢献を歓迎します！詳細は[貢献ガイド](../../CONTRIBUTING.md)をご覧ください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](../../LICENSE)ファイルを参照してください。

## 🌟 クレジット

[cjo4m06](https://github.com/cjo4m06)によって作成され、コミュニティによってメンテナンスされています。

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">Discussions</a>
</p>
