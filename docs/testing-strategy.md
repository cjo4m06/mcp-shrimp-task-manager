# 测试策略文档

## 🎯 测试目标

为了避免未来出现类似"英文模板缺失导致 MCP 服务器启动失败"的问题，我们建立了全面的测试策略。

## 📋 测试覆盖范围

### 1. 模板完整性测试 (`tests/prompts/templateIntegrity.test.ts`)

**目的**: 确保所有模板文件在不同语言版本中都存在且格式正确

**测试内容**:
- ✅ 语言目录结构完整性
- ✅ 工具描述文件完整性（23个关键工具）
- ✅ 共享模板文件完整性（4个关键文件）
- ✅ 模板语法检查（包含语法验证）
- ✅ 构建后文件检查

**关键检查项**:
```typescript
const CRITICAL_TOOL_DESCRIPTIONS = [
  'planTask.md', 'analyzeTask.md', 'reflectTask.md', 'splitTasks.md',
  'listTasks.md', 'executeTask.md', 'verifyTask.md', 'deleteTask.md',
  'clearAllTasks.md', 'updateTask.md', 'queryTask.md', 'getTaskDetail.md',
  'processThought.md', 'initProjectRules.md', 'researchMode.md',
  'getProjectContext.md', 'analyzeWorkingDirectory.md', 'setProjectWorkingDirectory.md',
  'diagnoseMcpEnvironment.md', 'viewRealtimeLogs.md', 'resetProjectDetection.md',
  'showPathStatus.md', 'validateProjectIsolation.md'
];
```

### 2. MCP 服务器集成测试 (`tests/server/mcpServerIntegration.test.ts`)

**目的**: 测试服务器启动和工具列表加载

**测试内容**:
- ✅ 服务器启动测试（中文/英文模板）
- ✅ 工具列表完整性测试
- ✅ 工具描述非空验证
- ✅ 环境变量处理测试

**预期工具数量**: 23个工具

### 3. 项目隔离功能测试 (`tests/tools/project/validateProjectIsolation.test.ts`)

**目的**: 验证项目隔离功能的正确性

**测试内容**:
- ✅ 基本功能测试（报告生成、状态检测）
- ✅ 任务文件检查
- ✅ 建议生成逻辑
- ✅ 技术详情输出
- ✅ 错误处理
- ✅ 参数验证
- ✅ 报告格式验证

## 🔧 CI/CD 集成

### GitHub Actions 配置

在 `.github/workflows/ci.yml` 中添加了模板完整性检查：

```bash
# 检查关键模板文件在两种语言中都存在
for lang in zh en; do
  for tool in "${TOOLS[@]}"; do
    file="dist/prompts/templates_${lang}/toolsDescription/${tool}"
    if [ ! -f "$file" ]; then
      echo "❌ Missing: $file"
      exit 1
    fi
  done
done
```

### 测试执行顺序

1. **构建阶段**: `npm run build`
2. **单元测试**: `npm run test:ci`
3. **模板验证**: 检查构建后的模板文件
4. **集成测试**: MCP 服务器启动测试

## 🚀 测试运行指南

### 运行所有测试
```bash
npm test
```

### 运行特定测试套件
```bash
# 模板完整性测试
npm test tests/prompts/templateIntegrity.test.ts

# MCP 服务器集成测试
npm test tests/server/mcpServerIntegration.test.ts

# 项目隔离功能测试
npm test tests/tools/project/validateProjectIsolation.test.ts
```

### 运行覆盖率测试
```bash
npm run test:coverage
```

## 📊 测试指标

### 当前测试覆盖
- **模板文件**: 100% 覆盖（23个工具描述 + 4个共享模板）
- **语言支持**: 100% 覆盖（中文 + 英文）
- **核心功能**: 100% 覆盖（项目隔离、服务器启动）

### 质量门槛
- ✅ 所有模板文件必须存在
- ✅ 模板内容长度 > 20 字符
- ✅ 无占位符内容（TODO、placeholder）
- ✅ 正确的包含语法
- ✅ 服务器能成功启动
- ✅ 工具列表完整返回

## 🔄 持续改进

### 新工具添加流程
1. 在 `CRITICAL_TOOL_DESCRIPTIONS` 中添加新工具
2. 创建中文和英文模板文件
3. 运行测试验证
4. 更新 CI 检查列表

### 新语言支持流程
1. 在 `SUPPORTED_LANGUAGES` 中添加新语言
2. 创建对应的模板目录
3. 复制并翻译所有模板文件
4. 运行测试验证

## 🎉 预期效果

通过这套测试策略，我们能够：

1. **提前发现问题**: 在开发阶段就发现模板缺失
2. **确保一致性**: 所有语言版本的模板都保持同步
3. **自动化验证**: CI 自动检查，无需手动验证
4. **快速定位**: 测试失败时能快速定位具体问题
5. **防止回归**: 避免未来出现类似问题

这确保了 MCP 服务器在任何支持的语言配置下都能正常启动和运行。
