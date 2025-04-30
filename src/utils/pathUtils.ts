import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 獲取項目根目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 獲取數據目錄路徑
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, "data");

/**
 * 獲取規則文件路徑
 * @returns 規則文件的完整路徑
 */
export function getRulesFilePath(): string {
  return path.join(DATA_DIR, "rules.md");
}

/**
 * 確保規則文件存在
 * 如果文件不存在，會嘗試從根目錄複製，或創建空文件
 */
export async function ensureRulesFileExists(): Promise<void> {
  const dataRulesPath = getRulesFilePath();

  try {
    // 檢查 DATA_DIR 目錄中是否存在規則文件
    await fs.access(dataRulesPath);
  } catch (error) {
    // DATA_DIR 目錄中不存在規則文件
    await fs.mkdir(path.dirname(dataRulesPath), { recursive: true });
    await fs.writeFile(
      dataRulesPath,
      "# 開發守則\n\n請在此文件中定義專案規範。",
      "utf-8"
    );
  }
}
