# 管理 AI 提供商

這個工具允許你管理系統中的 AI 提供商配置。

## 支持的操作

- **list**: 列出所有 AI 提供商
- **get**: 獲取指定提供商的詳細信息
- **add**: 添加新的 AI 提供商
- **update**: 更新現有提供商的配置
- **remove**: 刪除指定的提供商
- **enable**: 啟用指定的提供商
- **disable**: 禁用指定的提供商

## 主要功能

- **集中管理**：統一管理多個 AI 提供商
- **動態配置**：動態添加和配置新的提供商
- **狀態控制**：啟用/禁用提供商以控制可用性
- **詳細查看**：查看提供商的詳細配置和狀態
- **模型管理**：支持不同模型和能力的配置

## 使用場景

- 配置新的 AI 服務提供商
- 切換不同的 AI 模型
- 管理 API 密鑰和端點
- 控制成本和使用限制
- 故障轉移和負載均衡

## 參數說明

### action (必需)
操作類型，可選值：
- `list`: 列出所有提供商
- `get`: 獲取指定提供商信息
- `add`: 添加新提供商
- `update`: 更新提供商配置
- `remove`: 刪除提供商
- `enable`: 啟用提供商
- `disable`: 禁用提供商

### providerId (條件必需)
提供商ID，以下操作需要：
- `get`, `update`, `remove`, `enable`, `disable`

### provider (條件必需)
提供商配置對象，`add` 和 `update` 操作需要，包含：
- `id`: 提供商唯一標識符
- `name`: 提供商名稱
- `apiEndpoint`: API 端點
- `models`: 支持的模型
  - `main`: 主要模型
  - `research`: 研究模型
  - `fallback`: 備用模型
- `capabilities`: 支持的功能列表
- `costPerToken`: 每 token 成本
- `maxTokens`: 最大 token 數
- `enabled`: 是否啟用

## 使用示例

### 列出所有提供商
```json
{
  "action": "list"
}
```

### 獲取指定提供商
```json
{
  "action": "get",
  "providerId": "openai-gpt4"
}
```

### 添加新提供商
```json
{
  "action": "add",
  "provider": {
    "id": "anthropic-claude",
    "name": "Anthropic Claude",
    "apiEndpoint": "https://api.anthropic.com/v1",
    "models": {
      "main": "claude-3-sonnet-20240229",
      "research": "claude-3-opus-20240229",
      "fallback": "claude-3-haiku-20240307"
    },
    "capabilities": ["text-generation", "code-analysis", "reasoning"],
    "costPerToken": 0.00003,
    "maxTokens": 200000,
    "enabled": true
  }
}
```

### 啟用提供商
```json
{
  "action": "enable",
  "providerId": "anthropic-claude"
}
```

## 返回信息

### 列表操作返回
```json
{
  "success": true,
  "message": "獲取 AI 提供商列表成功",
  "data": {
    "providers": [...],
    "total": 3,
    "enabled": 2
  }
}
```

### 單個操作返回
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "providerId": "anthropic-claude"
  }
}
```

## 注意事項

- **唯一性**：提供商ID必須唯一
- **配置驗證**：添加或更新時會驗證配置的完整性
- **依賴檢查**：刪除提供商前會檢查是否有依賴
- **狀態影響**：禁用提供商會影響正在使用它的任務
- **權限控制**：某些操作可能需要管理員權限

## 錯誤情況

可能的錯誤情況：
- 提供商ID已存在（添加時）
- 提供商ID不存在（獲取、更新、刪除時）
- 配置信息不完整或無效
- 提供商正在被使用（刪除時）
- 權限不足

## 最佳實踐

- 使用有意義的提供商ID和名稱
- 定期檢查提供商的可用性
- 合理設置成本和限制參數
- 保持至少一個可用的提供商
- 在生產環境中謹慎刪除提供商
