/**
 * 记忆系统测试套件索引
 * 
 * 这个文件导入并运行所有记忆系统相关的测试
 */

// 导入核心记忆管理器测试
import './TaskMemoryManager.test.js';
import './TeamMemoryManager.test.js';
import './DynamicTaskAdjuster.test.js';

// 导入工具测试
import '../tools/memory/shareTeamKnowledge.test.js';
import '../tools/memory/analyzeTeamCollaboration.test.js';
import '../tools/memory/insertTaskDynamically.test.js';

// 这个文件确保所有记忆系统测试都被包含在测试套件中
