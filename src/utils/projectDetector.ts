/**
 * MCP风格的项目检测器
 * 提供简单、可靠的项目上下文检测，遵循MCP最佳实践
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { log } from './logger.js';

/**
 * 项目上下文信息
 */
export interface ProjectContext {
  /** 项目根目录（绝对路径） */
  projectRoot: string;
  /** 项目标识符（清理后的名称） */
  projectId: string;
  /** 项目显示名称 */
  projectName: string;
  /** 项目类型指标 */
  projectType: {
    hasGit: boolean;
    hasPackageJson: boolean;
    hasNodeModules: boolean;
    hasPyprojectToml: boolean;
    hasCargoToml: boolean;
    hasGoMod: boolean;
  };
  /** 包信息（如果可用） */
  packageInfo?: {
    name?: string;
    version?: string;
    description?: string;
  };
  /** 检测元数据 */
  metadata: {
    detectionMethod: 'explicit' | 'environment' | 'cwd' | 'fallback';
    configuredPaths: string[];
    timestamp: Date;
  };
}

/**
 * 项目检测配置
 */
export interface ProjectDetectorConfig {
  /** 显式配置的项目路径 */
  allowedPaths?: string[];
  /** 检查的环境变量名 */
  projectPathEnv?: string;
  /** 是否启用自动检测 */
  autoDetect?: boolean;
  /** 回退目录 */
  fallbackDir?: string;
}

/**
 * 清理项目名称以创建有效的标识符
 * @param name 原始项目名称
 * @returns 清理后的项目ID
 */
function sanitizeProjectId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50); // 限制长度
}

/**
 * 标准化和解析路径
 * @param inputPath 输入路径（可能是相对路径或包含~）
 * @returns 绝对标准化路径
 */
function normalizePath(inputPath: string): string {
  // 展开主目录
  const expandedPath = inputPath.startsWith('~') ? path.join(os.homedir(), inputPath.slice(1)) : inputPath;

  // 解析为绝对路径并标准化
  return path.normalize(path.resolve(expandedPath));
}

/**
 * 验证路径是否存在且可访问
 * @param dirPath 要验证的目录路径
 * @returns 如果路径存在且可访问则返回true
 */
