**請嚴格遵守以下指導**

## 任務執行

**名稱:** {name}

**ID:** `{id}`

**描述:** {description}

{notesTemplate}

{implementationGuideTemplate}

{verificationCriteriaTemplate}

{analysisResultTemplate}

{dependencyTasksTemplate}

{relatedFilesSummaryTemplate}

{complexityTemplate}

## 執行步驟

{{include:shared/projectContextCheck.md}}

1. **分析需求** - 理解任務需求和約束條件
2. **設計方案** - 制定實施計劃和測試策略
3. **實施方案** - 按計劃執行，處理邊緣情況
4. **測試驗證** - 確保功能正確性和穩健性

## 質量要求

- **範圍管理** - 僅修改相關代碼，避免功能蔓延
- **代碼質量** - 符合編碼標準，處理異常情況
- **效能考量** - 注意算法效率和資源使用

現在開始根據指示執行任務，執行完成後調用 `verify_task` 工具來進行驗證。
**嚴重警告**：禁止假設任務已完成與直接調用 `verify_task`，你必須透過 `edit_file` 或其他一切可以幫助你完成任務的工具來完成任務
