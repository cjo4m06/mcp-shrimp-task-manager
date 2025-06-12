# 獲取鏈式執行狀態

這個工具允許你查詢正在執行或已完成的鏈式任務的詳細狀態信息。

## 主要功能

- **實時狀態查詢**：獲取鏈式執行的當前狀態
- **進度監控**：查看執行進度和完成情況
- **步驟詳情**：查看各步驟的執行狀態
- **配置信息**：獲取執行配置和上下文信息
- **性能數據**：查看執行時間和性能指標

## 使用場景

- 監控長時間運行的鏈式任務
- 調試鏈式執行問題
- 獲取任務執行報告
- 實時跟踪執行進度
- 系統狀態檢查

## 參數說明

### chainId (必需)
要查詢的鏈式執行的唯一標識符

## 返回信息

查詢結果包含：

### 基本信息
- `success`: 查詢是否成功
- `message`: 查詢結果消息
- `chainId`: 鏈式執行ID
- `found`: 是否找到指定的鏈式執行

### 執行上下文 (context)
如果鏈式執行正在運行，包含：
- `chainId`: 鏈式執行ID
- `currentStepIndex`: 當前步驟索引
- `totalSteps`: 總步驟數
- `startTime`: 開始時間
- `executionTime`: 已執行時間（毫秒）
- `config`: 執行配置
  - `maxRetries`: 最大重試次數
  - `stepTimeout`: 單步超時時間
  - `totalTimeout`: 總超時時間
  - `enableParallelExecution`: 是否啟用並行執行
  - `errorHandlingStrategy`: 錯誤處理策略
  - `logLevel`: 日誌級別

### 進度信息 (progress)
- `totalSteps`: 總步驟數
- `completedSteps`: 已完成步驟數
- `currentStep`: 當前步驟
- `progress`: 進度百分比
- `status`: 執行狀態
  - `pending`: 等待執行
  - `running`: 正在執行
  - `completed`: 已完成
  - `failed`: 執行失敗
  - `cancelled`: 已取消

### 任務列表 (tasks)
各步驟任務的詳細信息：
- `id`: 任務ID
- `name`: 任務名稱
- `status`: 任務狀態
- `stepIndex`: 步驟索引
- `chainStatus`: 鏈式執行狀態
- `createdAt`: 創建時間
- `updatedAt`: 更新時間
- `completedAt`: 完成時間（如果已完成）
- `summary`: 任務摘要

## 使用示例

```json
{
  "chainId": "chain-12345678-abcd-efgh-ijkl-123456789012"
}
```

## 返回示例

```json
{
  "success": true,
  "message": "鏈式執行狀態查詢成功",
  "chainId": "chain-12345678-abcd-efgh-ijkl-123456789012",
  "found": true,
  "status": {
    "context": {
      "chainId": "chain-12345678-abcd-efgh-ijkl-123456789012",
      "currentStepIndex": 2,
      "totalSteps": 5,
      "startTime": "2024-01-15T10:30:00.000Z",
      "executionTime": 120000,
      "config": {
        "maxRetries": 3,
        "stepTimeout": 300000,
        "totalTimeout": 1800000,
        "enableParallelExecution": false,
        "errorHandlingStrategy": "retry_on_error",
        "logLevel": "info"
      }
    },
    "progress": {
      "totalSteps": 5,
      "completedSteps": 2,
      "currentStep": 2,
      "progress": 40,
      "status": "running"
    },
    "tasks": [
      {
        "id": "task-001",
        "name": "需求分析",
        "status": "completed",
        "stepIndex": 0,
        "chainStatus": "step_completed",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:31:30.000Z",
        "completedAt": "2024-01-15T10:31:30.000Z",
        "summary": "需求分析完成"
      }
    ]
  }
}
```

## 注意事項

- 只能查詢存在的鏈式執行ID
- 已完成的鏈式執行可能沒有活動的上下文信息
- 進度信息會實時更新
- 長時間運行的鏈式執行建議定期查詢狀態
- 可以用於監控和調試目的
