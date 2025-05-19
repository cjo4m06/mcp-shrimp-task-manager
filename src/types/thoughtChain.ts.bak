/**
 * 思維鏈資料結構定義
 *
 * 此文件定義了思維鏈工具所需的核心資料結構，僅包含處理單一思維所需的介面，
 * 不包含儲存歷史記錄的功能。設計符合現有專案架構風格。
 */

/**
 * 思維階段枚舉：定義思考過程中的不同階段
 */
export enum ThoughtStage {
  PROBLEM_DEFINITION = "問題定義", // 定義問題和目標的階段
  COLLECT_INFORMATION = "收集資訊", // 收集和分析資訊的階段
  RESEARCH = "研究", // 研究資訊的階段
  ANALYSIS = "分析", // 深入解析問題和可能解決方案的階段
  SYNTHESIS = "綜合", // 整合分析結果形成方案的階段
  CONCLUSION = "結論", // 總結思考過程並提出最終解決方案的階段
  QUESTIONING = "質疑", // 質疑和批判的階段
  PLANNING = "規劃", // 規劃和計劃的階段
}

/**
 * 思維資料介面：定義思維的完整資料結構
 */
export interface ThoughtData {
  thought: string; // 思維內容（字串）
  thoughtNumber: number; // 當前思維編號（數字）
  totalThoughts: number; // 預估總思維數量（數字）
  nextThoughtNeeded: boolean; // 是否需要更多思維（布林值）
  stage: string; // 思維階段（字串，如「問題定義」、「研究」、「分析」、「綜合」、「結論」、「質疑」）
  tags?: string[]; // 可選的思維關鍵詞或分類（字串陣列）
  axioms_used?: string[]; // 可選的此思維中使用的原則或公理（字串陣列）
  assumptions_challenged?: string[]; // 可選的此思維挑戰的假設（字串陣列）
}
