export const translations = {
  // Header
  appTitle: "🦐 Shrimp Task Manager Viewer",
  version: "バージョン",
  releaseNotes: "リリースノート",
  help: "ヘルプ",
  language: "言語",
  
  // Navigation tabs
  tasks: "タスク",
  templates: "テンプレート",
  projects: "プロジェクト",
  
  // Template Management
  templateManagement: "🎨 テンプレート管理",
  templateManagementDesc: "すべてのタスクマネージャー機能のプロンプトテンプレートを管理します。テンプレートを編集、複製、またはリセットしてAIの動作をカスタマイズしましょう。",
  exportTemplates: "📤 テンプレートエクスポート",
  exportTemplatesDesc: "テンプレート設定をエクスポートしてチームと共有したり、後で使用するためにバックアップしたりしましょう",
  
  // Template columns
  function: "機能",
  description: "説明",
  status: "ステータス",
  actions: "アクション",
  
  // Template statuses
  statusDefault: "デフォルト",
  statusCustom: "カスタム",
  statusCustomAppend: "カスタム+追加",
  
  // Template actions
  edit: "編集",
  editTemplate: "✏️ テンプレート編集",
  preview: "プレビュー",
  previewTemplate: "プレビュー: {name}",
  duplicate: "複製",
  duplicateTemplate: "📋 テンプレート複製",
  activate: "アクティベート",
  activateTemplate: "🚀 テンプレートアクティベート",
  reset: "リセット",
  resetToDefault: "デフォルトテンプレートにリセット",
  
  // Common actions
  save: "保存",
  cancel: "キャンセル",
  back: "戻る",
  backToTemplates: "← テンプレートに戻る",
  close: "閉じる",
  
  // Duplicate Template View
  whyDuplicate: "📚 なぜテンプレートを複製するのか？",
  duplicateExplanation: "テンプレートの複製により、異なる使用ケースに対応した既存テンプレートの専門版を作成できます：",
  createVariations: "🎯 バリエーションの作成",
  createVariationsDesc: "異なるコンテキスト用の専門バージョンを作成：",
  safeExperimentation: "🧪 安全な実験",
  safeExperimentationDesc: "作業テンプレートに影響を与えることなく変更をテスト：",
  templateLibraries: "📂 テンプレートライブラリ",
  templateLibrariesDesc: "関連テンプレートのコレクションを構築：",
  versionManagement: "💾 バージョン管理",
  versionManagementDesc: "異なるニーズに対応する異なるバージョンを保持：",
  
  // Duplicate form
  createDuplicate: "📝 複製作成",
  originalTemplate: "元のテンプレート",
  newTemplateName: "新しいテンプレート名",
  required: "*",
  nameHint: "この複製の目的やバリエーションを示す説明的な名前を選択してください",
  whatWillHappen: "📋 実行される内容：",
  createNewTemplate: "新しいテンプレートを作成",
  copyContent: "コンテンツをコピー",
  independentEditing: "独立した編集",
  readyToUse: "使用準備完了",
  
  // Export Templates
  exportTemplateConfigurations: "テンプレート設定のエクスポート",
  exportFormat: "エクスポート形式：",
  exportOnlyModified: "変更されたテンプレートのみをエクスポート（推奨）",
  exportHint: "チェックすると、カスタマイズまたは上書きされたテンプレートのみがエクスポートされます",
  
  // Activation Dialog
  whatIsEnvVar: "📋 環境変数とは何ですか？",
  envVarExplanation: "環境変数は、プログラムが開始時に読み取ることができる設定です。MCPサーバーはカスタムテンプレート変数をチェックして、デフォルトのプロンプトを上書きします。{envVar}を設定することで、MCPサーバーに組み込みのテンプレートではなく編集されたテンプレートを使用するよう指示します。",
  whyNeedThis: "なぜこれが必要なのですか？",
  whyNeedThisExplanation: "ClaudeがMCPサーバーを起動するとき、これらの環境変数を読み取って応答方法をカスタマイズします。この変数を設定しないと、テンプレートの編集が使用されません。",
  howToSetVariable: "🚀 この変数を設定する方法",
  chooseCommand: "設定に基づいて以下から適切なコマンドを選択してください。これらのコマンドは、Claudeが起動時に使用できるように、シェル設定ファイル（~/.bashrcや~/.zshrcなど）に変数をエクスポートします。",
  
  // Messages
  loading: "ローディング中...",
  error: "エラー",
  success: "成功",
  noTemplatesFound: "テンプレートが見つかりません",
  failedToLoad: "ロードに失敗しました",
  
  // Pagination
  showing: "表示中",
  to: "〜",
  of: "/",
  page: "ページ",
  filteredFrom: "でフィルタリング",
  total: "総計",
  
  // Statistics
  totalTemplates: "総テンプレート数",
  totalNumberOfTemplates: "総テンプレート数",
  numberOfDefaultTemplates: "デフォルトテンプレート数",
  numberOfCustomTemplates: "カスタムテンプレート数",
  numberOfEnvOverrideTemplates: "環境オーバーライドテンプレート数",
  default: "デフォルト",
  custom: "カスタム", 
  envOverride: "環境オーバーライド",
  
  // Project management
  readme: "リードミー",
  addTab: "プロジェクト追加",
  history: "履歴",
  viewProjectHistory: "プロジェクト履歴を表示",
  totalTasks: "総タスク数",
  completed: "完了済み",
  inProgress: "進行中",
  pending: "保留中",
  autoRefresh: "自動リフレッシュ",
  
  // History management
  backToTasks: "タスクに戻る",
  backToHistory: "履歴に戻る",
  projectHistory: "プロジェクト履歴",
  dateTime: "日付/時刻",
  taskCount: "タスク数",
  notes: "ノート",
  statusSummary: "ステータス要約",
  viewTasks: "タスクを表示",
  noHistoryFound: "履歴が見つかりません",
  noHistoryDescription: "このプロジェクトに利用可能な履歴タスクスナップショットはありません",
  historyRowTitle: "履歴エントリ - 詳細を表示するには「タスクを表示」をクリック",
  historyEntries: "履歴エントリ",
  tasksFrom: "タスクの出典",
  taskName: "タスク名",
  noDependencies: "なし",
  created: "作成日",
  noTasksFound: "タスクが見つかりません",
  noTasksMessage: "tasks.jsonファイルがまだ作成されていません。タスクを生成するには、このフォルダでshrimpを実行してください。",
  noTasksInHistory: "この履歴スナップショットにはタスクが含まれていません",
  taskRowTitle: "履歴スナップショットからのタスク詳細",
  
  // Search and UI
  searchTemplatesPlaceholder: "🔍 テンプレートを検索...",
  searchTemplatesTitle: "機能名または説明でテンプレートを検索およびフィルタリング",
  refreshTemplateData: "テンプレートデータを更新",
  searchTasksPlaceholder: "🔍 タスクを検索...",
  searchTasksTitle: "任意のテキスト内容でタスクを検索およびフィルタリング",
  refreshCurrentProfile: "現在のプロジェクトデータを更新 - ファイルからタスクを再読み込み",
  
  // Project management
  editProjectSettings: "プロジェクト設定編集",
  chooseProfileTitle: "上のドロップダウンからプロジェクトを選択してください",
  selectProfileToViewTasks: "タスクを表示するプロジェクトを選択してください",
  noProfilesAvailable: "利用可能なプロジェクトがありません",
  noProfilesClickAddTab: "利用可能なプロジェクトがありません。「プロジェクト追加」をクリックして作成してください。",
  loadingTasksFromFile: "ファイルからタスクを読み込み中",
  loadingTasks: "タスク読み込み中... ⏳",
  
  // Add/Edit Project forms
  addNewProfile: "新しいプロジェクトを追加",
  profileName: "プロジェクト名",
  profileNamePlaceholder: "例：チーム・アルファ・タスク",
  profileNameTitle: "このプロジェクトの説明的な名前を入力してください",
  taskFolderPath: "タスクフォルダパス",
  taskFolderPathPlaceholder: "/path/to/shrimp_data_folder",
  taskFolderPathTitle: "tasks.jsonを含むshrimpデータフォルダのパスを入力してください",
  tip: "ヒント",
  navigateToFolder: "ターミナルでshrimpデータフォルダに移動し、",
  typePwd: "pwdと入力してフルパスを取得してください",
  example: "例",
  projectRootPath: "プロジェクトルートパス",
  projectRootPlaceholder: "例：/home/user/my-project",
  projectRootTitle: "プロジェクトルートディレクトリの絶対パスを入力してください",
  projectRootHint: "これによりVS Codeで開くクリック可能なファイルリンクが有効になります",
  optional: "オプション",
  addProfile: "プロジェクト追加",
  cancelAndCloseDialog: "キャンセルしてこのダイアログを閉じます",
  addProject: "プロジェクト追加",
  
  // Edit Project specific
  projectRoot: "プロジェクトルート",
  taskPath: "タスクパス",
  editProfileNameTitle: "プロジェクト名を編集",
  projectRootEditPlaceholder: "例：/home/user/projects/my-project",
  projectRootEditTitle: "VS Codeファイルリンクを有効にするためにプロジェクトルートパスを設定",
  projectRootEditHint: "タスクファイル用のクリック可能なVS Codeリンクを有効にするためにこれを設定してください",
  taskPathPlaceholder: "/path/to/shrimp_data_folder/tasks.json",
  taskPathTitle: "このプロジェクトのtasks.jsonファイルのパスを編集",
  taskPathHint: "プロジェクトのタスクデータを含むtasks.jsonファイルのパス",
  saveChanges: "変更を保存",
  
  // Toast messages with parameters
  profileAddedSuccess: "プロジェクト\"{name}\"が正常に追加されました！",
  profileRemovedSuccess: "プロジェクト\"{name}\"が正常に削除されました！",
  templateSavedSuccess: "テンプレート\"{name}\"が正常に保存されました！",
  templateResetSuccess: "テンプレート\"{name}\"がデフォルトにリセットされました！",
  templateDuplicatedSuccess: "テンプレートが\"{name}\"として複製されました！",
  rememberToRestartClaude: "💡 環境変数を設定した後にClaude Codeを再起動することを忘れずに",
  
  // Confirmation dialogs
  confirmRemoveProfile: "このプロジェクトを削除してもよろしいですか？この操作は元に戻せません。",
  confirmResetTemplate: "{name}をデフォルトにリセットしてもよろしいですか？すべてのカスタマイゼーションが削除されます。",
  
  // Template activation
  defaultTemplateAlreadyActive: "デフォルトテンプレートはすでにアクティブです - アクティベーションは不要です",
  
  // Duplicate Template View additional keys
  noTemplateSelected: "テンプレートが選択されていません",
  pleaseEnterDuplicateName: "複製テンプレートの名前を入力してください",
  duplicateNameMustBeDifferent: "複製名は元の名前と異なる必要があります",
  failedToDuplicateTemplate: "テンプレートの複製に失敗しました",
  backToTemplateList: "テンプレートリストに戻る",
  creatingDuplicate: "複製作成中...",
  
  // Task Table
  task: "タスク",
  taskName: "タスク名",
  created: "作成日",
  updated: "更新日",
  dependencies: "依存関係",
  noTasksFound: "このプロジェクトではタスクが見つかりませんでした",
  noDescriptionProvided: "説明が提供されていません",
  viewTask: "タスクを表示",
  clickToCopyUuid: "UUIDをクリップボードにコピーするにはクリックしてください",
  copyTaskInstruction: "クリップボードに以下をコピー：タスクマネージャーを使用してこのshrimpタスクを完了",
  useTaskManager: "タスクマネージャーを使用してこのshrimpタスクを完了",
  clickToViewTaskDetails: "タスクの詳細を表示するにはクリックしてください",
  
  // Template Editor
  saving: "保存中...",
  saveTemplate: "テンプレート保存",
  
  // Project Settings
  projectSettings: "プロジェクト設定",
  settingsSaved: "設定が正常に保存されました",
  settings: "設定",
  
  // Global Settings
  globalSettings: "グローバル設定",
  claudeFolderPath: "Claudeフォルダパス",
  claudeFolderPathDesc: "Claudeフォルダパスを指定すると、サブエージェントとフック設定にアクセスできます",
  claudeFolderPathPlaceholder: "例：~/.config/claude",
  
  // Task messages
  taskSavedSuccess: "タスクが正常に保存されました",
  confirmDeleteTask: "このタスクを削除してもよろしいですか？",
  taskDeletedSuccess: "タスクが正常に削除されました",
  deleteTask: "タスク削除",
  
  // Agent functionality
  subAgents: "サブエージェント",
  agents: "エージェント", 
  agentName: "エージェント名",
  type: "タイプ",
  viewAgent: "エージェント表示",
  editAgent: "エージェント編集",
  noAgentsFound: "エージェントが見つかりません",
  agentSavedSuccess: "エージェントが正常に保存されました",
  aiInstruction: "AI指示"
};