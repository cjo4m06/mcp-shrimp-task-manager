# Available Tools

## default_api.codebase_search

Find snippets of code from the codebase most relevant to the search query.
This is a semantic search tool, so the query should ask for something semantically matching what is needed.
If it makes sense to only search in particular directories, please specify them in the target_directories field.
Unless there is a clear reason to use your own search query, please just reuse the user's exact query with their wording.
Their exact wording/phrasing can often be helpful for the semantic search query. Keeping the same exact question format can also be helpful.

### Arguments:

- `query`: (string, required) The search query to find relevant code. You should reuse the user's exact query/most recent message with their wording unless there is a clear reason not to.
- `explanation`: (string | null, optional) One sentence explanation as to why this tool is being used, and how it contributes to the goal.
- `target_directories`: (list[string] | null, optional) Glob patterns for directories to search over

## default_api.read_file

Read the contents of a file. the output of this tool call will be the 1-indexed file contents from start_line_one_indexed to end_line_one_indexed_inclusive, together with a summary of the lines outside start_line_one_indexed and end_line_one_indexed_inclusive.
Note that this call can view at most 250 lines at a time and 200 lines minimum.

When using this tool to gather information, it's your responsibility to ensure you have the COMPLETE context. Specifically, each time you call this command you should:

1. Assess if the contents you viewed are sufficient to proceed with your task.
2. Take note of where there are lines not shown.
3. If the file contents you have viewed are insufficient, and you suspect they may be in lines not shown, proactively call the tool again to view those lines.
4. When in doubt, call this tool again to gather more information. Remember that partial file views may miss critical dependencies, imports, or functionality.

In some cases, if reading a range of lines is not enough, you may choose to read the entire file.
Reading entire files is often wasteful and slow, especially for large files (i.e. more than a few hundred lines). So you should use this option sparingly.
Reading the entire file is not allowed in most cases. You are only allowed to read the entire file if it has been edited or manually attached to the conversation by the user.

### Arguments:

- `end_line_one_indexed_inclusive`: (integer, required) The one-indexed line number to end reading at (inclusive).
- `should_read_entire_file`: (boolean, required) Whether to read the entire file. Defaults to false.
- `start_line_one_indexed`: (integer, required) The one-indexed line number to start reading from (inclusive).
- `target_file`: (string, required) The path of the file to read. You can use either a relative path in the workspace or an absolute path. If an absolute path is provided, it will be preserved as is.
- `explanation`: (string | null, optional) One sentence explanation as to why this tool is being used, and how it contributes to the goal.

## default_api.run_terminal_cmd

PROPOSE a command to run on behalf of the user.
If you have this tool, note that you DO have the ability to run commands directly on the USER's system.
Note that the user will have to approve the command before it is executed.
The user may reject it if it is not to their liking, or may modify the command before approving it. If they do change it, take those changes into account.
The actual command will NOT execute until the user approves it. The user may not approve it immediately. Do NOT assume the command has started running.
If the step is WAITING for user approval, it has NOT started running.
In using these tools, adhere to the following guidelines:

1. Based on the contents of the conversation, you will be told if you are in the same shell as a previous step or a different shell.
2. If in a new shell, you should `cd` to the appropriate directory and do necessary setup in addition to running the command.
3. If in the same shell, LOOK IN CHAT HISTORY for your current working directory.
4. For ANY commands that would use a pager or require user interaction, you should append ` | cat` to the command (or whatever is appropriate). Otherwise, the command will break. You MUST do this for: git, less, head, tail, more, etc.
5. For commands that are long running/expected to run indefinitely until interruption, please run them in the background. To run jobs in the background, set `is_background` to true rather than changing the details of the command.
6. Dont include any newlines in the command.

### Arguments:

- `command`: (string, required) The terminal command to execute
- `is_background`: (boolean, required) Whether the command should be run in the background
- `explanation`: (string | null, optional) One sentence explanation as to why this command needs to be run and how it contributes to the goal.

## default_api.list_dir

List the contents of a directory. The quick tool to use for discovery, before using more targeted tools like semantic search or file reading. Useful to try to understand the file structure before diving deeper into specific files. Can be used to explore the codebase.

### Arguments:

- `relative_workspace_path`: (string, required) Path to list contents of, relative to the workspace root.
- `explanation`: (string | null, optional) One sentence explanation as to why this tool is being used, and how it contributes to the goal.

## default_api.grep_search

Fast text-based regex search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching.
Results will be formatted in the style of ripgrep and can be configured to include line numbers and content.
To avoid overwhelming output, the results are capped at 50 matches.
Use the include or exclude patterns to filter the search scope by file type or specific paths.

