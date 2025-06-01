/**
 * 统一的路径管理系统
 * 提供一致的路径获取接口，确保所有模块使用相同的路径逻辑
 */

import path from "path";
import { getProjectContext } from "./projectDetector.js";

/**
 * 路径管理器类
 * 单例模式，确保全局路径一致性
 */
class PathManager {
  private static instance: PathManager;
  private cachedProjectDataDir: string | null = null;
  private cachedProjectInfo: any = null;
  private lastUpdateTime: number = 0;
  private readonly CACHE_TTL = 5000; // 5秒缓存

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): PathManager {
    if (!PathManager.instance) {
      PathManager.instance = new PathManager();
    }
    return PathManager.instance;
  }

  /**
   * 清除缓存，强制重新检测
   */
  public clearCache(): void {
    this.cachedProjectDataDir = null;
    this.cachedProjectInfo = null;
    this.lastUpdateTime = 0;
  }

  /**
   * 获取基础数据目录
   */
  public getBaseDataDir(): string {
    return process.env.DATA_DIR || path.join(process.cwd(), "data");
  }

  /**
   * 获取项目特定的数据目录
   * 这是核心方法，所有其他路径都基于此目录
   */
  public async getProjectDataDir(forceRefresh: boolean = false): Promise<string> {
    const now = Date.now();
    
    // 检查缓存是否有效
    if (!forceRefresh && 
        this.cachedProjectDataDir && 
        (now - this.lastUpdateTime) < this.CACHE_TTL) {
      return this.cachedProjectDataDir;
    }

    // 检查是否启用项目检测
    const autoDetect = process.env.PROJECT_AUTO_DETECT === 'true';
    const baseDataDir = this.getBaseDataDir();

    if (!autoDetect) {
      this.cachedProjectDataDir = baseDataDir;
      this.lastUpdateTime = now;
      return baseDataDir;
    }

    try {
      // 重新检测项目
      const projectContext = await getProjectContext();

      if (projectContext) {
        this.cachedProjectInfo = {
          id: projectContext.projectId,
          path: projectContext.projectRoot,
          name: projectContext.projectName
        };
        this.cachedProjectDataDir = path.join(baseDataDir, 'projects', projectContext.projectId);
      } else {
        this.cachedProjectDataDir = baseDataDir;
      }
      
      this.lastUpdateTime = now;
      return this.cachedProjectDataDir;
      
    } catch (error) {
      // 检测失败时回退到基础目录
      console.warn("项目检测失败，使用基础数据目录:", error);
      this.cachedProjectDataDir = baseDataDir;
      this.lastUpdateTime = now;
      return baseDataDir;
    }
  }

  /**
   * 获取日志目录
   */
  public async getLogDir(forceRefresh: boolean = false): Promise<string> {
    const projectDataDir = await this.getProjectDataDir(forceRefresh);
    return path.join(projectDataDir, "logs");
  }

  /**
   * 获取任务文件路径
   */
  public async getTasksFilePath(forceRefresh: boolean = false): Promise<string> {
    const projectDataDir = await this.getProjectDataDir(forceRefresh);
    return path.join(projectDataDir, "tasks.json");
  }

  /**
   * 获取配置目录
   */
  public async getConfigDir(forceRefresh: boolean = false): Promise<string> {
    const projectDataDir = await this.getProjectDataDir(forceRefresh);
    return path.join(projectDataDir, "config");
  }

  /**
   * 获取临时目录
   */
  public async getTempDir(forceRefresh: boolean = false): Promise<string> {
    const projectDataDir = await this.getProjectDataDir(forceRefresh);
    return path.join(projectDataDir, "temp");
  }

  /**
   * 获取缓存的项目信息
   */
  public getCachedProjectInfo(): any {
    return this.cachedProjectInfo;
  }

  /**
   * 手动设置项目数据目录
   * 当用户通过工具手动设置项目路径时调用
   */
  public async updateProjectPath(projectPath: string): Promise<void> {
    // 清除缓存
    this.clearCache();
    
    // 设置环境变量
    process.env.SHRIMP_PROJECT_PATH = projectPath;
    
    // 强制重新获取项目数据目录
    await this.getProjectDataDir(true);
    
    // 通知其他模块更新路径
    await this.notifyPathUpdate();
  }

  /**
   * 通知其他模块路径已更新
   */
  private async notifyPathUpdate(): Promise<void> {
    try {
      // 更新日志目录
      const { logger } = await import("./logger.js");
      const newLogDir = await this.getLogDir(true);
      await logger.setProjectLogDir(path.dirname(newLogDir)); // 传递项目数据目录
      
      // 可以在这里添加其他需要更新路径的模块
      
    } catch (error) {
      console.warn("通知路径更新失败:", error);
    }
  }

  /**
   * 获取所有相关路径的摘要
   */
  public async getPathSummary(): Promise<{
    baseDataDir: string;
    projectDataDir: string;
    logDir: string;
    tasksFile: string;
    configDir: string;
    tempDir: string;
    projectInfo: any;
  }> {
    const baseDataDir = this.getBaseDataDir();
    const projectDataDir = await this.getProjectDataDir();
    const logDir = await this.getLogDir();
    const tasksFile = await this.getTasksFilePath();
    const configDir = await this.getConfigDir();
    const tempDir = await this.getTempDir();
    const projectInfo = this.getCachedProjectInfo();

    return {
      baseDataDir,
      projectDataDir,
      logDir,
      tasksFile,
      configDir,
      tempDir,
      projectInfo
    };
  }
}

// 导出单例实例
export const pathManager = PathManager.getInstance();

// 导出便捷方法
export const getProjectDataDir = (forceRefresh?: boolean) => pathManager.getProjectDataDir(forceRefresh);
export const getLogDir = (forceRefresh?: boolean) => pathManager.getLogDir(forceRefresh);
export const getTasksFilePath = (forceRefresh?: boolean) => pathManager.getTasksFilePath(forceRefresh);
export const getConfigDir = (forceRefresh?: boolean) => pathManager.getConfigDir(forceRefresh);
export const getTempDir = (forceRefresh?: boolean) => pathManager.getTempDir(forceRefresh);
export const getPathSummary = () => pathManager.getPathSummary();
export const clearPathCache = () => pathManager.clearCache();
export const updateProjectPath = (projectPath: string) => pathManager.updateProjectPath(projectPath);
