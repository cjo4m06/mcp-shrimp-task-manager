# 📁 文档路径管理指导

## 🎯 核心原则

**必须使用项目特定的文档路径管理机制，确保所有文档统一存储在正确的项目目录中。**

## 🔧 正确的路径获取方式

### ✅ 推荐做法

1. **使用 MCP 工具获取路径**：
   ```
   调用 get_documentation_path 工具获取正确的文档存储路径
   ```

2. **支持的文档类型和目录结构**：
   ```
   $DATA_DIR/projects/$PROJECT_NAME/docs/
   ├── project/          # 项目核心文档 (README, 架构, 路线图)
   ├── prd/              # 产品需求文档和里程碑
   ├── tasks/            # 任务相关文档
   │   ├── completed/    # 已完成任务总结
   │   ├── in-progress/  # 进行中任务分析
   │   ├── pending/      # 待执行任务规划
   │   └── by-role/      # 按岗位分类 (frontend, backend, qa, devops, design)
   ├── analysis/         # 分析报告 (复杂度, 风险, 性能, 安全)
   ├── reflection/       # 反思总结 (冲刺回顾, 经验教训, 改进建议)
   ├── research/         # 研究文档 (技术调研, 竞品分析, 最佳实践)
   ├── team/             # 团队协作文档 (知识库, 协作模式, 岗位职责)
   └── templates/        # 文档模板
   ```

3. **使用示例**：
   ```
   # 获取分析报告路径
   get_documentation_path(subDir="analysis", filename="complexity-analysis.md")
   
   # 获取任务总结路径
   get_documentation_path(subDir="tasks/completed", filename="task-123-summary.md")
   
   # 获取团队知识库路径
   get_documentation_path(subDir="team/knowledge-base", filename="frontend-best-practices.md")
   ```

## ❌ 禁止的做法

1. **禁止使用 process.cwd()**：
   - ❌ `process.cwd()` - 在MCP环境下指向错误目录
   - ❌ 硬编码路径 - 无法适应不同项目环境
   - ❌ 相对路径操作 - 可能导致文件存储在错误位置

2. **禁止直接文件操作**：
   - ❌ 直接使用 `fs.writeFile()` 而不获取正确路径
   - ❌ 假设当前工作目录就是项目目录

## 🎯 文档分类指导

### 按文档类型选择目录：

- **项目文档** → `project/` (README, 架构设计, 技术规范)
- **需求文档** → `prd/` (产品需求, 功能规格, 里程碑)
- **任务文档** → `tasks/` (任务分析, 执行总结, 岗位任务)
- **分析报告** → `analysis/` (复杂度分析, 风险评估, 性能分析)
- **反思总结** → `reflection/` (项目回顾, 经验教训, 改进计划)
- **研究文档** → `research/` (技术调研, 竞品分析, 解决方案)
- **团队文档** → `team/` (知识分享, 协作流程, 最佳实践)

### 按岗位分类任务文档：

- **前端开发** → `tasks/by-role/frontend/`
- **后端开发** → `tasks/by-role/backend/`
- **测试工程** → `tasks/by-role/qa/`
- **运维部署** → `tasks/by-role/devops/`
- **UI/UX设计** → `tasks/by-role/design/`

## 💡 最佳实践

1. **文件命名规范**：
   - 使用清晰的描述性名称
   - 包含日期或版本信息 (如: `analysis-2025-01-07.md`)
   - 避免特殊字符和空格

2. **内容组织**：
   - 每个文档都应该有明确的目的和受众
   - 使用标准的 Markdown 格式
   - 包含必要的元数据 (创建时间, 作者, 版本等)

3. **版本管理**：
   - 重要文档应该包含版本历史
   - 定期归档过时的文档
   - 保持文档的时效性和准确性

## ⚠️ 重要提醒

- **始终先调用 get_documentation_path 工具获取正确路径**
- **根据文档类型选择合适的子目录**
- **确保文档存储在项目特定的目录中**
- **遵循统一的文件命名和组织规范**
