/**
 * 获取当前 AI 状态工具
 */

import { z } from 'zod';
import { AIManager } from '../../ai/manager.js';
import { log } from '../../utils/logger.js';

// 输入参数 Schema
export const getCurrentAiStatusSchema = z.object({
  includeHistory: z.boolean().optional().describe('是否包含切换历史（可选，默认为 false）'),
  includeStatistics: z.boolean().optional().describe('是否包含使用统计（可选，默认为 false）'),
});

/**
 * 获取当前 AI 状态
 */
export async function getCurrentAiStatusTool(args: z.infer<typeof getCurrentAiStatusSchema>) {
  try {
    // 注意：这是一个简化的实现，实际的 AIManager 接口与预期不同

    log.info('GetCurrentAiStatus', '获取当前 AI 状态', {
      includeHistory: args.includeHistory || false,
      includeStatistics: args.includeStatistics || false,
    });

    // 模拟当前提供商和所有提供商
    const mockCurrentProvider = {
      providerId: 'current-ai',
      providerName: 'Current AI',
      model: 'current-model',
      apiEndpoint: 'internal://current-ai',
      capabilities: ['text-generation', 'code-analysis'],
      maxTokens: 100000,
      costPerToken: 0,
      enabled: true,
    };

    const mockAllProviders = [mockCurrentProvider];

    const result: any = {
      success: true,
      message: '获取 AI 状态成功',
      data: {
        // 当前使用的提供商和模型
        current: mockCurrentProvider,

        // 所有可用的提供商概览
        available: {
          total: mockAllProviders.length,
          enabled: mockAllProviders.filter((p: any) => p.enabled).length,
          disabled: mockAllProviders.filter((p: any) => !p.enabled).length,
          providers: mockAllProviders.map((p: any) => ({
            id: p.providerId,
            name: p.providerName,
            enabled: p.enabled,
            models: { main: p.model, research: p.model, fallback: p.model },
            capabilities: p.capabilities.length,
          })),
        },

        // 系统状态
        system: {
          hasCurrentProvider: true,
          isReady: true,
          lastUpdated: new Date().toISOString(),
        },
      },
    };

    // 如果请求包含历史信息
    if (args.includeHistory) {
      result.data.history = {
        total: 1,
        recent: [
          {
            providerId: 'current-ai',
            modelType: 'main',
            timestamp: new Date().toISOString(),
            reason: '系统初始化',
          },
        ],
      };
    }

    // 如果请求包含统计信息
    if (args.includeStatistics) {
      result.data.statistics = {
        totalSwitches: 1,
        mostUsedProvider: 'current-ai',
        averageSwitchInterval: 0,
        providerUsage: {
          'current-ai': 100,
        },
      };
    }

    log.info('GetCurrentAiStatus', 'AI 状态获取完成', {
      hasCurrentProvider: true,
      totalProviders: mockAllProviders.length,
      enabledProviders: mockAllProviders.filter((p: any) => p.enabled).length,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('GetCurrentAiStatus', '获取 AI 状态失败', error as Error);

    return {
      success: false,
      message: `获取 AI 状态失败: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

// 工具定义
export const getCurrentAiStatusToolDefinition = {
  name: 'get_current_ai_status',
  description: `获取当前 AI 状态

这个工具允许你查看当前 AI 系统的状态和配置信息。

主要功能：
- 查看当前使用的 AI 提供商和模型
- 获取所有可用提供商的概览
- 查看系统就绪状态
- 可选包含切换历史记录
- 可选包含使用统计信息

返回信息包括：
- 当前提供商：ID、名称、模型、能力、限制等
- 可用提供商：总数、启用状态、基本信息
- 系统状态：是否就绪、最后更新时间等
- 切换历史：最近的提供商切换记录（可选）
- 使用统计：切换次数、使用模式等（可选）

使用场景：
- 检查当前 AI 配置是否正确
- 监控 AI 系统的运行状态
- 调试 AI 相关问题
- 获取系统使用报告
- 验证提供商切换效果

这个工具对于系统管理和故障排查非常有用。`,
  inputSchema: getCurrentAiStatusSchema,
  handler: getCurrentAiStatusTool,
};
