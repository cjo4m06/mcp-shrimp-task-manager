import "dotenv/config";
import { loadPromptFromTemplate } from "./prompts/loader.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { getProjectDataDir } from "./utils/pathManager.js";
import { setServerInstance } from "./utils/serverInstance.js";
import { log } from "./utils/logger.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response, NextFunction } from "express";
import getPort from "get-port";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";

// 導入所有工具函數和 schema
import {
  planTask,
  planTaskSchema,
  analyzeTask,
  analyzeTaskSchema,
  reflectTask,
  reflectTaskSchema,
  splitTasks,
  splitTasksSchema,
  splitTasksRaw,
  splitTasksRawSchema,
  listTasksSchema,
  listTasks,
  executeTask,
  executeTaskSchema,
  verifyTask,
  verifyTaskSchema,
  deleteTask,
  deleteTaskSchema,
  clearAllTasks,
  clearAllTasksSchema,
  updateTaskContent,
  updateTaskContentSchema,
  queryTask,
  queryTaskSchema,
  getTaskDetail,
  getTaskDetailSchema,
  processThought,
  processThoughtSchema,
  initProjectRules,
  initProjectRulesSchema,
  researchMode,
  researchModeSchema,
  getProjectContext,
  getProjectContextSchema,
  analyzeWorkingDirectory,
  analyzeWorkingDirectorySchema,
  setProjectWorkingDirectory,
  setProjectWorkingDirectorySchema,
  diagnoseMcpEnvironment,
  diagnoseMcpEnvironmentSchema,
  viewRealtimeLogs,
  viewRealtimeLogsSchema,
  resetProjectDetection,
  resetProjectDetectionSchema,
  showPathStatus,
  showPathStatusSchema,
  validateProjectIsolation,
  validateProjectIsolationSchema,
} from "./tools/index.js";

