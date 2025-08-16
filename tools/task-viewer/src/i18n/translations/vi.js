export const translations = {
  // Header
  appTitle: "🦐 Shrimp Task Manager Viewer",
  version: "Phiên bản",
  releaseNotes: "Ghi chú Phát hành",
  help: "Trợ giúp",
  language: "Ngôn ngữ",
  
  // Navigation tabs
  tasks: "Tác vụ",
  templates: "Template",
  projects: "Dự án",
  
  // Template Management
  templateManagement: "🎨 Quản lý Template",
  templateManagementDesc: "Quản lý template prompt cho tất cả tính năng task manager. Chỉnh sửa, nhân bản hoặc reset template để tùy chỉnh hành vi AI.",
  exportTemplates: "📤 Xuất Template",
  exportTemplatesDesc: "Xuất cấu hình template để chia sẻ với nhóm hoặc sao lưu cho sau này.",
  
  // Template columns
  function: "Chức năng",
  description: "Mô tả",
  status: "Trạng thái",
  actions: "Hành động",
  
  // Template statuses
  statusDefault: "Mặc định",
  statusCustom: "Tùy chỉnh",
  statusCustomAppend: "Tùy chỉnh+Thêm",
  
  // Template actions
  edit: "Chỉnh sửa",
  editTemplate: "✏️ Chỉnh sửa Template",
  preview: "Xem trước",
  previewTemplate: "Xem trước: {name}",
  duplicate: "Nhân bản",
  duplicateTemplate: "📋 Nhân bản Template",
  activate: "Kích hoạt",
  activateTemplate: "🚀 Kích hoạt Template",
  reset: "Reset",
  resetToDefault: "Reset về Template Mặc định",
  
  // Common actions
  save: "Lưu",
  cancel: "Hủy",
  back: "Quay lại",
  backToTemplates: "← Quay lại Template",
  close: "Đóng",
  
  // Duplicate Template View
  whyDuplicate: "📚 Tại sao Nhân bản Template?",
  duplicateExplanation: "Nhân bản template cho phép bạn tạo các phiên bản chuyên biệt của template hiện có cho các trường hợp sử dụng khác nhau:",
  createVariations: "🎯 Tạo các Biến thể",
  createVariationsDesc: "Tạo các phiên bản chuyên biệt cho các ngữ cảnh khác nhau:",
  safeExperimentation: "🧪 Thử nghiệm An toàn",
  safeExperimentationDesc: "Kiểm tra thay đổi mà không ảnh hưởng đến template hoạt động:",
  templateLibraries: "📂 Thư viện Template",
  templateLibrariesDesc: "Xây dựng bộ sưu tập template liên quan:",
  versionManagement: "💾 Quản lý Phiên bản",
  versionManagementDesc: "Giữ các phiên bản khác nhau cho các nhu cầu khác nhau:",
  
  // Duplicate form
  createDuplicate: "📝 Tạo Bản sao",
  originalTemplate: "Template Gốc",
  newTemplateName: "Tên Template Mới",
  required: "*",
  nameHint: "Chọn tên có ý nghĩa xác định mục đích hoặc biến thể của bản sao này",
  whatWillHappen: "📋 Điều gì sẽ xảy ra:",
  createNewTemplate: "Tạo template mới",
  copyContent: "Sao chép nội dung",
  independentEditing: "Chỉnh sửa độc lập",
  readyToUse: "Sẵn sàng sử dụng",
  
  // Export Templates
  exportTemplateConfigurations: "Xuất Cấu hình Template",
  exportFormat: "Định dạng xuất:",
  exportOnlyModified: "Chỉ xuất template đã sửa đổi (Khuyến nghị)",
  exportHint: "Khi được chọn, chỉ xuất template tùy chỉnh hoặc ghi đè.",
  
  // Activation Dialog
  whatIsEnvVar: "📋 Biến Môi trường là gì?",
  envVarExplanation: "Biến môi trường là cài đặt mà chương trình có thể đọc khi khởi động. MCP server sẽ kiểm tra các biến template tùy chỉnh để ghi đè prompt mặc định. Thiết lập {envVar} sẽ nói với MCP server sử dụng template đã chỉnh sửa thay vì template tích hợp.",
  whyNeedThis: "Tại sao cần điều này?",
  whyNeedThisExplanation: "Khi Claude khởi động, MCP server đọc các biến môi trường này để tùy chỉnh cách nó phản hồi. Nếu không thiết lập biến này, chỉnh sửa template sẽ không có tác dụng.",
  howToSetVariable: "🚀 Cách thiết lập biến này",
  chooseCommand: "Chọn lệnh phù hợp dưới đây dựa trên thiết lập của bạn. Các lệnh này sẽ xuất biến vào file cấu hình shell (như ~/.bashrc hoặc ~/.zshrc) để Claude có thể sử dụng khi khởi động.",
  
  // Messages
  loading: "Đang tải...",
  error: "Lỗi",
  success: "Thành công",
  noTemplatesFound: "Không tìm thấy template",
  failedToLoad: "Tải thất bại",
  
  // Pagination
  showing: "Hiển thị",
  to: "đến",
  of: "trên",
  page: "Trang",
  filteredFrom: "được lọc từ",
  total: "tổng",
  
  // Statistics
  totalTemplates: "Tổng Template",
  totalNumberOfTemplates: "Tổng số Template",
  numberOfDefaultTemplates: "Số Template Mặc định",
  numberOfCustomTemplates: "Số Template Tùy chỉnh",
  numberOfEnvOverrideTemplates: "Số Template Ghi đè Môi trường",
  default: "Mặc định",
  custom: "Tùy chỉnh", 
  envOverride: "Ghi đè Môi trường",
  
  // Project management
  readme: "Đọc",
  addTab: "Thêm Dự án",
  history: "Lịch sử",
  viewProjectHistory: "Xem Lịch sử Dự án",
  totalTasks: "Tổng Tác vụ",
  completed: "Hoàn thành",
  inProgress: "Đang thực hiện",
  pending: "Đang chờ",
  autoRefresh: "Tự động làm mới",
  
  // History management
  backToTasks: "Quay lại Tác vụ",
  backToHistory: "Quay lại Lịch sử",
  projectHistory: "Lịch sử Dự án",
  dateTime: "Ngày/Giờ",
  taskCount: "Số lượng Tác vụ",
  notes: "Ghi chú",
  statusSummary: "Tóm tắt Trạng thái",
  viewTasks: "Xem Tác vụ",
  noHistoryFound: "Không tìm thấy lịch sử",
  noHistoryDescription: "Không có snapshot tác vụ trong quá khứ cho dự án này",
  historyRowTitle: "Mục lịch sử - nhấp 'Xem Tác vụ' để xem chi tiết",
  historyEntries: "Mục Lịch sử",
  tasksFrom: "Tác vụ từ",
  taskName: "Tên Tác vụ",
  noDependencies: "Không có",
  created: "Đã tạo",
  noTasksFound: "Không tìm thấy tác vụ",
  noTasksMessage: "Chưa có file tasks.json được tạo. Để tạo tác vụ, chạy shrimp trong thư mục này",
  noTasksInHistory: "Snapshot lịch sử này không có tác vụ",
  taskRowTitle: "Chi tiết tác vụ từ snapshot lịch sử",
  
  // Search and UI
  searchTemplatesPlaceholder: "🔍 Tìm kiếm template...",
  searchTemplatesTitle: "Tìm kiếm và lọc template theo tên chức năng hoặc mô tả",
  refreshTemplateData: "Làm mới dữ liệu template",
  searchTasksPlaceholder: "🔍 Tìm kiếm tác vụ...",
  searchTasksTitle: "Tìm kiếm và lọc tác vụ theo bất kỳ nội dung văn bản nào",
  refreshCurrentProfile: "Làm mới dữ liệu dự án hiện tại - tải tác vụ từ file mới",
  
  // Project management
  editProjectSettings: "Chỉnh sửa Cài đặt Dự án",
  chooseProfileTitle: "Chọn dự án từ dropdown ở trên",
  selectProfileToViewTasks: "Chọn dự án để xem tác vụ",
  noProfilesAvailable: "Không có dự án nào",
  noProfilesClickAddTab: "Không có dự án nào. Nhấp \"Thêm Dự án\" để tạo dự án",
  loadingTasksFromFile: "Đang tải tác vụ từ file",
  loadingTasks: "Đang tải tác vụ... ⏳",
  
  // Add/Edit Project forms
  addNewProfile: "Thêm Dự án Mới",
  profileName: "Tên Dự án",
  profileNamePlaceholder: "ví dụ: Tác vụ Nhóm Alpha",
  profileNameTitle: "Nhập tên có ý nghĩa cho dự án này",
  taskFolderPath: "Đường dẫn Thư mục Tác vụ",
  taskFolderPathPlaceholder: "/path/to/shrimp_data_folder",
  taskFolderPathTitle: "Nhập đường dẫn đến thư mục dữ liệu shrimp chứa tasks.json",
  tip: "Mẹo",
  navigateToFolder: "Điều hướng đến thư mục dữ liệu shrimp trong terminal và",
  typePwd: "gõ pwd để lấy đường dẫn đầy đủ",
  example: "Ví dụ",
  projectRootPath: "Đường dẫn Root Dự án",
  projectRootPlaceholder: "ví dụ: /home/user/my-project",
  projectRootTitle: "Nhập đường dẫn tuyệt đối đến thư mục root dự án",
  projectRootHint: "Điều này sẽ kích hoạt liên kết file có thể nhấp mở trong VS Code",
  optional: "Tùy chọn",
  addProfile: "Thêm Dự án",
  cancelAndCloseDialog: "Hủy và đóng dialog này",
  addProject: "Thêm Dự án",
  
  // Edit Project specific
  projectRoot: "Root Dự án",
  taskPath: "Đường dẫn Tác vụ",
  editProfileNameTitle: "Chỉnh sửa tên dự án",
  projectRootEditPlaceholder: "ví dụ: /home/user/projects/my-project",
  projectRootEditTitle: "Thiết lập đường dẫn root dự án để kích hoạt liên kết file VS Code",
  projectRootEditHint: "Thiết lập này để kích hoạt liên kết VS Code có thể nhấp cho file tác vụ",
  taskPathPlaceholder: "/path/to/shrimp_data_folder/tasks.json",
  taskPathTitle: "Chỉnh sửa đường dẫn đến file tasks.json cho dự án này",
  taskPathHint: "Đường dẫn đến file tasks.json chứa dữ liệu tác vụ của dự án",
  saveChanges: "Lưu Thay đổi",
  
  // Toast messages with parameters
  profileAddedSuccess: "Thêm dự án \"{name}\" thành công!",
  profileRemovedSuccess: "Xóa dự án \"{name}\" thành công!",
  templateSavedSuccess: "Lưu template \"{name}\" thành công!",
  templateResetSuccess: "Reset template \"{name}\" về mặc định!",
  templateDuplicatedSuccess: "Nhân bản template thành \"{name}\"!",
  rememberToRestartClaude: "💡 Nhớ khởi động lại Claude Code sau khi thiết lập biến môi trường",
  
  // Confirmation dialogs
  confirmRemoveProfile: "Bạn có chắc chắn muốn xóa dự án này? Hành động này không thể hoàn tác.",
  confirmResetTemplate: "Bạn có chắc chắn muốn reset {name} về mặc định? Tất cả tùy chỉnh sẽ bị mất.",
  
  // Template activation
  defaultTemplateAlreadyActive: "Template mặc định đã hoạt động - không cần kích hoạt",
  
  // Duplicate Template View additional keys
  noTemplateSelected: "Không có template được chọn",
  pleaseEnterDuplicateName: "Vui lòng nhập tên cho template nhân bản",
  duplicateNameMustBeDifferent: "Tên nhân bản phải khác với tên gốc",
  failedToDuplicateTemplate: "Nhân bản template thất bại",
  backToTemplateList: "Quay lại Danh sách Template",
  creatingDuplicate: "Đang tạo bản sao...",
  
  // Task Table
  task: "Tác vụ",
  taskName: "Tên Tác vụ",
  created: "Đã tạo",
  updated: "Đã cập nhật",
  dependencies: "Phụ thuộc",
  noTasksFound: "Không tìm thấy tác vụ trong dự án này",
  noDescriptionProvided: "Không có mô tả",
  viewTask: "Xem Tác vụ",
  clickToCopyUuid: "Nhấp để sao chép UUID vào clipboard",
  copyTaskInstruction: "Sao chép sau vào clipboard: Sử dụng task manager để hoàn thành tác vụ shrimp này",
  useTaskManager: "Sử dụng task manager để hoàn thành tác vụ shrimp này",
  clickToViewTaskDetails: "Nhấp để xem chi tiết tác vụ",
  
  // Template Editor
  saving: "Đang lưu...",
  saveTemplate: "Lưu Template",
  
  // Project Settings
  projectSettings: "Cài đặt Dự án",
  settingsSaved: "Lưu cài đặt thành công",
  settings: "Cài đặt",
  
  // Global Settings
  globalSettings: "Cài đặt Toàn cục",
  claudeFolderPath: "Đường dẫn Thư mục Claude",
  claudeFolderPathDesc: "Chỉ định đường dẫn thư mục Claude sẽ cho phép truy cập cài đặt subagent và hook",
  claudeFolderPathPlaceholder: "ví dụ: ~/.config/claude",
  
  // Task messages
  taskSavedSuccess: "Lưu tác vụ thành công",
  confirmDeleteTask: "Bạn có chắc chắn muốn xóa tác vụ này?",
  taskDeletedSuccess: "Xóa tác vụ thành công",
  deleteTask: "Xóa Tác vụ",
  
  // Agent functionality
  subAgents: "Sub-Agent",
  agents: "Agent", 
  agentName: "Tên Agent",
  type: "Loại",
  viewAgent: "Xem Agent",
  editAgent: "Chỉnh sửa Agent",
  noAgentsFound: "Không tìm thấy agent",
  agentSavedSuccess: "Lưu agent thành công",
  aiInstruction: "Hướng dẫn AI"
};