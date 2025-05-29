# 測試指南

本文檔描述了 MCP 蝦米任務管理器專案的測試設置和實踐。

## 概述

專案使用 **Vitest** 作為測試框架，原生支援 TypeScript 和 ES 模組。測試涵蓋以下範圍：

- **核心模型**：任務管理、CRUD 操作、依賴關係
- **工具**：任務規劃、執行和管理工具
- **實用程式**：專案檢測、正則表達式驗證、檔案操作
- **類型**：類型定義和模式驗證

## 測試結構

```
tests/
├── setup.ts                    # 測試配置和全域設置
├── helpers/
│   └── testUtils.ts            # 測試工具和模擬助手
├── models/
│   └── taskModel.test.ts       # 核心任務模型測試
├── tools/
│   └── task/
│       ├── planTask.test.ts    # 任務規劃工具測試
│       └── executeTask.test.ts # 任務執行工具測試
├── utils/
│   ├── projectDetector.test.ts # 專案檢測測試
│   └── regex.test.ts           # 正則表達式驗證測試
└── types/
    └── index.test.ts           # 類型定義測試
```

## 執行測試

### 基本命令

```bash
# 執行所有測試
npm test

# 監視模式執行測試（互動式）
npm run test:watch

# 執行測試並產生覆蓋率報告
npm run test:coverage

# 執行測試並開啟 UI 介面
npm run test:ui

# CI 模式執行測試（無監視，包含覆蓋率）
npm run test:ci
```

### 執行特定測試

```bash
# 執行特定檔案的測試
npm test -- tests/models/taskModel.test.ts

# 執行詳細報告模式的測試
npm test -- --reporter=verbose --run

# 執行特定目錄的測試
npm test -- tests/utils/
```

## 測試覆蓋率

專案維持最低 50% 的測試覆蓋率要求。覆蓋率報告產生在 `coverage/` 目錄中。

### 覆蓋率閾值

- **行數**：最低 50%
- **函數**：最低 50%
- **分支**：最低 50%
- **語句**：最低 50%

### 檢視覆蓋率報告

執行 `npm run test:coverage` 後，在瀏覽器中開啟 `coverage/lcov-report/index.html` 檢視詳細的覆蓋率報告。

## Vitest 特性

### 為什麼選擇 Vitest？

我們從 Jest 遷移到 Vitest 有以下優勢：

- **原生 ES 模組支援**：無需配置即可支援 ES 模組和 `import.meta.url`
- **更快的執行速度**：基於 Vite 的快速建置系統
- **更好的 TypeScript 整合**：開箱即用的 TypeScript 支援
- **現代化測試功能**：內建監視模式、UI 介面和覆蓋率
- **簡化配置**：相比 Jest 減少了配置開銷

### 使用的關鍵功能

- **順序執行**：測試順序執行以避免檔案系統競爭條件
- **V8 覆蓋率提供者**：快速且準確的覆蓋率報告
- **全域測試 API**：`describe`、`it`、`expect` 全域可用
- **模擬函數**：使用 `vi.mock()` 和 `vi.fn()` 進行模擬
- **設置檔案**：在 `tests/setup.ts` 中進行全域測試設置

### 配置

專案使用 `vitest.config.ts` 進行配置：

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true }
    },
    testTimeout: 10000
  }
});
```

## CI/CD 流水線

### GitHub Actions 工作流程

專案包含兩個主要工作流程：

#### 1. CI 工作流程 (`.github/workflows/ci.yml`)

在推送到 `main` 和 `develop` 分支以及 Pull Request 時執行：

- **測試矩陣**：Node.js 18.x 和 20.x
- **類型檢查**：TypeScript 編譯驗證
- **單元測試**：完整測試套件執行
- **建置驗證**：確保專案成功建置
- **安全性稽核**：npm audit 檢查漏洞
- **程式碼品質**：基本 linting 和格式檢查

#### 2. PR 檢查 (`.github/workflows/pr-checks.yml`)

專為 Pull Request 驗證的特殊工作流程：

- **全面測試**：完整測試套件與覆蓋率
- **覆蓋率驗證**：確保最低 70% 覆蓋率
- **破壞性變更檢測**：分析 API 變更
- **套件大小分析**：追蹤建置大小影響
- **文件驗證**：檢查 README 完整性
- **覆蓋率評論**：自動 PR 評論覆蓋率報告

### 覆蓋率報告

- **Codecov 整合**：自動覆蓋率上傳
- **PR 評論**：覆蓋率報告發布為 PR 評論
- **閾值強制執行**：覆蓋率低於 50% 時建置失敗

## 編寫測試

### 測試工具

使用 `tests/helpers/testUtils.ts` 中提供的測試工具：

```typescript
import { createMockTask, createMockTaskChain, getTestDataDir } from '../helpers/testUtils.js';

// 建立模擬任務
const task = createMockTask({ name: 'Test Task' });

// 建立依賴任務鏈
const tasks = createMockTaskChain(3);

// 取得測試資料目錄
const dataDir = getTestDataDir();
```

### 模擬指南

- **專案檢測器**：始終模擬 `getProjectDataDir` 回傳測試目錄
- **檔案系統**：使用測試專用目錄避免衝突
- **外部依賴**：模擬外部服務和 API
- **控制台輸出**：預設模擬控制台方法以減少雜訊

### 測試模式

```typescript
describe('功能名稱', () => {
  beforeEach(() => {
    // 每個測試的清潔設置
  });

  describe('特定功能', () => {
    it('應該執行預期行為', async () => {
      // 安排
      const input = createMockData();
      
      // 執行
      const result = await functionUnderTest(input);
      
      // 斷言
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
  });
});
```

## 最佳實踐

### 測試組織

- **分組相關測試**：使用巢狀 `describe` 區塊
- **清晰的測試名稱**：使用描述性測試名稱說明預期行為
- **安排-執行-斷言**：遵循 AAA 模式的測試結構
- **獨立測試**：每個測試應該獨立，不依賴其他測試

### 模擬策略

- **模擬外部依賴**：始終模擬檔案系統、網路呼叫和外部服務
- **使用測試替身**：單元測試優先使用模擬而非真實實作
- **清理模擬**：測試間重置模擬以避免干擾

### 覆蓋率目標

- **專注關鍵路徑**：確保核心業務邏輯的高覆蓋率
- **邊界情況**：測試錯誤條件和邊界情況
- **整合點**：測試模組間的介面
- **類型安全**：驗證 TypeScript 類型和模式

## 故障排除

### 常見問題

1. **匯入錯誤**：確保 ES 模組匯入中包含 `.js` 副檔名
2. **模擬問題**：驗證模擬路徑與實際模組路徑匹配
3. **非同步測試**：對非同步操作使用 `async/await`
4. **檔案系統**：使用測試專用目錄避免衝突

### 除錯技巧

```bash
# 執行詳細輸出的測試
npm test -- --reporter=verbose

# 執行單一測試檔案並除錯
npm test -- tests/specific.test.ts --reporter=verbose

# 檢查 Vitest 配置
npx vitest --config
```

## 貢獻

新增新功能時：

1. **先寫測試**：可能的話遵循 TDD 實踐
2. **維持覆蓋率**：確保新程式碼有足夠的測試覆蓋率
3. **更新文件**：如果新增新的測試模式請更新本指南
4. **執行完整套件**：提交 PR 前驗證所有測試通過

CI 流水線將自動驗證您的變更並提供測試覆蓋率和品質的回饋。
