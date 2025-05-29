/**
 * 项目检测工具
 * 自动检测当前工作项目的名称和信息
 */

import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * 项目信息接口
 */
export interface ProjectInfo {
  /** 项目标识符 */
  id: string;
  /** 检测来源 */
  source: 'env' | 'git' | 'package' | 'directory';
  /** 项目路径 */
  path: string;
  /** 原始名称（未清理） */
  rawName?: string;
}

/**
 * 项目检测缓存
 */
let projectCache: ProjectInfo | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30秒缓存

/**
 * 清理项目ID中的特殊字符
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
 * 查找Git仓库根目录
 * @param startPath 开始搜索的路径
 * @returns Git仓库根目录路径，如果未找到返回null
 */
async function findGitRoot(startPath: string): Promise<string | null> {
  try {
    const { stdout } = await execPromise('git rev-parse --show-toplevel', {
      cwd: startPath,
      timeout: 5000
    });
    return stdout.trim();
  } catch (error) {
    return null;
  }
}

/**
 * 查找package.json文件
 * @param startPath 开始搜索的路径
 * @returns package.json信息，如果未找到返回null
 */
async function findPackageJson(startPath: string): Promise<{ name?: string; path: string } | null> {
  let currentPath = path.resolve(startPath);
  const root = path.parse(currentPath).root;

  while (currentPath !== root) {
    const packageJsonPath = path.join(currentPath, 'package.json');
    
    try {
      await fs.access(packageJsonPath);
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageData = JSON.parse(content);
      
      return {
        name: packageData.name,
        path: currentPath
      };
    } catch (error) {
      // 继续向上查找
      currentPath = path.dirname(currentPath);
    }
  }

  return null;
}

/**
 * 检测当前项目信息
 * @param workingDir 工作目录，默认为process.cwd()
 * @returns 项目信息，如果检测失败返回null
 */
export async function detectProject(workingDir?: string): Promise<ProjectInfo | null> {
  const cwd = workingDir || process.cwd();
  const now = Date.now();

  // 检查缓存
  if (projectCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return projectCache;
  }

  try {
    let projectInfo: ProjectInfo | null = null;

    // 1. 环境变量优先级最高
    if (process.env.PROJECT_NAME) {
      const rawName = process.env.PROJECT_NAME;
      projectInfo = {
        id: sanitizeProjectId(rawName),
        source: 'env',
        path: cwd,
        rawName
      };
    }

    // 2. Git 仓库检测
    if (!projectInfo) {
      const gitRoot = await findGitRoot(cwd);
      if (gitRoot) {
        const rawName = path.basename(gitRoot);
        projectInfo = {
          id: sanitizeProjectId(rawName),
          source: 'git',
          path: gitRoot,
          rawName
        };
      }
    }

    // 3. package.json 检测
    if (!projectInfo) {
      const packageInfo = await findPackageJson(cwd);
      if (packageInfo?.name) {
        projectInfo = {
          id: sanitizeProjectId(packageInfo.name),
          source: 'package',
          path: packageInfo.path,
          rawName: packageInfo.name
        };
      }
    }

    // 4. 工作目录名称（最后的回退选项）
    if (!projectInfo) {
      const rawName = path.basename(cwd);
      projectInfo = {
        id: sanitizeProjectId(rawName),
        source: 'directory',
        path: cwd,
        rawName
      };
    }

    // 更新缓存
    projectCache = projectInfo;
    cacheTimestamp = now;

    return projectInfo;
  } catch (error) {
    console.error('Project detection failed:', error);
    return null;
  }
}

/**
 * 清除项目检测缓存
 */
export function clearProjectCache(): void {
  projectCache = null;
  cacheTimestamp = 0;
}

/**
 * 获取项目特定的数据目录路径
 * @param baseDataDir 基础数据目录
 * @param workingDir 工作目录
 * @returns 项目特定的数据目录路径
 */
export async function getProjectDataDir(baseDataDir: string, workingDir?: string): Promise<string> {
  // 检查是否启用项目检测
  const autoDetect = process.env.PROJECT_AUTO_DETECT === 'true';
  
  if (!autoDetect) {
    return baseDataDir; // 向后兼容，保持原有行为
  }

  const projectInfo = await detectProject(workingDir);
  
  if (projectInfo) {
    return path.join(baseDataDir, 'projects', projectInfo.id);
  }

  // 如果检测失败，回退到原有行为
  return baseDataDir;
}
