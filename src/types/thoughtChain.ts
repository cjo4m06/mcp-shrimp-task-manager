/**
 * 思维链资料结构定义
 *
 * 此文件定义了思维链工具所需的核心资料结构，仅包含处理单一思维所需的介面，
 * 不包含储存历史记录的功能。设计符合现有专案架构风格。
 */

/**
 * 思维阶段枚举：定义思考过程中的不同阶段
 */
export enum ThoughtStage {
  PROBLEM_DEFINITION = "问题定义", // 定义问题和目标的阶段
  COLLECT_INFORMATION = "收集资讯", // 收集和分析资讯的阶段
  RESEARCH = "研究", // 研究资讯的阶段
  ANALYSIS = "分析", // 深入解析问题和可能解决方案的阶段
  SYNTHESIS = "综合", // 整合分析结果形成方案的阶段
  CONCLUSION = "结论", // 总结思考过程并提出最终解决方案的阶段
  QUESTIONING = "质疑", // 质疑和批判的阶段
  PLANNING = "规划", // 规划和计划的阶段
}

/**
 * 思维资料介面：定义思维的完整资料结构
 */
export interface ThoughtData {
  thought: string; // 思维内容（字串）
  thoughtNumber: number; // 当前思维编号（数字）
  totalThoughts: number; // 预估总思维数量（数字）
  nextThoughtNeeded: boolean; // 是否需要更多思维（布林值）
  stage: string; // 思维阶段（字串，如「问题定义」、「研究」、「分析」、「综合」、「结论」、「质疑」）
  tags?: string[]; // 可选的思维关键词或分类（字串阵列）
  axioms_used?: string[]; // 可选的此思维中使用的原则或公理（字串阵列）
  assumptions_challenged?: string[]; // 可选的此思维挑战的假设（字串阵列）
}
