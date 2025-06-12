/**
 * Markdown Prompt 解析器
 * 解析 Markdown 格式的 prompt 文件，提取链式执行信息
 */

import { ChainPrompt, ChainStep } from '../../types/index.js';

export interface ParsedPromptContent {
  title: string;
  description: string;
  systemMessage?: string;
  userMessageTemplate?: string;
  chainSteps?: ChainStep[];
  metadata?: Record<string, any>;
}

export class MarkdownPromptParser {
  /**
   * 解析 Markdown 格式的 prompt 内容
   * @param content Markdown 内容
   * @returns 解析后的 prompt 对象
   */
  parsePromptContent(content: string): ParsedPromptContent {
    const sections = this.extractSections(content);

    return {
      title: this.extractTitle(content),
      description: sections.description || '',
      systemMessage: sections['system message'],
      userMessageTemplate: sections['user message template'],
      chainSteps: this.parseChainSteps(sections['chain steps']),
      metadata: this.parseMetadata(sections),
    };
  }

  /**
   * 解析链式 prompt 配置
   * @param content Markdown 内容
   * @returns ChainPrompt 对象
   */
  parseChainPrompt(content: string): ChainPrompt {
    const parsed = this.parsePromptContent(content);
    const configSection = this.extractConfigSection(content);

    if (!configSection) {
      throw new Error('Chain prompt must contain a Chain Configuration section');
    }

    const config = this.parseJsonFromMarkdown(configSection);

    return {
      id: config.id,
      name: config.name || { en: parsed.title, zh: parsed.title },
      description: config.description || { en: parsed.description, zh: parsed.description },
      steps: parsed.chainSteps || [],
      enabled: config.enabled !== false,
    };
  }