async function main() {
  try {
    // 确保关键环境变量有默认值
    if (!process.env.PROJECT_AUTO_DETECT) {
      process.env.PROJECT_AUTO_DETECT = 'true';
    }
    if (!process.env.TEMPLATES_USE) {
      process.env.TEMPLATES_USE = 'zh';
    }

    // 初始化日志系统
    await log.init();
    log.info("System", "MCP Shrimp Task Manager 启动", {
      version: "1.0.19",
      nodeVersion: process.version,
      platform: process.platform,
      env: {
        ENABLE_GUI: process.env.ENABLE_GUI,
        PROJECT_AUTO_DETECT: process.env.PROJECT_AUTO_DETECT,
        DATA_DIR: process.env.DATA_DIR,
        TEMPLATES_USE: process.env.TEMPLATES_USE,
        LOG_LEVEL: process.env.LOG_LEVEL,
        LOG_TO_CONSOLE: process.env.LOG_TO_CONSOLE,
      }
    });

    const ENABLE_GUI = process.env.ENABLE_GUI === "true";

    if (ENABLE_GUI) {
      log.info("GUI", "启用Web GUI模式");
      // 創建 Express 應用
      const app = express();

      // 儲存 SSE 客戶端的列表
      let sseClients: Response[] = [];

      // 發送 SSE 事件的輔助函數
      function sendSseUpdate() {
        sseClients.forEach((client) => {
          // 檢查客戶端是否仍然連接
          if (!client.writableEnded) {
            client.write(
              `event: update\ndata: ${JSON.stringify({
                timestamp: Date.now(),
              })}\n\n`
            );
          }
        });
        // 清理已斷開的客戶端 (可選，但建議)
        sseClients = sseClients.filter((client) => !client.writableEnded);
      }

      // 設置靜態文件目錄
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const publicPath = path.join(__dirname, "public");

      // 獲取項目感知的數據目錄
      const DATA_DIR = await getProjectDataDir();
      const TASKS_FILE_PATH = path.join(DATA_DIR, "tasks.json"); // 提取檔案路徑

      // 设置项目特定的日志目录
      await log.setProjectDir(DATA_DIR);

      log.info("GUI", "数据目录配置", {
        projectDataDir: DATA_DIR,
        tasksFile: TASKS_FILE_PATH
      });

      app.use(express.static(publicPath));

      // 設置 API 路由
      app.get("/api/tasks", async (req: Request, res: Response) => {
        try {
          // 使用 fsPromises 保持異步讀取
          const tasksData = await fsPromises.readFile(TASKS_FILE_PATH, "utf-8");
          res.json(JSON.parse(tasksData));
        } catch (error) {
          // 確保檔案不存在時返回空任務列表
          if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            res.json({ tasks: [] });
          } else {
            res.status(500).json({ error: "Failed to read tasks data" });
          }
        }
      });

      // 新增：SSE 端點
      app.get("/api/tasks/stream", (req: Request, res: Response) => {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          // 可選: CORS 頭，如果前端和後端不在同一個 origin
          // "Access-Control-Allow-Origin": "*",
        });

        // 發送一個初始事件或保持連接
        res.write("data: connected\n\n");

        // 將客戶端添加到列表
        sseClients.push(res);

        // 當客戶端斷開連接時，將其從列表中移除
        req.on("close", () => {
          sseClients = sseClients.filter((client) => client !== res);
        });
      });

      // 獲取可用埠
      const port = await getPort();
      log.info("GUI", `获取到可用端口: ${port}`);

      // 啟動 HTTP 伺服器
      const httpServer = app.listen(port, () => {
        log.info("GUI", `HTTP服务器启动成功`, {
          port,
          url: `http://localhost:${port}`
        });
        // 在伺服器啟動後開始監聽檔案變化
        try {
          // 檢查檔案是否存在，如果不存在則不監聽 (避免 watch 報錯)
          if (fs.existsSync(TASKS_FILE_PATH)) {
            fs.watch(TASKS_FILE_PATH, (eventType, filename) => {
              if (
                filename &&
                (eventType === "change" || eventType === "rename")
              ) {
                // 稍微延遲發送，以防短時間內多次觸發 (例如編輯器保存)
                // debounce sendSseUpdate if needed
                sendSseUpdate();
              }
            });
          }
        } catch (watchError) {}
      });

      // 將 URL 寫入 WebGUI.md
      try {
        // 讀取 TEMPLATES_USE 環境變數並轉換為語言代碼
        const templatesUse = process.env.TEMPLATES_USE || "en";
        const getLanguageFromTemplate = (template: string): string => {
          if (template === "zh") return "zh-TW";
          if (template === "en") return "en";
          // 自訂範本預設使用英文
          return "en";
        };
        const language = getLanguageFromTemplate(templatesUse);

        const websiteUrl = `[Task Manager UI](http://localhost:${port}?lang=${language})`;
        const websiteFilePath = path.join(DATA_DIR, "WebGUI.md");
        await fsPromises.writeFile(websiteFilePath, websiteUrl, "utf-8");
      } catch (error) {}

      // 設置進程終止事件處理 (確保移除 watcher)
      const shutdownHandler = async () => {
        // 關閉所有 SSE 連接
        sseClients.forEach((client) => client.end());
        sseClients = [];

        // 關閉 HTTP 伺服器
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
        process.exit(0);
      };

      process.on("SIGINT", shutdownHandler);
      process.on("SIGTERM", shutdownHandler);
    }

    // 在非GUI模式下也设置项目特定的日志目录
    if (!ENABLE_GUI) {
      const projectDataDir = await getProjectDataDir();
      await log.setProjectDir(projectDataDir);
      log.info("System", "项目数据目录配置", { projectDataDir });
    }

    // 創建MCP服務器
    log.info("MCP", "创建MCP服务器");
    const server = new Server(
      {
        name: "Shrimp Task Manager",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          roots: {
            listChanged: true,
          },
        },
      }
    );

    // 設置全局服務器實例，供項目檢測使用
    setServerInstance(server);
    log.info("MCP", "设置全局服务器实例完成");

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      log.debug("MCP", "收到工具列表请求");
      return {
        tools: [
          {
            name: "plan_task",
            description: loadPromptFromTemplate("toolsDescription/planTask.md"),
            inputSchema: zodToJsonSchema(planTaskSchema),
          },
          {
            name: "analyze_task",
            description: loadPromptFromTemplate(
              "toolsDescription/analyzeTask.md"
            ),
            inputSchema: zodToJsonSchema(analyzeTaskSchema),
          },
          {
            name: "reflect_task",
            description: loadPromptFromTemplate(
              "toolsDescription/reflectTask.md"
            ),
            inputSchema: zodToJsonSchema(reflectTaskSchema),
          },
          {
            name: "split_tasks",
            description: loadPromptFromTemplate(
              "toolsDescription/splitTasks.md"
            ),
            inputSchema: zodToJsonSchema(splitTasksRawSchema),
          },
          {
            name: "list_tasks",
            description: loadPromptFromTemplate(
              "toolsDescription/listTasks.md"
            ),
            inputSchema: zodToJsonSchema(listTasksSchema),
          },
          {
            name: "execute_task",
            description: loadPromptFromTemplate(
              "toolsDescription/executeTask.md"
            ),
            inputSchema: zodToJsonSchema(executeTaskSchema),
          },
          {
            name: "verify_task",
            description: loadPromptFromTemplate(
              "toolsDescription/verifyTask.md"
            ),
            inputSchema: zodToJsonSchema(verifyTaskSchema),
          },
          {
            name: "delete_task",
            description: loadPromptFromTemplate(
              "toolsDescription/deleteTask.md"
            ),
            inputSchema: zodToJsonSchema(deleteTaskSchema),
          },
          {
            name: "clear_all_tasks",
            description: loadPromptFromTemplate(
              "toolsDescription/clearAllTasks.md"
            ),
            inputSchema: zodToJsonSchema(clearAllTasksSchema),
          },
          {
            name: "update_task",
            description: loadPromptFromTemplate(
              "toolsDescription/updateTask.md"
            ),
            inputSchema: zodToJsonSchema(updateTaskContentSchema),
          },
          {
            name: "query_task",
            description: loadPromptFromTemplate(
              "toolsDescription/queryTask.md"
            ),
            inputSchema: zodToJsonSchema(queryTaskSchema),
          },
          {
            name: "get_task_detail",
            description: loadPromptFromTemplate(
              "toolsDescription/getTaskDetail.md"
            ),
            inputSchema: zodToJsonSchema(getTaskDetailSchema),
          },
          {
            name: "process_thought",
            description: loadPromptFromTemplate(
              "toolsDescription/processThought.md"
            ),
            inputSchema: zodToJsonSchema(processThoughtSchema),
          },
          {
            name: "init_project_rules",
            description: loadPromptFromTemplate(
              "toolsDescription/initProjectRules.md"
            ),
            inputSchema: zodToJsonSchema(initProjectRulesSchema),
          },
          {
            name: "research_mode",
            description: loadPromptFromTemplate(
              "toolsDescription/researchMode.md"
            ),
            inputSchema: zodToJsonSchema(researchModeSchema),
          },
          {
            name: "get_project_context",
            description: loadPromptFromTemplate(
              "toolsDescription/getProjectContext.md"
            ),
            inputSchema: zodToJsonSchema(getProjectContextSchema),
          },
          {
            name: "analyze_working_directory",
            description: loadPromptFromTemplate(
              "toolsDescription/analyzeWorkingDirectory.md"
            ),
            inputSchema: zodToJsonSchema(analyzeWorkingDirectorySchema),
          },
          {
            name: "set_project_working_directory",
            description: loadPromptFromTemplate(
              "toolsDescription/setProjectWorkingDirectory.md"
            ),
            inputSchema: zodToJsonSchema(setProjectWorkingDirectorySchema),
          },
          {
            name: "diagnose_mcp_environment",
            description: loadPromptFromTemplate(
              "toolsDescription/diagnoseMcpEnvironment.md"
            ),
            inputSchema: zodToJsonSchema(diagnoseMcpEnvironmentSchema),
          },
          {
            name: "view_realtime_logs",
            description: loadPromptFromTemplate(
              "toolsDescription/viewRealtimeLogs.md"
            ),
            inputSchema: zodToJsonSchema(viewRealtimeLogsSchema),
          },
          {
            name: "reset_project_detection",
            description: loadPromptFromTemplate(
              "toolsDescription/resetProjectDetection.md"
            ),
            inputSchema: zodToJsonSchema(resetProjectDetectionSchema),
          },
          {
            name: "show_path_status",
            description: loadPromptFromTemplate(
              "toolsDescription/showPathStatus.md"
            ),
            inputSchema: zodToJsonSchema(showPathStatusSchema),
          },
          {
            name: "validate_project_isolation",
            description: loadPromptFromTemplate(
              "toolsDescription/validateProjectIsolation.md"
            ),
            inputSchema: zodToJsonSchema(validateProjectIsolationSchema),
          },
        ],
      };
    });

    server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const startTime = Date.now();
        log.info("MCP", `收到工具调用请求: ${request.params.name}`, {
          toolName: request.params.name,
        });

        try {
          if (!request.params.arguments) {
            throw new Error("No arguments provided");
          }

          let parsedArgs;
          switch (request.params.name) {
            case "plan_task":
              parsedArgs = await planTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await planTask(parsedArgs.data);
            case "analyze_task":
              parsedArgs = await analyzeTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await analyzeTask(parsedArgs.data);
            case "reflect_task":
              parsedArgs = await reflectTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await reflectTask(parsedArgs.data);
            case "split_tasks":
              parsedArgs = await splitTasksRawSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await splitTasksRaw(parsedArgs.data);
            case "list_tasks":
              parsedArgs = await listTasksSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await listTasks(parsedArgs.data);
            case "execute_task":
              parsedArgs = await executeTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await executeTask(parsedArgs.data);
            case "verify_task":
              parsedArgs = await verifyTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await verifyTask(parsedArgs.data);
            case "delete_task":
              parsedArgs = await deleteTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await deleteTask(parsedArgs.data);
            case "clear_all_tasks":
              parsedArgs = await clearAllTasksSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await clearAllTasks(parsedArgs.data);
            case "update_task":
              parsedArgs = await updateTaskContentSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await updateTaskContent(parsedArgs.data);
            case "query_task":
              parsedArgs = await queryTaskSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await queryTask(parsedArgs.data);
            case "get_task_detail":
              parsedArgs = await getTaskDetailSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await getTaskDetail(parsedArgs.data);
            case "process_thought":
              parsedArgs = await processThoughtSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await processThought(parsedArgs.data);
            case "init_project_rules":
              return await initProjectRules();
            case "research_mode":
              parsedArgs = await researchModeSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await researchMode(parsedArgs.data);
            case "get_project_context":
              parsedArgs = await getProjectContextSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await getProjectContext(parsedArgs.data);
            case "analyze_working_directory":
              parsedArgs = await analyzeWorkingDirectorySchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await analyzeWorkingDirectory(parsedArgs.data);
            case "set_project_working_directory":
              parsedArgs = await setProjectWorkingDirectorySchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await setProjectWorkingDirectory(parsedArgs.data);
            case "diagnose_mcp_environment":
              parsedArgs = await diagnoseMcpEnvironmentSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await diagnoseMcpEnvironment(parsedArgs.data);
            case "view_realtime_logs":
              parsedArgs = await viewRealtimeLogsSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await viewRealtimeLogs(parsedArgs.data);
            case "reset_project_detection":
              parsedArgs = await resetProjectDetectionSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await resetProjectDetection(parsedArgs.data);
            case "show_path_status":
              parsedArgs = await showPathStatusSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await showPathStatus(parsedArgs.data);
            case "validate_project_isolation":
              parsedArgs = await validateProjectIsolationSchema.safeParseAsync(
                request.params.arguments
              );
              if (!parsedArgs.success) {
                throw new Error(
                  `Invalid arguments for tool ${request.params.name}: ${parsedArgs.error.message}`
                );
              }
              return await validateProjectIsolation(parsedArgs.data);
            default:
              throw new Error(`Tool ${request.params.name} does not exist`);
          }
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMsg = error instanceof Error ? error.message : String(error);

          log.error("MCP", `工具调用失败: ${request.params.name}`, error as Error, {
            toolName: request.params.name,
            duration,
            arguments: request.params.arguments,
          });

          return {
            content: [
              {
                type: "text",
                text: `Error occurred: ${errorMsg} \n Please try correcting the error and calling the tool again`,
              },
            ],
          };
        } finally {
          const duration = Date.now() - startTime;
          log.debug("MCP", `工具调用完成: ${request.params.name}`, {
            toolName: request.params.name,
            duration: `${duration}ms`,
          });
        }
      }
    );

    // 建立連接
    log.info("MCP", "建立MCP连接");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log.info("MCP", "MCP服务器连接成功，开始监听请求");

    // 注册进程退出清理
    const cleanup = () => {
      log.info("Server", "正在清理资源...");
      // 获取logger实例并清理
      import("./utils/logger.js").then(({ logger }) => {
        logger.cleanup();
      }).catch(() => {});
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

  } catch (error) {
    log.error("System", "系统启动失败", error as Error);
    // 获取logger实例并清理
    import("./utils/logger.js").then(({ logger }) => {
      logger.cleanup();
    }).catch(() => {});
    process.exit(1);
  }
}

main().catch(console.error);
