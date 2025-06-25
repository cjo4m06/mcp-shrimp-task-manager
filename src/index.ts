import "dotenv/config";
import { loadPromptFromTemplate } from "./prompts/loader.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

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
} from "./tools/index.js";

async function main() {
  try {
    // Get configuration from environment
    const MCP_PORT = parseInt(process.env.MCP_PORT || "3000", 10);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const publicPath = path.join(__dirname, "public");
    const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
    const TASKS_FILE_PATH = path.join(DATA_DIR, "tasks.json");

    // Create Express app
    const app = express();
    app.use(express.json());

    // Store active MCP transport sessions
    const mcpSessions = new Map<string, StreamableHTTPServerTransport>();

    // Store SSE clients for GUI updates
    let sseClients: Response[] = [];

    // Helper function to send SSE updates
    function sendSseUpdate() {
      sseClients.forEach((client) => {
        if (!client.writableEnded) {
          client.write(
            `event: update\ndata: ${JSON.stringify({
              timestamp: Date.now(),
            })}\n\n`
          );
        }
      });
      sseClients = sseClients.filter((client) => !client.writableEnded);
    }

    // Create MCP server instance
    const server = new Server(
      {
        name: "Shrimp Task Manager",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Set up MCP server handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
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
        ],
      };
    });

    server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
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
            default:
              throw new Error(`Tool ${request.params.name} does not exist`);
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text",
                text: `Error occurred: ${errorMsg} \n Please try correcting the error and calling the tool again`,
              },
            ],
          };
        }
      }
    );

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
    });

    // Serve static files for GUI
    app.use(express.static(publicPath));

    // GUI API endpoints
    app.get("/api/tasks", async (req: Request, res: Response) => {
      try {
        const tasksData = await fsPromises.readFile(TASKS_FILE_PATH, "utf-8");
        res.json(JSON.parse(tasksData));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          res.json({ tasks: [] });
        } else {
          res.status(500).json({ error: "Failed to read tasks data" });
        }
      }
    });

    // SSE endpoint for GUI updates
    app.get("/api/tasks/stream", (req: Request, res: Response) => {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      res.write("data: connected\n\n");
      sseClients.push(res);

      req.on("close", () => {
        sseClients = sseClients.filter((client) => client !== res);
      });
    });

    // Main MCP endpoint using StreamableHTTP transport
    app.all("/mcp", async (req: Request, res: Response) => {
      try {
        // Get or create session ID
        let sessionId = req.headers['mcp-session-id'] as string;
        if (!sessionId) {
          sessionId = uuidv4();
          res.setHeader('mcp-session-id', sessionId);
        }

        // Get or create transport for this session
        let transport = mcpSessions.get(sessionId);
        if (!transport) {
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => sessionId,
            onsessioninitialized: (id: string) => {
              console.log(`🔗 New MCP session initialized: ${id}`);
            },
            enableJsonResponse: false
          });
          mcpSessions.set(sessionId, transport);
          
          // Connect the transport to the server
          await server.connect(transport);
          
          // Clean up session when transport closes
          transport.onclose = () => {
            mcpSessions.delete(sessionId);
            console.log(`🔌 MCP session closed: ${sessionId}`);
          };
        }

        // Handle the request using the correct method
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    });

    // Start the server
    const httpServer = app.listen(MCP_PORT, () => {
      console.log(`🦐 Shrimp Task Manager MCP Server running on port ${MCP_PORT}`);
      console.log(`📊 Web GUI available at: http://localhost:${MCP_PORT}`);
      console.log(`🔌 MCP endpoint available at: http://localhost:${MCP_PORT}/mcp`);
      
      // Set up file watching for task updates
      try {
        if (fs.existsSync(TASKS_FILE_PATH)) {
          fs.watch(TASKS_FILE_PATH, (eventType, filename) => {
            if (filename && (eventType === "change" || eventType === "rename")) {
              sendSseUpdate();
            }
          });
        }
      } catch (watchError) {
        console.warn("Could not set up file watching:", watchError);
      }

      // Write GUI URL to WebGUI.md
      try {
        const templatesUse = process.env.TEMPLATES_USE || "en";
        const getLanguageFromTemplate = (template: string): string => {
          if (template === "zh") return "zh-TW";
          if (template === "en") return "en";
          return "en";
        };
        const language = getLanguageFromTemplate(templatesUse);
        const websiteUrl = `[Task Manager UI](http://localhost:${MCP_PORT}?lang=${language})`;
        const websiteFilePath = path.join(DATA_DIR, "WebGUI.md");
        fsPromises.writeFile(websiteFilePath, websiteUrl, "utf-8").catch(() => {});
      } catch (error) {
        console.warn("Could not write WebGUI.md:", error);
      }
    });

    // Graceful shutdown
    const shutdownHandler = async () => {
      console.log("🛑 Shutting down Shrimp Task Manager...");
      
      // Close all SSE connections
      sseClients.forEach((client) => client.end());
      sseClients = [];

      // Close all MCP sessions
      for (const [sessionId, transport] of mcpSessions) {
        try {
          transport.close?.();
        } catch (error) {
          console.warn(`Error closing session ${sessionId}:`, error);
        }
      }
      mcpSessions.clear();

      // Close HTTP server
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
      console.log("✅ Server shutdown complete");
      process.exit(0);
    };

    process.on("SIGINT", shutdownHandler);
    process.on("SIGTERM", shutdownHandler);

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
