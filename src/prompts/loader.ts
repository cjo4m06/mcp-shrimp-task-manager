/**
 * prompt 載入器
 * 提供從環境變數載入自定義 prompt 的功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PromptConfig, PromptCategory, ChainPrompt } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processEnvString(input: string | undefined): string {
  if (!input) return '';

  return input.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
}

/**
 * 載入 prompt，支援環境變數自定義
 * @param basePrompt 基本 prompt 內容
 * @param promptKey prompt 的鍵名，用於生成環境變數名稱
 * @returns 最終的 prompt 內容
 */
export function loadPrompt(basePrompt: string, promptKey: string): string {
  // 轉換為大寫，作為環境變數的一部分
  const envKey = promptKey.toUpperCase();

  // 檢查是否有替換模式的環境變數
  const overrideEnvVar = `MCP_PROMPT_${envKey}`;
  if (process.env[overrideEnvVar]) {
    // 使用環境變數完全替換原始 prompt
    return processEnvString(process.env[overrideEnvVar]);
  }

  // 檢查是否有追加模式的環境變數
  const appendEnvVar = `MCP_PROMPT_${envKey}_APPEND`;
  if (process.env[appendEnvVar]) {
    // 將環境變數內容追加到原始 prompt 後
    return `${basePrompt}\n\n${processEnvString(process.env[appendEnvVar])}`;
  }

  // 如果沒有自定義，則使用原始 prompt
  return basePrompt;
}

/**
 * 生成包含動態參數的 prompt
 * @param promptTemplate prompt 模板
 * @param params 動態參數
 * @returns 填充參數後的 prompt
 */
export function generatePrompt(promptTemplate: string, params: Record<string, any> = {}): string {
  // 使用簡單的模板替換方法，將 {paramName} 替換為對應的參數值
  let result = promptTemplate;

  Object.entries(params).forEach(([key, value]) => {
    // 如果值為 undefined 或 null，使用空字串替換
    const replacementValue = value !== undefined && value !== null ? String(value) : '';

    // 使用正則表達式替換所有匹配的佔位符
    const placeholder = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(placeholder, replacementValue);
  });

  return result;
}

/**
 * 處理模板包含指令
 * @param content 模板內容
 * @param templateDir 模板目錄路徑
 * @returns 處理後的內容
 */
function processTemplateIncludes(content: string, templateDir: string): string {
  // 匹配 {{include:shared/filename.md}} 格式
  return content.replace(/\{\{include:(.+?)\}\}/g, (match, includePath) => {
    try {
      // 找到模板集的根目錄（templates_en 或 templates_zh）
      const templateSetRoot = findTemplateSetRoot(templateDir);
      const includeFile = path.join(templateSetRoot, includePath);

      if (fs.existsSync(includeFile)) {
        const includeContent = fs.readFileSync(includeFile, 'utf-8');
        // 遞歸處理包含的文件中的包含指令
        return processTemplateIncludes(includeContent, templateSetRoot);
      } else {
        console.warn(`Include file not found: ${includeFile}`);
        return `<!-- Include file not found: ${includePath} -->`;
      }
    } catch (error) {
      console.error(`Error processing include ${includePath}:`, error);
      return `<!-- Error processing include: ${includePath} -->`;
    }
  });
}

/**
 * 找到模板集的根目錄
 * @param templateDir 當前模板目錄
 * @returns 模板集根目錄路徑
 */