async function validatePath(dirPath: string): Promise<boolean> {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查目录是否包含.git仓库
 * @param dirPath 要检查的目录路径
 * @returns 如果.git目录存在则返回true
 */
async function hasGitRepository(dirPath: string): Promise<boolean> {
  try {
    const gitPath = path.join(dirPath, '.git');
    const stats = await fs.stat(gitPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 读取并解析package.json文件（如果存在）
 * @param dirPath 要检查的目录路径
 * @returns 包信息，如果未找到则返回null
 */
async function readPackageJson(
  dirPath: string
): Promise<{ name?: string; version?: string; description?: string } | null> {
  try {
    const packageJsonPath = path.join(dirPath, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageData = JSON.parse(content);
    return {
      name: packageData.name,
      version: packageData.version,
      description: packageData.description,
    };
  } catch {
    return null;
  }
}

/**
 * 检测目录中的项目类型指标
 * @param dirPath 要分析的目录路径
 * @returns 包含不同项目类型布尔标志的对象
 */
async function detectProjectType(dirPath: string) {
  const checks = await Promise.allSettled([
    hasGitRepository(dirPath),
    validatePath(path.join(dirPath, 'package.json')),
    validatePath(path.join(dirPath, 'node_modules')),
    validatePath(path.join(dirPath, 'pyproject.toml')),
    validatePath(path.join(dirPath, 'Cargo.toml')),
    validatePath(path.join(dirPath, 'go.mod')),
  ]);

  return {
    hasGit: checks[0].status === 'fulfilled' ? checks[0].value : false,
    hasPackageJson: checks[1].status === 'fulfilled' ? checks[1].value : false,
    hasNodeModules: checks[2].status === 'fulfilled' ? checks[2].value : false,
    hasPyprojectToml: checks[3].status === 'fulfilled' ? checks[3].value : false,
    hasCargoToml: checks[4].status === 'fulfilled' ? checks[4].value : false,
    hasGoMod: checks[5].status === 'fulfilled' ? checks[5].value : false,
  };
}

/**
 * 通过向上遍历目录树查找项目根目录
 * @param startPath 起始目录路径
 * @returns 项目根路径，如果未找到则返回null
 */
async function findProjectRoot(startPath: string): Promise<string | null> {
  const projectIndicators = ['.git', 'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', '.shrimp-config.json'];

  let currentDir = normalizePath(startPath);
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    // 检查当前目录中的任何项目指标
    for (const indicator of projectIndicators) {
      const indicatorPath = path.join(currentDir, indicator);
      if (await validatePath(indicatorPath)) {
        log.debug('ProjectDetector', '找到项目指标', {
          indicator,
          projectRoot: currentDir,
        });
        return currentDir;
      }
    }

    // 向上移动一个目录
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // 到达根目录
    currentDir = parentDir;
  }

  return null;
}

/**
 * 获取项目上下文信息，使用MCP风格的简单可靠检测
 * @param config 检测配置
 * @returns 项目上下文信息
 */
export async function getProjectContext(config: ProjectDetectorConfig = {}): Promise<ProjectContext> {
  const {
    allowedPaths = [],
    projectPathEnv = 'SHRIMP_PROJECT_PATH',
    autoDetect = true,
    fallbackDir = process.cwd(),
  } = config;

  let projectRoot: string | undefined;
  let detectionMethod: ProjectContext['metadata']['detectionMethod'] = 'fallback';

  // 1. 首先检查显式配置的路径
  if (allowedPaths.length > 0) {
    for (const allowedPath of allowedPaths) {
      const normalizedPath = normalizePath(allowedPath);
      if (await validatePath(normalizedPath)) {
        projectRoot = normalizedPath;
        detectionMethod = 'explicit';
        log.info('ProjectDetector', '使用显式配置的路径', { projectRoot });
        break;
      }
    }
  }

  // 2. 检查环境变量
  if (!projectRoot) {
    const envPath = process.env[projectPathEnv];
    if (envPath) {
      const normalizedEnvPath = normalizePath(envPath);
      if (await validatePath(normalizedEnvPath)) {
        projectRoot = normalizedEnvPath;
        detectionMethod = 'environment';
        log.info('ProjectDetector', '使用环境变量路径', {
          envVar: projectPathEnv,
          projectRoot,
        });
      } else {
        log.warn('ProjectDetector', '环境变量路径不可访问', {
          envVar: projectPathEnv,
          envPath: normalizedEnvPath,
        });
      }
    }
  }

  // 3. 从当前工作目录自动检测
  if (!projectRoot && autoDetect) {
    const cwd = process.cwd();

    // 检查是否在IDE安装目录（常见的MCP环境问题）
    const suspiciousPatterns = [
      /Programs.*Windsurf/i,
      /Programs.*Cursor/i,
      /Programs.*Claude/i,
      /AppData.*Local.*Programs/i,
      /node_modules/i,
      /\.vscode/i,
    ];

    const isInIdeDirectory = suspiciousPatterns.some((pattern) => pattern.test(cwd));

    if (isInIdeDirectory) {
      log.warn('ProjectDetector', '检测到在IDE安装目录中运行，跳过自动检测', {
        cwd,
        reason: '可能是MCP环境，process.cwd()指向IDE安装目录',
      });
    } else {
      const detectedRoot = await findProjectRoot(cwd);
      if (detectedRoot) {
        projectRoot = detectedRoot;
        detectionMethod = 'cwd';
        log.info('ProjectDetector', '自动检测到项目根目录', { projectRoot });
      }
    }
  }

  // 4. 回退到指定目录
  if (!projectRoot) {
    projectRoot = normalizePath(fallbackDir);
    detectionMethod = 'fallback';
    log.info('ProjectDetector', '使用回退目录', { projectRoot });
  }

  // 分析项目
  const projectType = await detectProjectType(projectRoot);
  const packageInfo = await readPackageJson(projectRoot);

  // 生成项目名称和ID
  const projectName = packageInfo?.name || path.basename(projectRoot);
  const projectId = sanitizeProjectId(projectName);

  return {
    projectRoot,
    projectId,
    projectName,
    projectType,
    packageInfo: packageInfo || undefined,
    metadata: {
      detectionMethod,
      configuredPaths: allowedPaths,
      timestamp: new Date(),
    },
  };
}

/**
 * 简单的项目根目录检测，用于MCP工具
 * 使用MCP风格的检测返回项目根目录
 * @param workingDir 可选的工作目录覆盖
 * @returns 项目根目录路径
 */
export async function detectProjectRoot(workingDir?: string): Promise<string> {
  if (workingDir) {
    // 如果提供了工作目录，从该目录开始向上查找项目根目录
    const foundRoot = await findProjectRoot(workingDir);
    return foundRoot || workingDir;
  }

  // 否则使用标准的项目上下文检测
  const config: ProjectDetectorConfig = {
    autoDetect: true,
    fallbackDir: process.cwd(),
  };

  const projectContext = await getProjectContext(config);
  return projectContext.projectRoot;
}

// 所有旧的复杂检测函数已被移除
// 新的MCP风格方法使用简单、可靠的检测方法
