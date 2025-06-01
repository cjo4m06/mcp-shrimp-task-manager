import { z } from "zod";
import fs from 'fs/promises';
import path from 'path';

// Schema for the get_spec tool
export const getSpecSchema = z.object({
  specId: z.string().describe("The UUID of the specification to retrieve"),
  format: z.enum(["markdown", "json", "summary"]).optional().default("markdown").describe("Output format: markdown (full content), json (structured data), or summary (brief overview)")
});

/**
 * Retrieves and returns a stored specification document
 * 
 * This tool allows users to access complete specification documents that were
 * created using the create_spec tool and stored in the MCP server's data directory.
 * 
 * @param params - Parameters containing the specification ID and format preference
 * @returns The specification content in the requested format
 */
export async function getSpec(params: z.infer<typeof getSpecSchema>) {
  try {
    const { specId, format } = params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(specId)) {
      return {
        content: [
          {
            type: "text" as const,
            text: `# Invalid Specification ID\n\n` +
                  `The provided ID "${specId}" is not a valid UUID format.\n\n` +
                  `**Expected Format**: \`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\`\n\n` +
                  `**Usage Example**:\n` +
                  `\`\`\`\n` +
                  `get_spec({\n` +
                  `  specId: "32b80802-89fb-4b57-bb5b-757561c27a05",\n` +
                  `  format: "markdown"  // optional: "markdown", "json", or "summary"\n` +
                  `})\n` +
                  `\`\`\`\n\n` +
                  `To list available specifications, use \`interact_spec\` with command "list".`
          }
        ]
      };
    }
    
    // Construct the file path
    const dataDir = path.join(process.cwd(), 'data', 'specifications');
    const specPath = path.join(dataDir, `${specId}.md`);
    
    try {
      // Check if the specification file exists
      await fs.access(specPath);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `# Specification Not Found\n\n` +
                  `No specification found with ID: \`${specId}\`\n\n` +
                  `**Possible Causes:**\n` +
                  `- The specification was created in a different session\n` +
                  `- The ID was mistyped or incomplete\n` +
                  `- The specification file was moved or deleted\n\n` +
                  `**Troubleshooting:**\n` +
                  `1. Use \`interact_spec\` with command "list" to see available specifications\n` +
                  `2. Check if you copied the complete UUID from \`create_spec\` output\n` +
                  `3. Verify the specification exists in the MCP server's data directory\n\n` +
                  `**Storage Location**: \`${dataDir}\``
          }
        ]
      };
    }
    
    // Read the specification content
    const specContent = await fs.readFile(specPath, 'utf-8');
    
    if (format === "markdown") {
      // Return the full markdown content
      return {
        content: [
          {
            type: "text" as const,
            text: `# Retrieved Specification: ${specId}\n\n` +
                  `**Source**: MCP Server Data Directory\n` +
                  `**Format**: Complete Markdown Document\n` +
                  `**Size**: ${specContent.length} characters\n\n` +
                  `---\n\n` +
                  `${specContent}`
          }
        ]
      };
    } else if (format === "summary") {
      // Extract and return a summary
      const lines = specContent.split('\n');
      const title = lines.find(line => line.startsWith('# '))?.substring(2) || 'Unknown Title';
      const metadata = extractMetadata(specContent);
      const overview = extractSection(specContent, 'Overview') || 'No overview available';
      
      return {
        content: [
          {
            type: "text" as const,
            text: `# Specification Summary\n\n` +
                  `**Title**: ${title}\n` +
                  `**ID**: ${specId}\n` +
                  `**Status**: ${metadata.status || 'Unknown'}\n` +
                  `**Created**: ${metadata.created || 'Unknown'}\n` +
                  `**Version**: ${metadata.version || 'Unknown'}\n\n` +
                  `## Overview\n\n${overview}\n\n` +
                  `## Sections Available\n\n${extractSectionList(specContent)}\n\n` +
                  `**To view complete specification**: Use \`get_spec\` with format "markdown"\n` +
                  `**To interact with specification**: Use \`interact_spec\` with ID ${specId}`
          }
        ]
      };
    } else if (format === "json") {
      // Parse and return structured data
      const metadata = extractMetadata(specContent);
      const sections = extractAllSections(specContent);
      
      const structuredData = {
        id: specId,
        title: extractTitle(specContent),
        metadata,
        sections,
        storage: {
          location: specPath,
          size: specContent.length,
          retrieved: new Date().toISOString()
        }
      };
      
      return {
        content: [
          {
            type: "text" as const,
            text: `# Specification Data (JSON Format)\n\n` +
                  `\`\`\`json\n${JSON.stringify(structuredData, null, 2)}\n\`\`\`\n\n` +
                  `**Note**: This is the parsed structure of the specification.\n` +
                  `For the complete formatted document, use format "markdown".`
          }
        ]
      };
    } else {
      // Default fallback case
      return {
        content: [
          {
            type: "text" as const,
            text: `# Invalid Format\n\n` +
                  `The format "${format}" is not supported.\n\n` +
                  `**Supported formats**: markdown, json, summary\n\n` +
                  `Please use one of the supported formats.`
          }
        ]
      };
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text" as const,
          text: `# Error Retrieving Specification\n\n` +
                `An error occurred while retrieving the specification:\n\n` +
                `**Error**: ${errorMessage}\n\n` +
                `**Troubleshooting Steps**:\n` +
                `1. Verify the specification ID is correct\n` +
                `2. Check that the MCP server has read access to the data directory\n` +
                `3. Ensure the specification was created successfully\n` +
                `4. Try using \`interact_spec\` as an alternative access method`
        }
      ]
    };
  }
}

