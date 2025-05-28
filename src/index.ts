import "dotenv/config";
import { loadPromptFromTemplate } from "./prompts/loader.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequest, CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
// import express, { Request, Response } from "express";
// import getPort from "get-port";
// import path from "path";
// import fs from "fs";
// import fsPromises from "fs/promises";
// import { fileURLToPath } from "url";

// Import all tool functions and schemas
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
} from "./tools/index.js";

async function main() {
  try {
    console.log("Starting Shrimp Task Manager service...");
    const ENABLE_GUI = process.env.ENABLE_GUI === "true";

    if (ENABLE_GUI) {
      // Create Express application
      const app = express();

      // Store list of SSE clients
      let sseClients: Response[] = [];

      // Helper function to send SSE events
      function sendSseUpdate() {
        sseClients.forEach((client) => {
          // Check if client is still connected
          if (!client.writableEnded) {
            client.write(
              `event: update\ndata: ${JSON.stringify({
                timestamp: Date.now(),
              })}\n\n`
            );
          }
        });
        // Clean up disconnected clients (optional but recommended)
        sseClients = sseClients.filter((client) => !client.writableEnded);
      }

      // Set static file directory
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const publicPath = path.join(__dirname, "public");
      const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
      const TASKS_FILE_PATH = path.join(DATA_DIR, "tasks.json"); // Extract file path

      app.use(express.static(publicPath));

      // Set API routes
      app.get("/api/tasks", async (req: Request, res: Response) => {
        try {
          // Use fsPromises for asynchronous reading
          const tasksData = await fsPromises.readFile(TASKS_FILE_PATH, "utf-8");
          res.json(JSON.parse(tasksData));
        } catch (error) {
          // Ensure an empty task list is returned if the file does not exist
          if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            res.json({ tasks: [] });
          } else {
            res.status(500).json({ error: "Failed to read tasks data" });
          }
        }
      });

      // New: SSE endpoint
      app.get("/api/tasks/stream", (req: Request, res: Response) => {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          // Optional: CORS headers if frontend and backend are not on the same origin
          // "Access-Control-Allow-Origin": "*",
        });

        // Send an initial event or keep the connection
        res.write("data: connected\n\n");

        // Add client to the list
        sseClients.push(res);

        // Remove client from the list when it disconnects
        req.on("close", () => {
          sseClients = sseClients.filter((client) => client !== res);
        });
      });

      // Get available port
      const port = await getPort();

      // Start HTTP server
      const httpServer = app.listen(port, () => {
        // Check if the file exists, do not watch if it doesn't (avoid watch errors)
        try {
          if (fs.existsSync(TASKS_FILE_PATH)) {
            fs.watch(TASKS_FILE_PATH, (eventType, filename) => {
              if (
                filename &&
                (eventType === "change" || eventType === "rename")
              ) {
                // Slightly delay sending to prevent multiple triggers in a short time (e.g., editor save)
                // debounce sendSseUpdate if needed
                sendSseUpdate();
              }
            });
          }
        } catch (watchError) {}
      });

      // Write URL to ebGUI.md
      try {
        const websiteUrl = `[Task Manager UI](http://localhost:${port})`;
        const websiteFilePath = path.join(DATA_DIR, "WebGUI.md");
        await fsPromises.writeFile(websiteFilePath, websiteUrl, "utf-8");
      } catch (error) {}

      // Set process termination event handling (ensure watcher removal)
      const shutdownHandler = async () => {
        // Close all SSE connections
        sseClients.forEach((client) => client.end());
        sseClients = [];

        // Close HTTP server
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
        process.exit(0);
      };

      process.on("SIGINT", shutdownHandler);
      process.on("SIGTERM", shutdownHandler);
    }

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
            description: loadPromptFromTemplate("toolsDescription/processThought.md"),
            inputSchema: zodToJsonSchema(processThoughtSchema),
          },
          {
            name: "init_project_rules",
            description: loadPromptFromTemplate("toolsDescription/initProjectRules.md"),
            inputSchema: zodToJsonSchema(initProjectRulesSchema),
          },
        ],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
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
    });

    // Establish connection
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log("Shrimp Task Manager service started");
  } catch (error) {
    process.exit(1);
  }
}

main().catch(console.error);
