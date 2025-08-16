export const translations = {
  // Header
  appTitle: "🦐 Shrimp Task Manager Viewer",
  version: "버전",
  releaseNotes: "릴리스 노트",
  help: "도움말",
  language: "언어",
  
  // Navigation tabs
  tasks: "작업",
  templates: "템플릿",
  projects: "프로젝트",
  
  // Template Management
  templateManagement: "🎨 템플릿 관리",
  templateManagementDesc: "모든 작업 관리자 기능을 위한 프롬프트 템플릿을 관리합니다. 템플릿을 편집, 복제 또는 재설정하여 AI 동작을 사용자 정의하세요.",
  exportTemplates: "📤 템플릿 내보내기",
  exportTemplatesDesc: "팀과 공유하거나 나중에 사용하기 위해 백업할 템플릿 구성을 내보내세요",
  
  // Template columns
  function: "기능",
  description: "설명",
  status: "상태",
  actions: "작업",
  
  // Template statuses
  statusDefault: "기본",
  statusCustom: "사용자 정의",
  statusCustomAppend: "사용자 정의+추가",
  
  // Template actions
  edit: "편집",
  editTemplate: "✏️ 템플릿 편집",
  preview: "미리보기",
  previewTemplate: "미리보기: {name}",
  duplicate: "복제",
  duplicateTemplate: "📋 템플릿 복제",
  activate: "활성화",
  activateTemplate: "🚀 템플릿 활성화",
  reset: "재설정",
  resetToDefault: "기본 템플릿으로 재설정",
  
  // Common actions
  save: "저장",
  cancel: "취소",
  back: "뒤로",
  backToTemplates: "← 템플릿으로 돌아가기",
  close: "닫기",
  
  // Duplicate Template View
  whyDuplicate: "📚 템플릿을 복제하는 이유는?",
  duplicateExplanation: "템플릿을 복제하면 다양한 사용 사례에 대한 기존 템플릿의 특수 버전을 만들 수 있습니다:",
  createVariations: "🎯 변형 만들기",
  createVariationsDesc: "다양한 컨텍스트를 위한 특수 버전을 만드세요:",
  safeExperimentation: "🧪 안전한 실험",
  safeExperimentationDesc: "작업 템플릿에 영향을 주지 않고 변경사항을 테스트하세요:",
  templateLibraries: "📂 템플릿 라이브러리",
  templateLibrariesDesc: "관련 템플릿의 컬렉션을 구축하세요:",
  versionManagement: "💾 버전 관리",
  versionManagementDesc: "다양한 요구사항에 맞는 다양한 버전을 유지하세요:",
  
  // Duplicate form
  createDuplicate: "📝 복제 생성",
  originalTemplate: "원본 템플릿",
  newTemplateName: "새 템플릿 이름",
  required: "*",
  nameHint: "이 복제의 목적이나 변형을 나타내는 설명적인 이름을 선택하세요",
  whatWillHappen: "📋 진행될 작업:",
  createNewTemplate: "새 템플릿 생성",
  copyContent: "내용 복사",
  independentEditing: "독립적인 편집",
  readyToUse: "사용 준비",
  
  // Export Templates
  exportTemplateConfigurations: "템플릿 구성 내보내기",
  exportFormat: "내보내기 형식:",
  exportOnlyModified: "수정된 템플릿만 내보내기 (권장)",
  exportHint: "선택하면 사용자 정의되거나 재정의된 템플릿만 내보냅니다",
  
  // Activation Dialog
  whatIsEnvVar: "📋 환경 변수란 무엇인가요?",
  envVarExplanation: "환경 변수는 프로그램이 시작할 때 읽을 수 있는 설정입니다. MCP 서버는 사용자 정의 템플릿 변수를 확인하여 기본 프롬프트를 재정의합니다. {envVar}를 설정하면 MCP 서버에게 내장된 템플릿 대신 편집된 템플릿을 사용하도록 지시합니다.",
  whyNeedThis: "왜 이것이 필요한가요?",
  whyNeedThisExplanation: "Claude가 MCP 서버를 시작할 때, 응답 방식을 사용자 정의하기 위해 이러한 환경 변수를 읽습니다. 이 변수를 설정하지 않으면 템플릿 편집이 사용되지 않습니다.",
  howToSetVariable: "🚀 이 변수를 설정하는 방법",
  chooseCommand: "설정에 따라 아래에서 적절한 명령을 선택하세요. 이 명령들은 Claude가 시작할 때 사용할 수 있도록 셸 구성 파일(~/.bashrc 또는 ~/.zshrc와 같은)에 변수를 내보냅니다.",
  
  // Messages
  loading: "로딩 중...",
  error: "오류",
  success: "성공",
  noTemplatesFound: "템플릿을 찾을 수 없습니다",
  failedToLoad: "로드 실패",
  
  // Pagination
  showing: "표시 중",
  to: "~",
  of: "중",
  page: "페이지",
  filteredFrom: "필터링됨",
  total: "총",
  
  // Statistics
  totalTemplates: "총 템플릿",
  totalNumberOfTemplates: "총 템플릿 수",
  numberOfDefaultTemplates: "기본 템플릿 수",
  numberOfCustomTemplates: "사용자 정의 템플릿 수",
  numberOfEnvOverrideTemplates: "환경 재정의 템플릿 수",
  default: "기본",
  custom: "사용자 정의", 
  envOverride: "환경 재정의",
  
  // Project management
  readme: "설명서",
  addTab: "프로젝트 추가",
  history: "기록",
  viewProjectHistory: "프로젝트 기록 보기",
  totalTasks: "총 작업",
  completed: "완료",
  inProgress: "진행 중",
  pending: "대기 중",
  autoRefresh: "자동 새로고침",
  
  // History management
  backToTasks: "작업으로 돌아가기",
  backToHistory: "기록으로 돌아가기",
  projectHistory: "프로젝트 기록",
  dateTime: "날짜/시간",
  taskCount: "작업 수",
  notes: "노트",
  statusSummary: "상태 요약",
  viewTasks: "작업 보기",
  noHistoryFound: "기록이 없습니다",
  noHistoryDescription: "이 프로젝트에 사용할 수 있는 과거 작업 스냅샷이 없습니다",
  historyRowTitle: "기록 항목 - 세부 정보를 보려면 작업 보기를 클릭하세요",
  historyEntries: "기록 항목",
  tasksFrom: "작업 출처",
  taskName: "작업 이름",
  noDependencies: "없음",
  created: "생성됨",
  noTasksFound: "작업을 찾을 수 없습니다",
  noTasksMessage: "tasks.json 파일이 아직 생성되지 않았습니다. 작업을 생성하려면 이 폴더에서 shrimp을 실행하세요.",
  noTasksInHistory: "이 기록 스냅샷에는 작업이 없습니다",
  taskRowTitle: "과거 스냅샷의 작업 세부 정보",
  
  // Search and UI
  searchTemplatesPlaceholder: "🔍 템플릿 검색...",
  searchTemplatesTitle: "기능 이름이나 설명으로 템플릿을 검색하고 필터링합니다",
  refreshTemplateData: "템플릿 데이터 새로고침",
  searchTasksPlaceholder: "🔍 작업 검색...",
  searchTasksTitle: "모든 텍스트 내용으로 작업을 검색하고 필터링합니다",
  refreshCurrentProfile: "현재 프로젝트 데이터 새로고침 - 파일에서 작업 다시 로드",
  
  // Project management
  editProjectSettings: "프로젝트 설정 편집",
  chooseProfileTitle: "위의 드롭다운에서 프로젝트를 선택하세요",
  selectProfileToViewTasks: "작업을 보려면 프로젝트를 선택하세요",
  noProfilesAvailable: "사용할 수 있는 프로젝트가 없습니다",
  noProfilesClickAddTab: "사용할 수 있는 프로젝트가 없습니다. \"프로젝트 추가\"를 클릭하여 하나를 만드세요.",
  loadingTasksFromFile: "파일에서 작업 로딩 중",
  loadingTasks: "작업 로딩 중... ⏳",
  
  // Add/Edit Project forms
  addNewProfile: "새 프로젝트 추가",
  profileName: "프로젝트 이름",
  profileNamePlaceholder: "예: 팀 알파 작업",
  profileNameTitle: "이 프로젝트에 대한 설명적인 이름을 입력하세요",
  taskFolderPath: "작업 폴더 경로",
  taskFolderPathPlaceholder: "/path/to/shrimp_data_folder",
  taskFolderPathTitle: "tasks.json이 포함된 shrimp 데이터 폴더 경로를 입력하세요",
  tip: "팁",
  navigateToFolder: "터미널에서 shrimp 데이터 폴더로 이동하여",
  typePwd: "pwd를 입력하여 전체 경로를 얻으세요",
  example: "예",
  projectRootPath: "프로젝트 루트 경로",
  projectRootPlaceholder: "예: /home/user/my-project",
  projectRootTitle: "프로젝트 루트 디렉토리의 절대 경로를 입력하세요",
  projectRootHint: "이를 통해 VS Code에서 열리는 클릭 가능한 파일 링크가 활성화됩니다",
  optional: "선택사항",
  addProfile: "프로젝트 추가",
  cancelAndCloseDialog: "취소하고 이 대화상자를 닫습니다",
  addProject: "프로젝트 추가",
  
  // Edit Project specific
  projectRoot: "프로젝트 루트",
  taskPath: "작업 경로",
  editProfileNameTitle: "프로젝트 이름 편집",
  projectRootEditPlaceholder: "예: /home/user/projects/my-project",
  projectRootEditTitle: "VS Code 파일 링크를 활성화하려면 프로젝트 루트 경로를 설정하세요",
  projectRootEditHint: "작업 파일에 대한 클릭 가능한 VS Code 링크를 활성화하려면 이를 설정하세요",
  taskPathPlaceholder: "/path/to/shrimp_data_folder/tasks.json",
  taskPathTitle: "이 프로젝트의 tasks.json 파일 경로를 편집하세요",
  taskPathHint: "프로젝트의 작업 데이터가 포함된 tasks.json 파일 경로",
  saveChanges: "변경사항 저장",
  
  // Toast messages with parameters
  profileAddedSuccess: "프로젝트 \"{name}\"이 성공적으로 추가되었습니다!",
  profileRemovedSuccess: "프로젝트 \"{name}\"이 성공적으로 제거되었습니다!",
  templateSavedSuccess: "템플릿 \"{name}\"이 성공적으로 저장되었습니다!",
  templateResetSuccess: "템플릿 \"{name}\"이 기본으로 재설정되었습니다!",
  templateDuplicatedSuccess: "템플릿이 \"{name}\"으로 복제되었습니다!",
  rememberToRestartClaude: "💡 환경 변수를 설정한 후 Claude Code를 다시 시작하는 것을 잊지 마세요",
  
  // Confirmation dialogs
  confirmRemoveProfile: "이 프로젝트를 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  confirmResetTemplate: "{name}을 기본으로 재설정하시겠습니까? 모든 사용자 정의 설정이 제거됩니다.",
  
  // Template activation
  defaultTemplateAlreadyActive: "기본 템플릿이 이미 활성화되어 있습니다 - 활성화가 필요하지 않습니다",
  
  // Duplicate Template View additional keys
  noTemplateSelected: "선택된 템플릿이 없습니다",
  pleaseEnterDuplicateName: "복제 템플릿의 이름을 입력하세요",
  duplicateNameMustBeDifferent: "복제 이름은 원본과 다르게 지정해야 합니다",
  failedToDuplicateTemplate: "템플릿 복제 실패",
  backToTemplateList: "템플릿 목록으로 돌아가기",
  creatingDuplicate: "복제 생성 중...",
  
  // Task Table
  task: "작업",
  taskName: "작업 이름",
  created: "생성됨",
  updated: "업데이트됨",
  dependencies: "종속성",
  noTasksFound: "이 프로젝트에서 작업을 찾을 수 없습니다",
  noDescriptionProvided: "설명이 제공되지 않았습니다",
  viewTask: "작업 보기",
  clickToCopyUuid: "UUID를 클립보드에 복사하려면 클릭하세요",
  copyTaskInstruction: "클립보드에 다음을 복사합니다: 작업 관리자를 사용하여 이 shrimp 작업 완료",
  useTaskManager: "작업 관리자를 사용하여 이 shrimp 작업 완료",
  clickToViewTaskDetails: "작업 세부 정보를 보려면 클릭하세요",
  
  // Template Editor
  saving: "저장 중...",
  saveTemplate: "템플릿 저장",
  
  // Project Settings
  projectSettings: "프로젝트 설정",
  settingsSaved: "설정이 성공적으로 저장되었습니다",
  settings: "설정",
  
  // Global Settings
  globalSettings: "전역 설정",
  claudeFolderPath: "Claude 폴더 경로",
  claudeFolderPathDesc: "Claude 폴더 경로를 지정하면 서브 에이전트 및 후크 설정에 액세스할 수 있습니다",
  claudeFolderPathPlaceholder: "예: ~/.config/claude",
  
  // Task messages
  taskSavedSuccess: "작업이 성공적으로 저장되었습니다",
  confirmDeleteTask: "이 작업을 삭제하시겠습니까?",
  taskDeletedSuccess: "작업이 성공적으로 삭제되었습니다",
  deleteTask: "작업 삭제",
  
  // Agent functionality
  subAgents: "서브 에이전트",
  agents: "에이전트", 
  agentName: "에이전트 이름",
  type: "유형",
  viewAgent: "에이전트 보기",
  editAgent: "에이전트 편집",
  noAgentsFound: "에이전트를 찾을 수 없습니다",
  agentSavedSuccess: "에이전트가 성공적으로 저장되었습니다",
  aiInstruction: "AI 지시사항",
  
  // Additional UI strings for comprehensive coverage
  // Bulk operations
  bulkActions: "일괄 작업",
  selectAll: "모두 선택",
  clearSelection: "선택 해제",
  selectedItems: "선택된 항목",
  aiAssignAgents: "🤖 AI 에이전트 할당",
  bulkAssignAgents: "선택된 작업에 에이전트 일괄 할당",
  
  // OpenAI Integration
  openaiApiKey: "OpenAI API 키",
  openaiKeyConfigured: "✓ 구성됨",
  openaiKeyNotConfigured: "구성되지 않음",
  enterOpenaiKey: "OpenAI API 키를 입력하세요",
  openaiKeyRequired: "AI 에이전트 할당을 위해 OpenAI API 키가 필요합니다",
  getApiKey: "API 키 받기",
  
  // Agent assignment
  assignAgent: "에이전트 할당",
  agentAssigned: "에이전트가 할당됨",
  noAgentAssigned: "할당된 에이전트 없음",
  selectAgent: "에이전트 선택",
  agentColor: "에이전트 색상",
  agentMetadata: "에이전트 메타데이터",
  
  // File operations
  relatedFiles: "관련 파일",
  fileType: "파일 유형",
  filePath: "파일 경로",
  lineNumbers: "줄 번호",
  openInEditor: "에디터에서 열기",
  copyFilePath: "파일 경로 복사",
  
  // Navigation
  previous: "이전",
  next: "다음",
  firstPage: "첫 페이지",
  lastPage: "마지막 페이지",
  goToPage: "페이지로 이동",
  
  // Status indicators
  active: "활성",
  inactive: "비활성",
  enabled: "활성화됨",
  disabled: "비활성화됨",
  available: "사용 가능",
  unavailable: "사용 불가",
  
  // Time and dates
  today: "오늘",
  yesterday: "어제",
  thisWeek: "이번 주",
  thisMonth: "이번 달",
  lastModified: "마지막 수정",
  dateCreated: "생성 날짜",
  
  // Tooltips and help text
  tooltipCopyUuid: "작업 UUID를 클립보드에 복사",
  tooltipRefresh: "데이터 새로고침",
  tooltipSettings: "설정 열기",
  tooltipHelp: "도움말 보기",
  tooltipLanguage: "언어 변경",
  
  // Error states
  connectionError: "연결 오류",
  loadError: "로드 오류",
  saveError: "저장 오류",
  networkError: "네트워크 오류",
  permissionError: "권한 오류",
  
  // Empty states
  noData: "데이터 없음",
  noResults: "결과 없음",
  emptyList: "빈 목록",
  noContent: "콘텐츠 없음",
  
  // Actions and buttons
  refresh: "새로고침",
  reload: "다시 로드",
  clear: "지우기",
  reset: "재설정",
  apply: "적용",
  confirm: "확인",
  proceed: "계속",
  retry: "다시 시도",
  
  // Modal and dialog actions
  closeModal: "모달 닫기",
  openModal: "모달 열기",
  dialogTitle: "대화상자 제목",
  confirmAction: "작업 확인",
  
  // Keyboard shortcuts
  keyboardShortcuts: "키보드 단축키",
  pressEnter: "Enter 키를 누르세요",
  pressEscape: "Escape 키를 누르세요",
  useArrowKeys: "화살표 키를 사용하세요"
};