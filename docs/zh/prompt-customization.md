[English](../en/prompt-customization.md) | [中文](../zh/prompt-customization.md)

# Prompt 自定義指南

## 概述

本系統允許用戶透過環境變數自定義各個工具函式的指導內容（prompt）。這提供了高度的彈性，使您能夠根據特定需求調整 AI 助手的行為表現，而不需要修改程式碼。有兩種自定義方式：

1. **覆蓋模式**：完全取代原本的 prompt
2. **追加模式**：在原有 prompt 的基礎上增加新內容

## 環境變數命名規則

- 覆蓋模式：`MCP_PROMPT_[FUNCTION_NAME]`
- 追加模式：`MCP_PROMPT_[FUNCTION_NAME]_APPEND`

其中 `[FUNCTION_NAME]` 是工具函式的名稱，大寫形式。例如，對於任務規劃功能 `planTask`，相應的環境變數名稱為 `MCP_PROMPT_PLAN_TASK`。

## 多語言提示詞模板支持

蝦米任務管理器支持多種語言的提示詞模板，可通過 `TEMPLATES_USE` 環境變數設置：

- 當前支持的語言：`en`（英文）和 `zh`（繁體中文）
- 默認為 `en`（英文）

### 切換語言

在 `mcp.json` 配置中設置：

```json
"env": {
  "TEMPLATES_USE": "zh"  // 使用繁體中文模板
}
```

或在 `.env` 文件中設置：

```
TEMPLATES_USE=zh
```

### 自定義模板

您可以創建自己的模板集：

1. 將現有模板集（如 `src/prompts/templates_en` 或 `src/prompts/templates_zh`）複製到 `DATA_DIR` 指定的目錄
2. 重命名複製的目錄（例如：`my_templates`）
3. 修改模板文件以符合您的需求
4. 將 `TEMPLATES_USE` 環境變數設置為您的模板目錄名稱：

```json
"env": {
  "DATA_DIR": "/path/to/project/data",
  "TEMPLATES_USE": "my_templates"
}
```

系統將優先使用您的自定義模板，如果找不到特定模板文件，會回退到內置的英文模板。

## 支援的工具函式

系統中的所有主要功能都支援透過環境變數自定義 prompt：

| 功能名稱           | 環境變數前綴                    | 說明           |
| ------------------ | ------------------------------- | -------------- |
| `planTask`         | `MCP_PROMPT_PLAN_TASK`          | 任務規劃       |
| `analyzeTask`      | `MCP_PROMPT_ANALYZE_TASK`       | 任務分析       |
| `reflectTask`      | `MCP_PROMPT_REFLECT_TASK`       | 方案評估       |
| `splitTasks`       | `MCP_PROMPT_SPLIT_TASKS`        | 任務拆分       |
| `executeTask`      | `MCP_PROMPT_EXECUTE_TASK`       | 任務執行       |
| `verifyTask`       | `MCP_PROMPT_VERIFY_TASK`        | 任務驗證       |
| `listTasks`        | `MCP_PROMPT_LIST_TASKS`         | 列出任務       |
| `queryTask`        | `MCP_PROMPT_QUERY_TASK`         | 查詢任務       |
| `getTaskDetail`    | `MCP_PROMPT_GET_TASK_DETAIL`    | 獲取任務詳情   |
| `processThought`   | `MCP_PROMPT_PROCESS_THOUGHT`    | 思維鏈處理     |
| `initProjectRules` | `MCP_PROMPT_INIT_PROJECT_RULES` | 初始化專案規則 |

## 環境變數配置方法

有兩種主要的配置方式：

### 1. 透過 `.env` 文件設置環境變數

1. 在專案根目錄複製 `.env.example` 改名為 `.env` 文件
2. 添加所需的環境變數配置
3. 應用程式啟動時會自動載入這些環境變數

```
# .env 文件範例
MCP_PROMPT_PLAN_TASK=自定義的 prompt 內容
MCP_PROMPT_ANALYZE_TASK=自定義的分析 prompt 內容
```

