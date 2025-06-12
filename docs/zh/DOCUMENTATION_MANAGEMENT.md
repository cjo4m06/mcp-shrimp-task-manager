# 📁 文檔路徑管理指南

[English](../DOCUMENTATION_MANAGEMENT.md) | [中文](DOCUMENTATION_MANAGEMENT.md)

## 概述

蝦米任務管理器提供了一個精密的文檔管理系統，靈感來自 [claude-task-master](https://github.com/eyaltoledano/claude-task-master) 的 `.taskmaster/` 目錄結構。該系統自動將 AI 生成的文檔組織成結構化層次，確保專案特定隔離和團隊協作效率。

## 🎯 主要特性

- **自動組織**：文檔按類型和用途分類
- **專案隔離**：每個專案維護自己的文檔結構
- **團隊協作**：為知識分享提供結構化路徑
- **安全性**：路徑驗證防止遍歷攻擊
- **跨平台**：在 Windows、macOS 和 Linux 上運行

## 📁 目錄結構

```
$DATA_DIR/projects/$PROJECT_NAME/docs/
├── project/                  # 核心專案文檔
│   ├── README.md            # 專案介紹
│   ├── ARCHITECTURE.md      # 技術架構
│   ├── ROADMAP.md           # 專案路線圖
│   └── CHANGELOG.md         # 變更日誌
├── prd/                      # 產品需求文檔
│   ├── main-prd.md          # 主要 PRD
│   ├── milestone-1.md       # 里程碑 PRD
│   ├── milestone-2.md
│   └── features/            # 功能特定 PRD
│       ├── feature-a.md
│       └── feature-b.md
├── tasks/                    # 任務相關文檔
│   ├── completed/           # 已完成任務總結
│   ├── in-progress/         # 進行中任務分析
│   ├── pending/             # 待執行任務規劃
│   └── by-role/             # 按角色分類的任務
│       ├── frontend/        # 前端開發任務
│       ├── backend/         # 後端開發任務
│       ├── qa/              # 品質保證任務
│       ├── devops/          # 運維任務
│       └── design/          # 設計任務
├── analysis/                 # 分析報告
│   ├── complexity/          # 複雜度分析
│   ├── risk/                # 風險評估
│   ├── performance/         # 性能分析
│   └── security/            # 安全分析
├── reflection/               # 反思和回顧
│   ├── sprint-reviews/      # 衝刺回顧
│   ├── lessons-learned/     # 經驗教訓
│   └── improvements/        # 改進建議
├── research/                 # 研究文檔
│   ├── technology/          # 技術研究
│   ├── competitors/         # 競品分析
│   └── best-practices/      # 最佳實踐
├── team/                     # 團隊協作
│   ├── knowledge-base/      # 團隊知識庫
│   ├── collaboration/       # 協作模式
│   ├── roles/               # 角色定義
│   └── workflows/           # 工作流程文檔
└── templates/                # 文檔模板
    ├── prd-template.md      # PRD 模板
    ├── task-template.md     # 任務模板
    ├── analysis-template.md # 分析模板
    └── review-template.md   # 回顧模板
```

## 🔧 使用方法

### 自動路徑管理

系統在創建文檔時會自動使用正確的路徑。AI 助手會被引導使用 `get_documentation_path` 工具來獲取適當的存儲路徑。

### 手動路徑請求

您可以使用 MCP 工具明確請求文檔路徑：

```
# 獲取分析報告路徑
get_documentation_path(subDir="analysis", filename="complexity-analysis.md")

# 獲取任務總結路徑
get_documentation_path(subDir="tasks/completed", filename="task-123-summary.md")

# 獲取團隊知識庫路徑
get_documentation_path(subDir="team/knowledge-base", filename="frontend-best-practices.md")

# 僅獲取目錄路徑
get_documentation_path(subDir="research/technology")
```

### 文檔分類指南

#### 按文檔類型：
- **專案文檔** → `project/` (README、架構、技術規格)
- **需求文檔** → `prd/` (產品需求、功能規格、里程碑)
- **任務文檔** → `tasks/` (任務分析、執行總結、角色任務)
- **分析報告** → `analysis/` (複雜度、風險、性能、安全)
- **反思總結** → `reflection/` (專案回顧、經驗教訓、改進)
- **研究文檔** → `research/` (技術研究、競品分析、解決方案)
- **團隊文檔** → `team/` (知識分享、協作流程、最佳實踐)

#### 按角色：
- **前端開發** → `tasks/by-role/frontend/`
- **後端開發** → `tasks/by-role/backend/`
- **品質保證** → `tasks/by-role/qa/`
- **運維部署** → `tasks/by-role/devops/`
- **UI/UX 設計** → `tasks/by-role/design/`

## 🛡️ 安全特性

- **路徑驗證**：防止目錄遍歷攻擊
- **保留名稱檢查**：避免系統保留名稱（Windows 兼容性）
- **長度限制**：強制執行合理的文件名長度
- **跨平台安全**：在各操作系統上一致運行

## 💡 最佳實踐

### 文件命名規範
- 使用描述性名稱：`complexity-analysis-2025-01-07.md`
- 在相關時包含日期或版本
- 避免特殊字符和空格
- 使用小寫字母和連字符保持一致性

### 內容組織
- 每個文檔都應有明確的目的和受眾
- 使用標準 Markdown 格式
- 包含元數據（創建時間、作者、版本）
- 保持文檔的新鮮度和準確性

### 版本管理
- 重要文檔應包含版本歷史
- 定期歸檔過時文檔
- 使用清晰的版本方案（v1.0、v1.1 等）

## 🔄 與任務管理的集成

文檔系統與蝦米任務管理器的任務執行無縫集成：

1. **任務分析** → 文檔存儲在 `analysis/`
2. **任務執行** → 進度追蹤在 `tasks/in-progress/`
3. **任務完成** → 總結保存在 `tasks/completed/`
4. **團隊協作** → 知識分享在 `team/knowledge-base/`

## 🚀 開始使用

1. **啟用功能**：文檔路徑管理自動可用
2. **開始創建文檔**：AI 助手會自動使用正確路徑
3. **按類型組織**：遵循目錄結構指南
4. **有效協作**：使用團隊目錄進行知識分享

## 📚 相關文檔

- [主要 README](README.md) - 專案概述和設置
- [測試指南](../../TESTING.md) - 測試文檔
- [提示詞自定義](../../prompt-customization.md) - 自定義 AI 行為

## 🤝 貢獻

貢獻文檔時：
- 遵循既定的目錄結構
- 使用一致的命名規範
- 包含適當的元數據
- 測試跨平台兼容性
- 添加新文檔類型時更新本指南
