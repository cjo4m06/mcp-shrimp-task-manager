/**
 * Idea Honing Tool for MCP Shrimp Task Manager
 *
 * This tool transforms raw ideas into structured specifications (dev_spec.md) by performing
 * deep codebase analysis, integrating with project rules, and providing a foundation for task planning.
 * It specifically addresses workflow continuity when developers start and stop working on a project.
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define the schema for the create_spec command
export const createSpecSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters long",
    })
    .describe("Title of the specification"),
  description: z
    .string()
    .min(20, {
      message: "Description must be at least 20 characters long",
    })
    .describe("Detailed description of the feature or idea"),
  scope: z
    .string()
    .optional()
    .describe("Optional scope to limit codebase analysis (e.g., directory path)"),
  template: z
    .string()
    .optional()
    .describe("Optional template name to use (defaults to 'default-template')"),
});

// Define the schema for the interact_spec command
export const interactSpecSchema = z.object({
  specId: z
    .string()
    .optional()
    .describe("Specification identifier (optional)"),
  command: z
    .string()
    .describe("Command to execute"),
});

// Define the schema for the get_spec command
export const getSpecSchema = z.object({
  specId: z.string().describe("The UUID of the specification to retrieve"),
  format: z.enum(["markdown", "json", "summary"]).optional().default("markdown").describe("Output format: markdown (full content), json (structured data), or summary (brief overview)")
});

// Export the command functions
export { createSpec } from "./create-spec.js";
export { interactSpec } from "./interact-spec.js";
export { getSpec } from "./get-spec.js";

// Export the schema for use in the main MCP server configuration
export const ideaHoningTools = [
  {
    name: "create_spec",
    description: "Create a structured specification document from a raw idea, with deep codebase analysis and project rule integration.",
    inputSchema: zodToJsonSchema(createSpecSchema),
  },
  {
    name: "interact_spec",
    description: "Interact with a specification through commands for viewing, editing, and managing workflow.",
    inputSchema: zodToJsonSchema(interactSpecSchema),
  },
  {
    name: "get_spec",
    description: "Retrieve and read a stored specification document from the MCP server's data directory using its UUID.",
    inputSchema: zodToJsonSchema(getSpecSchema),
  },
];