> 注意：確保 `.env` 文件在版本控制中被忽略（添加到 `.gitignore`），特別是當它包含敏感信息時。

### 2. 直接在 mcp.json 配置文件中設置

您也可以直接在 Cursor IDE 的 `mcp.json` 配置文件中設置環境變數，這樣無需另外創建 `.env` 文件：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data",
        "MCP_PROMPT_PLAN_TASK": "自定義的任務規劃提示詞",
        "MCP_PROMPT_EXECUTE_TASK_APPEND": "額外的任務執行指導"
      }
    }
  }
}
```

這種方式的優點是可以將提示詞配置與其他 MCP 配置放在一起管理，特別適合需要針對不同專案使用不同提示詞的情況。

## 使用範例

### 覆蓋模式範例

```
# .env 文件中完全替換 PLAN_TASK 的 prompt
MCP_PROMPT_PLAN_TASK=## 自定義任務規劃\n\n請根據以下資訊規劃任務：\n\n{description}\n\n要求：{requirements}\n
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_PLAN_TASK": "## 自定義任務規劃\n\n請根據以下資訊規劃任務：\n\n{description}\n\n要求：{requirements}\n"
}
```

### 追加模式範例

```
# .env 文件中在 PLAN_TASK 原有 prompt 後追加內容
MCP_PROMPT_PLAN_TASK_APPEND=\n\n## 額外指導\n\n請特別注意以下事項：\n1. 優先考慮任務間的依賴關係\n2. 盡量減少任務耦合度
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_PLAN_TASK_APPEND": "\n\n## 額外指導\n\n請特別注意以下事項：\n1. 優先考慮任務間的依賴關係\n2. 盡量減少任務耦合度"
}
```

## 動態參數支援

自定義 prompt 也可以使用定義的動態參數，方式是使用 `{paramName}` 語法。系統會在處理時將這些佔位符替換為實際的參數值。

各個函式支援的參數如下：

### planTask 支援的參數

- `{description}` - 任務描述
- `{requirements}` - 任務要求
- `{existingTasksReference}` - 是否參考現有任務
- `{completedTasks}` - 已完成任務列表
- `{pendingTasks}` - 待處理任務列表
- `{memoryDir}` - 任務記憶儲存目錄

### analyzeTask 支援的參數

- `{summary}` - 任務摘要
- `{initialConcept}` - 初始概念
- `{previousAnalysis}` - 先前分析結果

### reflectTask 支援的參數

- `{summary}` - 任務摘要
- `{analysis}` - 分析結果

### splitTasks 支援的參數

- `{updateMode}` - 更新模式
- `{createdTasks}` - 創建的任務
- `{allTasks}` - 所有任務

### executeTask 支援的參數

- `{task}` - 任務詳情
- `{complexityAssessment}` - 複雜度評估結果
- `{relatedFilesSummary}` - 相關文件摘要
- `{dependencyTasks}` - 依賴任務
- `{potentialFiles}` - 可能相關的文件

### verifyTask 支援的參數

- `{task}` - 任務詳情

### listTasks 支援的參數

- `{status}` - 任務狀態
- `{tasks}` - 按狀態分組的任務
- `{allTasks}` - 所有任務

### queryTask 支援的參數

- `{query}` - 查詢內容
- `{isId}` - 是否為 ID 查詢
- `{tasks}` - 查詢結果
- `{totalTasks}` - 總結果數
- `{page}` - 當前頁碼
- `{pageSize}` - 每頁大小
- `{totalPages}` - 總頁數

### getTaskDetail 支援的參數

- `{taskId}` - 任務 ID
- `{task}` - 任務詳情
- `{error}` - 錯誤信息（如有）

## 進階自定義案例

### 示例 1：添加品牌客製化提示

假設您想要在所有任務執行指南中添加公司特定的品牌資訊和指導原則：

```
# 在 .env 文件中配置
MCP_PROMPT_EXECUTE_TASK_APPEND=\n\n## 公司特定指南\n\n在執行任務時，請遵循以下原則：\n1. 保持代碼與公司風格指南一致\n2. 所有新功能必須有對應的單元測試\n3. 文檔必須使用公司標準模板\n4. 確保所有用戶界面元素符合品牌設計規範
```

### 示例 2：調整任務分析風格

假設您想要讓任務分析更加偏向安全性考量：

```
# 在 .env 文件中配置
MCP_PROMPT_ANALYZE_TASK=## 安全導向任務分析\n\n請針對以下任務進行全面的安全分析：\n\n**任務摘要:**\n{summary}\n\n**初步概念:**\n{initialConcept}\n\n在分析過程中，請特別關注：\n1. 代碼注入風險\n2. 權限管理問題\n3. 資料驗證和清理\n4. 第三方依賴的安全風險\n5. 配置錯誤的可能性\n\n每個潛在問題請提供：\n- 問題描述\n- 影響程度（低/中/高）\n- 建議的解決方案\n\n{previousAnalysis}
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_ANALYZE_TASK": "## 安全導向任務分析\n\n請針對以下任務進行全面的安全分析：\n\n**任務摘要:**\n{summary}\n\n**初步概念:**\n{initialConcept}\n\n在分析過程中，請特別關注：\n1. 代碼注入風險\n2. 權限管理問題\n3. 資料驗證和清理\n4. 第三方依賴的安全風險\n5. 配置錯誤的可能性\n\n每個潛在問題請提供：\n- 問題描述\n- 影響程度（低/中/高）\n- 建議的解決方案\n\n{previousAnalysis}"
}
```

### 示例 3：簡化任務列表顯示

如果您覺得默認任務列表過於詳細，可以簡化顯示：

```
# 在 .env 文件中配置
MCP_PROMPT_LIST_TASKS=# 任務概覽\n\n## 待處理任務\n{tasks.pending}\n\n## 進行中任務\n{tasks.in_progress}\n\n## 已完成任務\n{tasks.completed}
```

或在 mcp.json 中配置：

```json
"env": {
  "MCP_PROMPT_LIST_TASKS": "# 任務概覽\n\n## 待處理任務\n{tasks.pending}\n\n## 進行中任務\n{tasks.in_progress}\n\n## 已完成任務\n{tasks.completed}"
}
```

## 最佳實踐

1. **逐步調整**：從小的變更開始，確保每次修改後系統仍能正常工作。

2. **保存配置**：將有效的環境變數配置保存到專案的 `.env.example` 文件中，方便團隊成員參考。

3. **注意格式**：確保 prompt 中的換行和格式正確，特別是使用引號包裹的環境變數。

4. **測試驗證**：在不同的場景下測試自定義的 prompt，確保它們在各種情況下都能正常工作。

5. **考慮任務流**：修改 prompt 時考慮整個任務流程，確保不同階段的 prompt 保持一致性。

## 故障排除

- **環境變數未生效**：確保您已經正確設置環境變數，並在設置後重新啟動應用程式。

- **格式問題**：檢查環境變數中的換行符號和特殊字符是否正確轉義。

- **參數替換失敗**：確保您使用的參數名稱與系統支援的一致，包括大小寫。

- **還原默認設置**：如果自定義的 prompt 導致問題，可以刪除相應的環境變數恢復默認設置。

## 附錄：默認 Prompt 參考

為幫助您更好地自定義 prompt，這裡提供了部分系統默認 prompt 的參考。您可以在這些基礎上進行修改或擴展：

### planTask 默認 prompt 示例

```
## 任務規劃指南

基於以下描述和要求，請制定一個詳細的任務計劃：

描述：
{description}

要求：
{requirements}

...
```

> 注意：完整的默認 prompt 內容可在專案的 `src/prompts/templates` 目錄下查看相應的模板文件。