function findTemplateSetRoot(templateDir: string): string {
  let currentDir = templateDir;

  // 向上查找直到找到 templates_en 或 templates_zh 目錄
  while (currentDir && currentDir !== path.dirname(currentDir)) {
    const dirName = path.basename(currentDir);
    if (dirName.startsWith('templates_')) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // 如果沒找到，返回原始目錄
  return templateDir;
}

/**
 * 從模板載入 prompt
 * @param templatePath 相對於模板集根目錄的模板路徑 (e.g., 'chat/basic.md')
 * @returns 模板內容
 * @throws Error 如果找不到模板文件
 */
export function loadPromptFromTemplate(templatePath: string): string {
  const templateSetName = process.env.TEMPLATES_USE || 'en';
  const dataDir = process.env.DATA_DIR;
  const builtInTemplatesBaseDir = __dirname;

  let finalPath = '';
  const checkedPaths: string[] = []; // 用於更詳細的錯誤報告

  // 1. 檢查 DATA_DIR 中的自定義路徑
  if (dataDir) {
    // path.resolve 可以處理 templateSetName 是絕對路徑的情況
    const customFilePath = path.resolve(dataDir, templateSetName, templatePath);
    checkedPaths.push(`Custom: ${customFilePath}`);
    if (fs.existsSync(customFilePath)) {
      finalPath = customFilePath;
    }
  }

  // 2. 如果未找到自定義路徑，檢查特定的內建模板目錄
  if (!finalPath) {
    // 假設 templateSetName 對於內建模板是 'en', 'zh' 等
    const specificBuiltInFilePath = path.join(builtInTemplatesBaseDir, `templates_${templateSetName}`, templatePath);
    checkedPaths.push(`Specific Built-in: ${specificBuiltInFilePath}`);
    if (fs.existsSync(specificBuiltInFilePath)) {
      finalPath = specificBuiltInFilePath;
    }
  }

  // 3. 如果特定的內建模板也未找到，且不是 'en' (避免重複檢查)
  if (!finalPath && templateSetName !== 'en') {
    const defaultBuiltInFilePath = path.join(builtInTemplatesBaseDir, 'templates_en', templatePath);
    checkedPaths.push(`Default Built-in ('en'): ${defaultBuiltInFilePath}`);
    if (fs.existsSync(defaultBuiltInFilePath)) {
      finalPath = defaultBuiltInFilePath;
    }
  }

  // 4. 如果所有路徑都找不到模板，拋出錯誤
  if (!finalPath) {
    throw new Error(
      `Template file not found: '${templatePath}' in template set '${templateSetName}'. Checked paths:\n - ${checkedPaths.join(
        '\n - '
      )}`
    );
  }

  // 5. 讀取找到的文件
  let content = fs.readFileSync(finalPath, 'utf-8');

  // 6. 處理模板包含（{{include:shared/filename.md}}）
  content = processTemplateIncludes(content, path.dirname(finalPath));

  return content;
}

// ===== 增强 Prompt 系统功能 =====

/**
 * 加载 prompt 配置文件
 * @returns Prompt 配置对象
 */
export function loadPromptConfig(): PromptConfig {
  const configPath = path.join(__dirname, 'promptsConfig.json');

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent) as PromptConfig;
  } catch (error) {
    console.warn(`Failed to load prompt config from ${configPath}:`, error);
    // 返回默认配置
    return getDefaultPromptConfig();
  }
}

/**
 * 获取默认的 prompt 配置
 * @returns 默认配置对象
 */
function getDefaultPromptConfig(): PromptConfig {
  return {
    version: '1.0.0',
    description: 'Default Enhanced Prompt System Configuration',
    categories: {},
    chains: {},
    settings: {
      defaultLanguage: 'zh',
      enableHotReload: false,
      cacheEnabled: true,
      maxCacheSize: 50,
      loadingStrategy: 'lazy',
    },
  };
}

/**
 * 根据分类加载 prompt
 * @param categoryId 分类 ID
 * @param promptId prompt ID
 * @returns prompt 内容
 */
export function loadPromptByCategory(categoryId: string, promptId: string): string {
  const config = loadPromptConfig();
  const category = config.categories[categoryId];

  if (!category || !category.enabled) {
    throw new Error(`Category '${categoryId}' not found or disabled`);
  }

  if (!category.prompts.includes(promptId)) {
    throw new Error(`Prompt '${promptId}' not found in category '${categoryId}'`);
  }

  // 尝试从分类目录加载 prompt
  const categoryPath = path.join(__dirname, 'categories', categoryId, `${promptId}.md`);

  if (fs.existsSync(categoryPath)) {
    let content = fs.readFileSync(categoryPath, 'utf-8');
    content = processTemplateIncludes(content, path.dirname(categoryPath));
    return content;
  }

  // 如果分类目录中没有，回退到原有的模板系统
  return loadPromptFromTemplate(`${promptId}/index.md`);
}

/**
 * 获取所有可用的分类
 * @returns 分类列表
 */
export function getAvailableCategories(): PromptCategory[] {
  const config = loadPromptConfig();
  return Object.values(config.categories).filter((category) => category.enabled);
}

/**
 * 获取指定分类下的所有 prompt
 * @param categoryId 分类 ID
 * @returns prompt 列表
 */
export function getPromptsInCategory(categoryId: string): string[] {
  const config = loadPromptConfig();
  const category = config.categories[categoryId];

  if (!category || !category.enabled) {
    return [];
  }

  return category.prompts;
}

/**
 * 加载链式 prompt
 * @param chainId 链式 prompt ID
 * @returns 链式 prompt 对象
 */
export function loadChainPrompt(chainId: string): ChainPrompt {
  const config = loadPromptConfig();
  const chain = config.chains[chainId];

  if (!chain || !chain.enabled) {
    throw new Error(`Chain prompt '${chainId}' not found or disabled`);
  }

  return chain;
}
