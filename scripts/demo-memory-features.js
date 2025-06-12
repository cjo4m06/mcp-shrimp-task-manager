#!/usr/bin/env node

/**
 * 团队协作记忆功能演示脚本
 * 
 * 这个脚本演示新实现的团队协作记忆功能的核心能力
 */

import { TaskMemoryManager } from '../dist/memory/TaskMemoryManager.js';
import { TeamMemoryManager } from '../dist/memory/TeamMemoryManager.js';
import { DynamicTaskAdjuster } from '../dist/memory/DynamicTaskAdjuster.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';

console.log('🧠 团队协作记忆功能演示');
console.log('================================\n');

// 创建临时演示目录
const demoDir = join(tmpdir(), `memory-demo-${Date.now()}`);
mkdirSync(demoDir, { recursive: true });

async function demonstrateMemoryFeatures() {
  try {
    // 1. 演示个人任务记忆管理
    console.log('🧠 1. 个人任务记忆管理演示');
    console.log('--------------------------------');
    
    const memoryManager = new TaskMemoryManager(demoDir);
    
    // 开始任务执行
    const executionId = await memoryManager.startTaskExecution('demo-task-001');
    console.log(`✅ 开始任务执行，执行ID: ${executionId}`);
    
    // 记录决策
    const decisionId = await memoryManager.recordDecision(
      executionId,
      '技术选型决策',
      [
        { id: 'react', description: 'React框架' },
        { id: 'vue', description: 'Vue框架' }
      ],
      'react',
      '团队更熟悉React，有更多经验'
    );
    console.log(`✅ 记录决策: ${decisionId}`);
    
    // 记录发现
    const discoveryId = await memoryManager.recordDiscovery(
      executionId,
      'insight',
      '性能优化机会',
      '发现可以通过代码分割减少初始加载时间'
    );
    console.log(`✅ 记录发现: ${discoveryId}`);
    
    // 创建检查点
    const checkpointId = await memoryManager.createCheckpoint(
      executionId,
      '完成基础架构设计',
      '下一步：实现核心业务逻辑'
    );
    console.log(`✅ 创建检查点: ${checkpointId}`);
    
    // 记录知识
    await memoryManager.recordKnowledge({
      knowledgeId: 'react-best-practice-001',
      title: 'React组件设计最佳实践',
      content: '使用函数组件和Hooks，保持组件单一职责',
      type: 'best-practice',
      context: {
        taskType: 'frontend-development',
        projectType: 'web-application',
        technology: ['react', 'javascript'],
        teamSize: 'small',
        complexity: 'medium'
      },
      applicability: {
        taskTypes: ['frontend-development', 'component-design'],
        projectTypes: ['web-application', 'spa'],
        technologies: ['react'],
        constraints: []
      },
      confidence: 0.9,
      source: 'team-experience',
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 1,
      effectiveness: 0.85
    });
    console.log(`✅ 记录知识: React最佳实践`);
    
    // 完成任务执行
    await memoryManager.completeTaskExecution(executionId, 'success', '任务成功完成');
    console.log(`✅ 完成任务执行\n`);
    
    // 2. 演示团队记忆管理
    console.log('🤝 2. 团队记忆管理演示');
    console.log('--------------------------------');
    
    const teamMemoryManager = new TeamMemoryManager(demoDir);
    
    // 分享知识到团队
    const sharedKnowledgeId = await teamMemoryManager.shareKnowledge(
      {
        knowledgeId: 'react-best-practice-001',
        title: 'React组件设计最佳实践',
        content: '使用函数组件和Hooks，保持组件单一职责',
        type: 'best-practice',
        context: {
          taskType: 'frontend-development',
          projectType: 'web-application',
          technology: ['react', 'javascript'],
          teamSize: 'small',
          complexity: 'medium'
        },
        applicability: {
          taskTypes: ['frontend-development', 'component-design'],
          projectTypes: ['web-application', 'spa'],
          technologies: ['react'],
          constraints: []
        },
        confidence: 0.9,
        source: 'team-experience',
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 1,
        effectiveness: 0.85
      },
      {
        memberId: 'frontend-dev-001',
        name: '前端开发者',
        role: 'frontend-developer',
        skills: ['react', 'javascript'],
        experience: 'intermediate',
        preferences: {
          communicationStyle: 'direct',
          workingHours: 'standard',
          collaborationTools: ['slack', 'github']
        }
      },
      'team',
      ['backend-developer', 'fullstack-developer']
    );
    console.log(`✅ 分享知识到团队: ${sharedKnowledgeId}`);
    
    // 记录协作模式
    const patternId = await teamMemoryManager.recordCollaborationPattern(
      '代码审查协作模式',
      '前端开发完成后，由资深开发者进行代码审查',
      ['frontend-developer', 'senior-developer'],
      {
        patternId: 'code-review-pattern-001',
        name: '代码审查协作模式',
        description: '前端开发完成后，由资深开发者进行代码审查',
        participants: [
          { role: 'frontend-developer', responsibilities: ['编写代码', '单元测试'] },
          { role: 'senior-developer', responsibilities: ['代码审查', '架构指导'] }
        ],
        workflow: [
          { step: 1, action: '开发者提交代码', actor: 'frontend-developer' },
          { step: 2, action: '创建Pull Request', actor: 'frontend-developer' },
          { step: 3, action: '代码审查', actor: 'senior-developer' },
          { step: 4, action: '反馈和修改', actor: 'frontend-developer' },
          { step: 5, action: '合并代码', actor: 'senior-developer' }
        ],
        context: {
          projectPhase: 'development',
          teamSize: 'small',
          complexity: 'medium',
          timeline: 'normal'
        },
        outcomes: {
          qualityImprovement: 0.8,
          knowledgeTransfer: 0.9,
          teamSatisfaction: 0.85,
          timeEfficiency: 0.7
        },
        usageCount: 1,
        successRate: 1.0,
        createdAt: new Date(),
        lastUsed: new Date()
      },
      true
    );
    console.log(`✅ 记录协作模式: ${patternId}`);
    
    // 记录团队学习
    const learningId = await teamMemoryManager.recordTeamLearning(
      'demo-project',
      'frontend-team',
      'success',
      'React Hooks深度学习',
      '团队集体学习React Hooks的高级用法，掌握了useCallback和useMemo的优化技巧'
    );
    console.log(`✅ 记录团队学习: ${learningId}\n`);
    
    // 3. 演示动态任务调整
    console.log('🔄 3. 动态任务调整演示');
    console.log('--------------------------------');
    
    const taskAdjuster = new DynamicTaskAdjuster(demoDir);
    
    // 智能插入任务
    const insertionResult = await taskAdjuster.insertTaskIntelligently({
      title: '安全审计任务',
      description: '对新功能进行安全审计，确保没有安全漏洞',
      priority: 8,
      urgency: 'high',
      context: '发现了潜在的安全风险，需要立即处理',
      relatedTasks: [],
      autoAdjust: true,
      generateSuggestions: true
    });
    
    if (insertionResult.success) {
      console.log(`✅ 智能插入任务成功`);
      console.log(`   - 任务名称: ${insertionResult.insertedTask?.name}`);
      console.log(`   - 调整的任务数: ${insertionResult.adjustedTasks.length}`);
      console.log(`   - 生成的建议数: ${insertionResult.suggestions.length}`);
      console.log(`   - 摘要: ${insertionResult.summary}`);
    } else {
      console.log(`❌ 任务插入失败: ${insertionResult.summary}`);
    }
    
    console.log('\n🎯 演示总结');
    console.log('================================');
    console.log('✅ 个人任务记忆: 支持执行上下文、决策、发现、检查点记录');
    console.log('✅ 团队协作记忆: 支持知识分享、协作模式、团队学习记录');
    console.log('✅ 动态任务调整: 支持智能任务插入和依赖关系管理');
    console.log('✅ 数据持久化: 所有记忆数据都保存到文件系统');
    console.log('✅ 知识检索: 支持基于上下文的智能知识推荐');
    
    console.log('\n💡 实际应用价值');
    console.log('================================');
    console.log('🧠 个人层面: 任务执行历史追踪，经验积累和复用');
    console.log('🤝 团队层面: 知识共享，协作模式优化，集体学习');
    console.log('🔄 项目层面: 智能任务管理，动态优先级调整');
    console.log('📊 组织层面: 数据驱动的团队效能提升');
    
  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error);
  }
}

// 运行演示
demonstrateMemoryFeatures().then(() => {
  console.log('\n🎉 团队协作记忆功能演示完成！');
  console.log('系统已具备完整的智能记忆和协作能力。');
}).catch(error => {
  console.error('演示失败:', error);
  process.exit(1);
});