/**
 * Helper function to extract metadata from markdown content
 */
function extractMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const metadataSection = extractSection(content, 'Specification Metadata');
  
  if (metadataSection) {
    const lines = metadataSection.split('\n');
    for (const line of lines) {
      const match = line.match(/^- \*\*([^*]+)\*\*:\s*(.+)$/);
      if (match) {
        metadata[match[1].toLowerCase()] = match[2].replace(/`/g, '');
      }
    }
  }
  
  return metadata;
}

/**
 * Helper function to extract a specific section from markdown content
 */
function extractSection(content: string, sectionTitle: string): string | null {
  const sectionRegex = new RegExp(`## ${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = content.match(sectionRegex);
  return match ? match[1].trim() : null;
}

/**
 * Helper function to extract the title from markdown content
 */
function extractTitle(content: string): string {
  const match = content.match(/^# (.+)$/m);
  return match ? match[1] : 'Unknown Title';
}

/**
 * Helper function to extract a list of all sections
 */
function extractSectionList(content: string): string {
  const sections = content.match(/^## (.+)$/gm);
  if (!sections) return 'No sections found';
  
  return sections.map(section => `- ${section.substring(3)}`).join('\n');
}

/**
 * Helper function to extract all sections with their content
 */
function extractAllSections(content: string): Array<{title: string, content: string}> {
  const sections: Array<{title: string, content: string}> = [];
  const sectionMatches = content.match(/^## (.+)$/gm);
  
  if (sectionMatches) {
    for (let i = 0; i < sectionMatches.length; i++) {
      const title = sectionMatches[i].substring(3);
      const nextSection = sectionMatches[i + 1];
      
      let sectionContent: string;
      if (nextSection) {
        const currentIndex = content.indexOf(sectionMatches[i]);
        const nextIndex = content.indexOf(nextSection);
        sectionContent = content.substring(currentIndex + sectionMatches[i].length, nextIndex).trim();
      } else {
        const currentIndex = content.indexOf(sectionMatches[i]);
        sectionContent = content.substring(currentIndex + sectionMatches[i].length).trim();
      }
      
      sections.push({ title, content: sectionContent });
    }
  }
  
  return sections;
} 