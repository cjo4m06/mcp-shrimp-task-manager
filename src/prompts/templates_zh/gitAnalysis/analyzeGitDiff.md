# Git 变更分析

本分析检查代码变更以帮助确定哪些任务可能已完成。

## 提交信息
{{commitInfo}}

## 变更文件
{{#each changedFiles}}
- {{this}}
{{/each}}

## 代码变更摘要
可以获取差异输出进行详细分析。
检查变更以确定已实现或修改了哪些功能。

## 任务分析
以下任务可能与变更匹配：

{{#each tasksToAnalyze}}
- **任务ID**: {{this.id}}
- **名称**: {{this.name}}
- **状态**: {{this.status}}
- **描述**: {{this.description}}
{{/each}}

## 建议
根据变更和任务，考虑哪些任务可能已完成或部分完成。
寻找代码变更与任务需求之间的明确关联。 