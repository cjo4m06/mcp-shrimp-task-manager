# 獲取當前 AI 狀態

這個工具允許你查看當前 AI 系統的狀態和配置信息。

## 主要功能

- **當前狀態**：查看當前使用的 AI 提供商和模型
- **系統概覽**：獲取所有可用提供商的概覽
- **就緒檢查**：查看系統就緒狀態和可用性
- **歷史記錄**：可選包含切換歷史記錄
- **使用統計**：可選包含使用統計信息

## 使用場景

- 檢查當前 AI 配置是否正確
- 監控 AI 系統的運行狀態
- 調試 AI 相關問題
- 獲取系統使用報告
- 驗證提供商切換效果
- 系統健康檢查

## 參數說明

### includeHistory (可選)
是否包含切換歷史，默認為 false
- `true`: 包含最近的切換歷史記錄
- `false`: 不包含歷史記錄

### includeStatistics (可選)
是否包含使用統計，默認為 false
- `true`: 包含詳細的使用統計信息
- `false`: 不包含統計信息

## 返回信息

### 基本狀態信息

#### 當前配置 (current)
- `providerId`: 當前提供商ID
- `providerName`: 當前提供商名稱
- `model`: 當前使用的模型
- `apiEndpoint`: API 端點
- `capabilities`: 支持的功能列表
- `maxTokens`: 最大 token 數
- `costPerToken`: 每 token 成本
- `enabled`: 是否啟用

#### 可用提供商 (available)
- `total`: 總提供商數量
- `enabled`: 已啟用的提供商數量
- `disabled`: 已禁用的提供商數量
- `providers`: 提供商列表概覽

#### 系統狀態 (system)
- `hasCurrentProvider`: 是否有當前提供商
- `isReady`: 系統是否就緒
- `lastUpdated`: 最後更新時間

### 可選信息

#### 切換歷史 (history) - 當 includeHistory=true 時
- `total`: 總切換次數
- `recent`: 最近10次切換記錄

#### 使用統計 (statistics) - 當 includeStatistics=true 時
- `totalSwitches`: 總切換次數
- `mostUsedProvider`: 最常用的提供商
- `averageSwitchInterval`: 平均切換間隔
- `providerUsage`: 各提供商使用情況

## 使用示例

### 基本狀態查詢
```json
{
  "includeHistory": false,
  "includeStatistics": false
}
```

### 完整狀態查詢
```json
{
  "includeHistory": true,
  "includeStatistics": true
}
```

### 簡單查詢（使用默認參數）
```json
{}
```

## 返回示例

### 基本返回
```json
{
  "success": true,
  "message": "獲取 AI 狀態成功",
  "data": {
    "current": {
      "providerId": "anthropic-claude",
      "providerName": "Anthropic Claude",
      "model": "claude-3-sonnet-20240229",
      "apiEndpoint": "https://api.anthropic.com/v1",
      "capabilities": ["text-generation", "code-analysis", "reasoning"],
      "maxTokens": 200000,
      "costPerToken": 0.00003,
      "enabled": true
    },
    "available": {
      "total": 3,
      "enabled": 2,
      "disabled": 1,
      "providers": [...]
    },
    "system": {
      "hasCurrentProvider": true,
      "isReady": true,
      "lastUpdated": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

### 包含歷史和統計的返回
```json
{
  "success": true,
  "message": "獲取 AI 狀態成功",
  "data": {
    // ... 基本信息 ...
    "history": {
      "total": 15,
      "recent": [
        {
          "providerId": "anthropic-claude",
          "modelType": "main",
          "timestamp": "2024-01-15T11:30:00.000Z",
          "reason": "切換到更適合代碼分析的模型"
        }
      ]
    },
    "statistics": {
      "totalSwitches": 15,
      "mostUsedProvider": "anthropic-claude",
      "averageSwitchInterval": 3600000,
      "providerUsage": {
        "anthropic-claude": 60,
        "openai-gpt4": 40
      }
    }
  }
}
```

## 狀態指示器

### 系統就緒狀態
- `isReady: true`: 系統正常，可以處理 AI 請求
- `isReady: false`: 系統未就緒，可能需要配置或修復

### 提供商狀態
- `enabled`: 提供商已啟用且可用
- `disabled`: 提供商已禁用
- `error`: 提供商配置錯誤或不可用

## 注意事項

- **實時信息**：返回的是當前時刻的實時狀態
- **性能影響**：包含統計信息可能會稍微影響響應時間
- **權限要求**：某些詳細信息可能需要特定權限
- **緩存機制**：部分信息可能有短暫的緩存延遲

## 故障排查

使用此工具可以幫助診斷：
- AI 服務不可用的問題
- 模型切換是否生效
- 提供商配置是否正確
- 系統性能和使用模式
- 歷史問題的追蹤和分析

## 最佳實踐

- 定期檢查系統狀態確保正常運行
- 在遇到問題時首先查看狀態信息
- 使用歷史記錄追蹤問題的根源
- 通過統計信息優化使用策略
- 在系統維護前後對比狀態變化
