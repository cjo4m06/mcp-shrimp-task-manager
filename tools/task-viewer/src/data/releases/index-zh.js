// Release metadata only - actual content is loaded from /releases/*.md files
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: '任务完成摘要存储系统',
    summary: '增强任务完成详情，配备结构化数据模型和智能摘要解析功能'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: '增强版发布说明与存档系统',
    summary: '上下文追踪功能，初始请求显示，AI驱动的摘要生成，增强版发布说明与目录，以及全面的存档管理'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: '初始请求显示',
    summary: '捕获并显示启动任务规划的原始用户请求，为任务列表提供重要上下文'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: '国际化、任务历史、子代理、灯箱',
    summary: '多语言支持、模板自定义、项目历史、代理管理、图像灯箱和重要UI增强'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: '增强任务管理与VS Code集成',
    summary: 'VS Code文件链接、改进的UUID管理、依赖项列和应用内发布说明'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: '初始独立发布版',
    summary: '基于Web的任务查看器，配备配置文件管理、实时更新和现代化UI'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};