  /**
   * 提取 Markdown 标题
   * @param content Markdown 内容
   * @returns 标题
   */
  private extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Untitled';
  }

  /**
   * 提取 Markdown 各个部分
   * @param content Markdown 内容
   * @returns 各部分内容的映射
   */
  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^##\s+(.+)$/);

      if (headerMatch) {
        // 保存前一个部分
        if (currentSection) {
          sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
        }

        // 开始新部分
        currentSection = headerMatch[1];
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // 保存最后一个部分
    if (currentSection) {
      sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * 解析链式步骤
   * @param stepsContent 步骤内容
   * @returns ChainStep 数组
   */
  private parseChainSteps(stepsContent?: string): ChainStep[] {
    if (!stepsContent) return [];

    const steps: ChainStep[] = [];
    const stepBlocks = this.extractStepBlocks(stepsContent);

    for (const block of stepBlocks) {
      const step = this.parseStepBlock(block);
      if (step) {
        steps.push(step);
      }
    }

    return steps;
  }

  /**
   * 提取步骤块
   * @param content 步骤内容
   * @returns 步骤块数组
   */
  private extractStepBlocks(content: string): string[] {
    const blocks: string[] = [];
    const lines = content.split('\n');
    let currentBlock: string[] = [];
    let inStepBlock = false;

    for (const line of lines) {
      if (line.match(/^###\s+Step\s+\d+/i)) {
        // 保存前一个块
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'));
        }

        // 开始新块
        currentBlock = [line];
        inStepBlock = true;
      } else if (inStepBlock) {
        currentBlock.push(line);
      }
    }

    // 保存最后一个块
    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
    }

    return blocks;
  }

  /**
   * 解析单个步骤块
   * @param block 步骤块内容
   * @returns ChainStep 对象
   */
  private parseStepBlock(block: string): ChainStep | null {
    const lines = block.split('\n');
    const step: Partial<ChainStep> = {};

    for (const line of lines) {
      const promptIdMatch = line.match(/\*\*Prompt ID:\*\*\s*`(.+)`/);
      const stepNameMatch = line.match(/\*\*Step Name:\*\*\s*(.+)/);
      const categoryMatch = line.match(/\*\*Category:\*\*\s*`(.+)`/);

      if (promptIdMatch) {
        step.promptId = promptIdMatch[1];
      } else if (stepNameMatch) {
        step.stepName = stepNameMatch[1];
      } else if (categoryMatch) {
        step.category = categoryMatch[1];
      }
    }

    // 解析输入输出映射
    step.inputMapping = this.extractMapping(block, 'Input Mapping');
    step.outputMapping = this.extractMapping(block, 'Output Mapping');

    if (!step.promptId || !step.stepName) {
      return null;
    }

    return step as ChainStep;
  }

  /**
   * 提取参数映射
   * @param content 内容
   * @param mappingType 映射类型
   * @returns 参数映射对象
   */
  private extractMapping(content: string, mappingType: string): Record<string, string> {
    const mapping: Record<string, string> = {};
    const regex = new RegExp(`\\*\\*${mappingType}:\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
    const match = content.match(regex);

    if (match) {
      const mappingContent = match[1];
      const mappingLines = mappingContent.split('\n');

      for (const line of mappingLines) {
        const mappingMatch = line.match(/^\s*-\s*`(.+)`\s*→\s*`(.+)`/);
        if (mappingMatch) {
          mapping[mappingMatch[1]] = mappingMatch[2];
        }
      }
    }

    return mapping;
  }

  /**
   * 提取配置部分
   * @param content Markdown 内容
   * @returns 配置内容
   */
  private extractConfigSection(content: string): string | null {
    const configMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    return configMatch ? configMatch[1] : null;
  }

  /**
   * 从 Markdown 中解析 JSON
   * @param jsonContent JSON 内容
   * @returns 解析后的对象
   */
  private parseJsonFromMarkdown(jsonContent: string): any {
    try {
      return JSON.parse(jsonContent);
    } catch (error) {
      throw new Error(`Invalid JSON in chain configuration: ${error}`);
    }
  }

  /**
   * 解析元数据
   * @param sections 各部分内容
   * @returns 元数据对象
   */
  private parseMetadata(sections: Record<string, string>): Record<string, any> {
    const metadata: Record<string, any> = {};

    // 提取常见的元数据字段
    if (sections.notes) {
      metadata.notes = sections.notes;
    }

    if (sections['usage example']) {
      metadata.usageExample = sections['usage example'];
    }

    if (sections['error handling']) {
      metadata.errorHandling = sections['error handling'];
    }

    if (sections.customization) {
      metadata.customization = sections.customization;
    }

    return metadata;
  }

  /**
   * 验证链式 prompt 的有效性
   * @param chainPrompt 链式 prompt 对象
   * @returns 验证结果
   */
  validateChainPrompt(chainPrompt: ChainPrompt): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!chainPrompt.id) {
      errors.push('Chain prompt must have an ID');
    }

    if (!chainPrompt.steps || chainPrompt.steps.length === 0) {
      errors.push('Chain prompt must have at least one step');
    }

    // 检查步骤的有效性
    if (chainPrompt.steps) {
      for (let i = 0; i < chainPrompt.steps.length; i++) {
        const step = chainPrompt.steps[i];
        if (!step.promptId) {
          errors.push(`Step ${i + 1} must have a promptId`);
        }
        if (!step.stepName) {
          errors.push(`Step ${i + 1} must have a stepName`);
        }
      }
    }

    // 检查循环依赖
    const dependencyErrors = this.checkCircularDependencies(chainPrompt);
    errors.push(...dependencyErrors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 检查循环依赖
   * @param chainPrompt 链式 prompt 对象
   * @returns 错误信息数组
   */
  private checkCircularDependencies(chainPrompt: ChainPrompt): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCircularDependency = (stepIndex: number): boolean => {
      const step = chainPrompt.steps[stepIndex];
      const stepId = `${stepIndex}-${step.promptId}`;

      if (recursionStack.has(stepId)) {
        return true;
      }

      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      // 检查输出映射是否被后续步骤的输入映射使用
      if (step.outputMapping) {
        for (let i = stepIndex + 1; i < chainPrompt.steps.length; i++) {
          const nextStep = chainPrompt.steps[i];
          if (nextStep.inputMapping) {
            const hasConnection = Object.values(step.outputMapping).some((output) =>
              Object.values(nextStep.inputMapping!).includes(output)
            );
            if (hasConnection && hasCircularDependency(i)) {
              return true;
            }
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (let i = 0; i < chainPrompt.steps.length; i++) {
      if (hasCircularDependency(i)) {
        errors.push(`Circular dependency detected in chain starting from step ${i + 1}`);
        break;
      }
    }

    return errors;
  }
}
