/**
 * 任務分析 prompt 模板
 * 包含所有用於構建完整 analyzeTask prompt 的模板片段
 */

// 基本任務分析模板
export const analyzeTaskTemplate = `## 代碼庫分析\n\n### 任務摘要\n\`\`\`\n{summary}\n\`\`\`\n\n已收到初步解答構想：\n\n\`\`\`\n{initialConcept}\n\`\`\`\n\n`;

// 技術審核要點模板
export const technicalReviewTemplate = `## 技術審核要點\n\n### 1. 代碼庫分析
- 尋找可重用組件和類似實現
- 確定新功能的適當位置
- 評估與現有模塊的整合方式

### 2. 技術策略評估
- 考慮模塊化和可擴展性設計
- 評估提案的未來兼容性
- 規劃測試策略和覆蓋範圍

### 3. 風險和質量分析
- 識別技術債務和效能瓶頸
- 評估安全性和數據完整性
- 檢查錯誤處理機制

### 4. 實施建議
- 遵循項目架構風格
- 建議實施方法和技術選擇
- 提出明確開發步驟

注意尋找程式碼重用機會，避免重複實作已有功能，降低技術債務風險。`;

// 迭代分析模板（用於分析已有的前次分析結果）
export const iterationAnalysisTemplate = `\n\n## 迭代分析\n\n請對照先前分析結果：\n\n\`\`\`\n{previousAnalysis}\n\`\`\`\n\n請識別：
1. 已解決的問題及解決方案有效性
2. 仍存在的問題及其優先級
3. 新方案如何解決未解決問題
4. 迭代過程中獲得的新見解`;

// 下一步行動模板
export const nextActionTemplate = `\n\n## 下一步行動\n\n完成分析後，使用「reflect_task」工具提交最終分析，包含：\n\n1. **原始任務摘要** - 保持與第一階段一致
2. **完整分析結果** - 技術細節、接口依賴、實施策略、驗收標準和工作量估計

您的分析將決定解決方案質量，請全面考慮各種技術因素和業務約束。`;
