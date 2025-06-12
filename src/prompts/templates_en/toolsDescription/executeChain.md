# 執行鏈式任務流程

這個工具允許你執行預定義的鏈式任務流程，支援多步驟的自動化任務執行。

## 主要功能

- **多步驟執行**：支援複雜的多步驟任務流程
- **數據傳遞**：步驟間的數據傳遞和映射
- **進度追蹤**：詳細的執行狀態和進度監控
- **錯誤處理**：完善的錯誤處理和重試機制
- **配置靈活**：可配置的執行策略和超時設置

## 使用場景

- 複雜的多步驟開發任務
- 自動化的工作流程執行
- 需要數據傳遞的任務鏈
- 批量處理和自動化操作
- 項目構建和部署流程

## 參數說明

### chainPrompt (必需)
鏈式 prompt 定義，包含：
- `id`: 鏈式 prompt 的唯一標識符
- `name`: 包含中英文名稱的對象
- `description`: 包含中英文描述的對象
- `steps`: 執行步驟列表，每個步驟包含：
  - `promptId`: 步驟使用的 prompt ID
  - `stepName`: 步驟名稱
  - `category`: 所屬分類（可選）
  - `inputMapping`: 輸入參數映射（可選）
  - `outputMapping`: 輸出參數映射（可選）
  - `retryCount`: 重試次數（可選）
  - `timeout`: 超時時間（可選）
- `enabled`: 是否啟用

### initialData (可選)
初始數據，將傳遞給第一個步驟

### config (可選)
執行配置，包含：
- `maxRetries`: 最大重試次數
- `stepTimeout`: 單步超時時間（毫秒）
- `totalTimeout`: 總超時時間（毫秒）
- `enableParallelExecution`: 是否啟用並行執行
- `errorHandlingStrategy`: 錯誤處理策略
  - `fail_fast`: 快速失敗
  - `continue_on_error`: 遇到錯誤繼續執行
  - `retry_on_error`: 遇到錯誤重試
  - `skip_on_error`: 遇到錯誤跳過
- `dataValidation`: 是否啟用數據驗證
- `logLevel`: 日誌級別（debug/info/warn/error）

## 返回信息

執行結果包含：
- `success`: 執行是否成功
- `message`: 執行結果消息
- `result`: 詳細結果信息
  - `chainId`: 鏈式執行的唯一標識符
  - `success`: 執行成功狀態
  - `completedSteps`: 已完成的步驟數
  - `totalSteps`: 總步驟數
  - `executionTime`: 執行耗時（毫秒）
  - `progress`: 執行進度百分比
  - `finalData`: 最終輸出數據
  - `errors`: 錯誤信息列表（如果有）

## 使用示例

```json
{
  "chainPrompt": {
    "id": "dev-workflow-001",
    "name": {
      "en": "Development Workflow",
      "zh": "開發工作流程"
    },
    "description": {
      "en": "Complete development workflow from analysis to deployment",
      "zh": "從分析到部署的完整開發工作流程"
    },
    "steps": [
      {
        "promptId": "analyze-requirements",
        "stepName": "需求分析",
        "category": "analysis",
        "outputMapping": {
          "requirements": "analyzed_requirements"
        }
      },
      {
        "promptId": "design-architecture",
        "stepName": "架構設計",
        "category": "design",
        "inputMapping": {
          "requirements": "analyzed_requirements"
        },
        "outputMapping": {
          "architecture": "system_architecture"
        }
      }
    ],
    "enabled": true
  },
  "initialData": {
    "project_name": "新項目",
    "requirements": "用戶需求文檔"
  },
  "config": {
    "maxRetries": 3,
    "stepTimeout": 300000,
    "errorHandlingStrategy": "retry_on_error",
    "logLevel": "info"
  }
}
```

## 注意事項

- 鏈式執行一旦開始，建議不要中途修改配置
- 步驟間的數據映射需要確保數據類型匹配
- 長時間運行的鏈式任務建議設置合理的超時時間
- 錯誤處理策略會影響整個鏈式執行的行為
- 可以通過 `get_chain_status` 工具監控執行進度
