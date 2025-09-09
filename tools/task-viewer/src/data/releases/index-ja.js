// リリースメタデータのみ - 実際のコンテンツは /releases/*.md ファイルから読み込まれます
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'タスク完了サマリー保存システム',
    summary: '構造化データモデルとインテリジェントサマリー解析機能による強化されたタスク完了詳細システム'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: '強化されたリリースノート&アーカイブシステム',
    summary: '初期リクエスト表示によるコンテキスト追跡、AI駆動要約、TOC付き強化されたリリースノート、包括的なアーカイブ管理'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: '初期リクエスト表示',
    summary: 'タスク計画を開始した元のユーザーリクエストをキャプチャして表示し、タスクリストに必須のコンテキストを提供'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: '国際化、タスク履歴、サブエージェント、ライトボックス',
    summary: '多言語サポート、テンプレートカスタマイゼーション、プロジェクト履歴、エージェント管理、画像ライトボックス、主要なUI強化'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: '強化されたタスク管理&VS Code統合',
    summary: 'VS Codeファイルリンク、改善されたUUID管理、依存関係列、アプリ内リリースノート'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: '初期スタンドアロンリリース',
    summary: 'プロファイル管理、リアルタイム更新、モダンUIを備えたWebベースのタスクビューワー'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};