This is best for finding exact text matches or regex patterns.
More precise than semantic search for finding specific strings or patterns.
This is preferred over semantic search when we know the exact symbol/function name/etc. to search in some set of directories/file types.

The query MUST be a valid regex, so remember to escape special characters.
ALWAYS escape with backslashes if your query contains any of ()[]{}+\*?^$|\\.
eg:

- To search for "function(" use "function\\("
- To search for "value[index]" use "value\\[index\\]"
- To search for "a+b" use "a\\+b"
- To search for "file.txt" use "file\\.txt"

### Arguments:

- `query`: (string, required) The regex pattern to search for
- `case_sensitive`: (boolean | null, optional) Whether the search should be case sensitive
- `exclude_pattern`: (string | null, optional) Glob pattern for files to exclude
- `explanation`: (string | null, optional) One sentence explanation as to why this tool is being used, and how it contributes to the goal.
- `include_pattern`: (string | null, optional) Glob pattern for files to include (e.g. '\*.ts' for TypeScript files)

## default_api.edit_file

Use this tool to propose an edit to an existing file or create a new file.

This will be read by a less intelligent model, which will quickly apply the edit. You should make it clear what the edit is, while also minimizing the unchanged code you write.
When writing the edit, you should specify each edit in sequence, with the special comment `// ... existing code ...` to represent unchanged code in between edited lines.

For example:

```
// ... existing code ...
FIRST_EDIT
// ... existing code ...
SECOND_EDIT
// ... existing code ...
THIRD_EDIT
// ... existing code ...
```

You should still bias towards repeating as few lines of the original file as possible to convey the change.
But, each edit should contain sufficient context of unchanged lines around the code you're editing to resolve ambiguity.
DO NOT omit spans of pre-existing code (or comments) without using the `// ... existing code ...` comment to indicate its absence. If you omit the existing code comment, the model may inadvertently delete these lines.
Make sure it is clear what the edit should be, and where it should be applied.
To create a new file, simply specify the content of the file in the `code_edit` field.

You should specify the following arguments before the others: [target_file]

### Arguments:

- `code_edit`: (string, required) Specify ONLY the precise lines of code that you wish to edit. **NEVER specify or write out unchanged code**. Instead, represent all unchanged code using the comment of the language you're editing in - example: `// ... existing code ...`
- `instructions`: (string, required) A single sentence instruction describing what you are going to do for the sketched edit. This is used to assist the less intelligent model in applying the edit. Please use the first person to describe what you are going to do. Dont repeat what you have said previously in normal messages. And use it to disambiguate uncertainty in the edit.
- `target_file`: (string, required) The target file to modify. Always specify the target file as the first argument. You can use either a relative path in the workspace or an absolute path. If an absolute path is provided, it will be preserved as is.

## default_api.file_search

Fast file search based on fuzzy matching against file path. Use if you know part of the file path but don't know where it's located exactly. Response will be capped to 10 results. Make your query more specific if need to filter results further.

### Arguments:

- `explanation`: (string, required) One sentence explanation as to why this tool is being used, and how it contributes to the goal.
- `query`: (string, required) Fuzzy filename to search for

## default_api.delete_file

Deletes a file at the specified path. The operation will fail gracefully if: - The file doesn't exist - The operation is rejected for security reasons - The file cannot be deleted

### Arguments:

- `target_file`: (string, required) The path of the file to delete, relative to the workspace root.
- `explanation`: (string | null, optional) One sentence explanation as to why this tool is being used, and how it contributes to the goal.

## default_api.reapply

Calls a smarter model to apply the last edit to the specified file.
Use this tool immediately after the result of an edit_file tool call ONLY IF the diff is not what you expected, indicating the model applying the changes was not smart enough to follow your instructions.

### Arguments:

- `target_file`: (string, required) The relative path to the file to reapply the last edit to. You can use either a relative path in the workspace or an absolute path. If an absolute path is provided, it will be preserved as is.

## default_api.web_search

Search the web for real-time information about any topic. Use this tool when you need up-to-date information that might not be available in your training data, or when you need to verify current facts. The search results will include relevant snippets and URLs from web pages. This is particularly useful for questions about current events, technology updates, or any topic that requires recent information.

### Arguments:

- `search_term`: (string, required) The search term to look up on the web. Be specific and include relevant keywords for better results. For technical queries, include version numbers or dates if relevant.
- `explanation`: (string | null, optional) One sentence explanation as to why this tool is being used, and how it contributes to the goal.
