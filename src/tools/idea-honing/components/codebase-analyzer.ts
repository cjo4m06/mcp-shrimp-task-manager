/**
 * Codebase Analyzer for the Idea Honing Tool
 *
 * This component analyzes the repository structure and identifies components and dependencies.
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CodebaseAnalysisResult,
  Component,
  FileImpact,
  Dependency,
  RelevantRule
} from '../models/analysis-result.js';
import { getAllProjectRules, determineRelevantRules } from './project-rules-integrator.js';

// Get the base directory for the repository
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../');

// Define file types for analysis
const FILE_TYPES = {
  JAVASCRIPT: ['.js'],
  TYPESCRIPT: ['.ts', '.tsx'],
  REACT: ['.jsx', '.tsx'],
  HTML: ['.html', '.htm'],
  CSS: ['.css', '.scss', '.sass', '.less'],
  JSON: ['.json'],
  MARKDOWN: ['.md'],
  PYTHON: ['.py'],
  JAVA: ['.java'],
  GO: ['.go'],
  RUST: ['.rs'],
  RUBY: ['.rb'],
  PHP: ['.php'],
  C_SHARP: ['.cs'],
  C_CPP: ['.c', '.cpp', '.h', '.hpp'],
  SHELL: ['.sh', '.bash'],
  YAML: ['.yml', '.yaml'],
  TOML: ['.toml'],
  OTHER: []
};

// Define common ignore patterns
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.github',
  '.vscode',
  '.idea',
  'coverage',
  'tmp',
  'temp',
  '__pycache__',
  '*.min.js',
  '*.min.css',
  '*.map'
];

/**
 * Configuration for the codebase analysis
 */
export interface AnalysisConfig {
  /** Root directory to analyze (defaults to repository root) */
  rootDir?: string;

  /** Directories to include in the analysis (defaults to all) */
  includeDirs?: string[];

  /** Directories to exclude from the analysis */
  excludeDirs?: string[];

  /** File types to include in the analysis (defaults to all) */
  includeFileTypes?: string[];

  /** Maximum depth to traverse (defaults to unlimited) */
  maxDepth?: number;

  /** Maximum files to analyze (defaults to unlimited) */
  maxFiles?: number;

  /** Whether to analyze dependencies (defaults to true) */
  analyzeDependencies?: boolean;

  /** Keywords to focus the analysis on */
  focusKeywords?: string[];
}

/**
 * Analyzes the repository structure
 *
 * @param config - Configuration for the analysis
 * @returns Promise that resolves with the analysis result
 */
export async function analyzeRepository(config: AnalysisConfig = {}): Promise<CodebaseAnalysisResult> {
  try {
    // Set default configuration values
    const rootDir = config.rootDir || REPO_ROOT;
    const includeDirs = config.includeDirs || [];
    const excludeDirs = config.excludeDirs || IGNORE_PATTERNS;
    const includeFileTypes = config.includeFileTypes || [];
    const maxDepth = config.maxDepth || Infinity;
    const maxFiles = config.maxFiles || Infinity;
    const analyzeDependencies = config.analyzeDependencies !== false;
    const focusKeywords = config.focusKeywords || [];

    console.time('Repository analysis');

    // Scan the repository structure
    console.time('Directory scan');
    const files = await scanDirectory(rootDir, {
      includeDirs,
      excludeDirs,
      includeFileTypes,
      maxDepth,
      maxFiles
    });
    console.timeEnd('Directory scan');

    // Run component identification and dependency detection in parallel
    const [components, dependencies, impactedFiles] = await Promise.all([
      // Identify components
      (async () => {
        console.time('Component identification');
        const result = identifyComponents(files, rootDir);
        console.timeEnd('Component identification');
        return result;
      })(),

      // Detect dependencies if enabled
      (async () => {
        if (!analyzeDependencies) return [];
        console.time('Dependency detection');
        const result = await detectDependencies(files, rootDir);
        console.timeEnd('Dependency detection');
        return result;
      })(),

      // Identify impacted files based on focus keywords
      (async () => {
        console.time('Impact assessment');
        const result = await identifyImpactedFiles(files, focusKeywords);
        console.timeEnd('Impact assessment');
        return result;
      })()
    ]);

    // Apply smart focusing to components based on impacted files
    console.time('Smart focusing');
    const focusedComponents = applySmartFocusing(components, impactedFiles, dependencies);
    console.timeEnd('Smart focusing');

    // Get project rules
    console.time('Project rules integration');
    let projectRules: RelevantRule[] = [];
    try {
      // Get all project rules
      const allRules = await getAllProjectRules();

      // Create a mock specification for rule matching
      const mockSpecification = {
        id: 'temp',
        title: focusKeywords.join(' '),
        sections: [
          {
            id: 'overview',
            title: 'Overview',
            content: focusKeywords.join(' '),
            order: 0
          }
        ],
        metadata: {
          authors: [],
          status: 'draft',
          tags: focusKeywords,
          relatedSpecs: []
        },
        version: 1,
        changeHistory: [],
        projectId: '',
        featureId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Determine relevant rules
      projectRules = determineRelevantRules(mockSpecification, allRules);
    } catch (error) {
      console.error('Error integrating project rules:', error);
    }
    console.timeEnd('Project rules integration');

    // Generate the analysis result
    const analysisResult: CodebaseAnalysisResult = {
      affectedComponents: focusedComponents,
      impactedFiles,
      dependencies,
      projectRules,
      suggestedQuestions: generateSuggestedQuestions(focusedComponents, impactedFiles, dependencies, projectRules),
      analysisConfidence: calculateConfidence(focusedComponents, impactedFiles, dependencies, focusKeywords, projectRules.length > 0)
    };

    console.timeEnd('Repository analysis');

    return analysisResult;
  } catch (error) {
    throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Applies smart focusing to components based on impacted files
 *
 * @param components - All identified components
 * @param impactedFiles - Impacted files
 * @param dependencies - Dependencies between files
 * @returns Focused components with updated impact levels
 */
function applySmartFocusing(
  components: Component[],
  impactedFiles: FileImpact[],
  dependencies: Dependency[]
): Component[] {
  // Create a map of components by path
  const componentMap = new Map<string, Component>();
  for (const component of components) {
    componentMap.set(component.path, component);
  }

  // Create a set of impacted file paths
  const impactedFilePaths = new Set(impactedFiles.map(file => file.path));

  // Create a map of file paths to their components
  const fileToComponentMap = new Map<string, string>();
  for (const component of components) {
    for (const file of impactedFiles) {
      if (file.path.startsWith(component.path)) {
        fileToComponentMap.set(file.path, component.path);
      }
    }
  }

  // Count impacted files per component
  const componentImpactCounts = new Map<string, number>();
  for (const file of impactedFiles) {
    const componentPath = fileToComponentMap.get(file.path);
    if (componentPath) {
      componentImpactCounts.set(
        componentPath,
        (componentImpactCounts.get(componentPath) || 0) + 1
      );
    }
  }

  // Create a dependency graph
  const dependencyGraph = new Map<string, Set<string>>();
  for (const dep of dependencies) {
    if (!dependencyGraph.has(dep.source)) {
      dependencyGraph.set(dep.source, new Set());
    }
    dependencyGraph.get(dep.source)!.add(dep.target);
  }

  // Identify components that depend on impacted files
  const dependentComponents = new Set<string>();
  for (const [source, targets] of dependencyGraph.entries()) {
    for (const target of targets) {
      if (impactedFilePaths.has(target)) {
        // Find the component that contains this source file
        for (const component of components) {
          if (source.startsWith(component.path)) {
            dependentComponents.add(component.path);
            break;
          }
        }
      }
    }
  }

  // Update impact levels based on the analysis
  const focusedComponents: Component[] = [];

  for (const component of components) {
    // Clone the component
    const focusedComponent = { ...component };

    // Determine impact level
    if (componentImpactCounts.has(component.path)) {
      const impactCount = componentImpactCounts.get(component.path)!;

      if (impactCount > 3) {
        focusedComponent.impactLevel = 'high';
      } else if (impactCount > 1) {
        focusedComponent.impactLevel = 'medium';
      } else {
        focusedComponent.impactLevel = 'low';
      }
    } else if (dependentComponents.has(component.path)) {
      // Components that depend on impacted files
      focusedComponent.impactLevel = 'medium';
    } else {
      // Components not directly impacted
      focusedComponent.impactLevel = 'low';
    }

    focusedComponents.push(focusedComponent);
  }

  // Sort components by impact level
  return focusedComponents.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impactLevel] - impactOrder[b.impactLevel];
  });
}

/**
 * Scans a directory recursively to find files
 *
 * @param dirPath - Path to the directory to scan
 * @param options - Scan options
 * @param currentDepth - Current recursion depth
 * @param fileList - Accumulated list of files
 * @returns Promise that resolves with the list of files
 */
async function scanDirectory(
  dirPath: string,
  options: {
    includeDirs: string[];
    excludeDirs: string[];
    includeFileTypes: string[];
    maxDepth: number;
    maxFiles: number;
  },
  currentDepth: number = 0,
  fileList: string[] = []
): Promise<string[]> {
  // Check if we've reached the maximum depth
  if (currentDepth > options.maxDepth) {
    return fileList;
  }

  // Check if we've reached the maximum number of files
  if (fileList.length >= options.maxFiles) {
    return fileList;
  }

  try {
    // Read the directory contents
    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

    // Process each entry
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);

      // Skip excluded directories
      if (options.excludeDirs.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(entry.name);
        }
        return entry.name === pattern;
      })) {
        continue;
      }

      // Process directories
      if (entry.isDirectory()) {
        // Include only specified directories if provided
        if (options.includeDirs.length > 0 && !options.includeDirs.some(dir => entryPath.includes(dir))) {
          continue;
        }

        // Recursively scan subdirectories
        await scanDirectory(entryPath, options, currentDepth + 1, fileList);
      }
      // Process files
      else if (entry.isFile()) {
        // Include only specified file types if provided
        if (options.includeFileTypes.length > 0) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!options.includeFileTypes.includes(ext)) {
            continue;
          }
        }

        // Add the file to the list
        fileList.push(entryPath);

        // Check if we've reached the maximum number of files
        if (fileList.length >= options.maxFiles) {
          break;
        }
      }
    }

    return fileList;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}: ${error}`);
    return fileList;
  }
}

/**
 * Identifies components in the repository
 *
 * @param files - List of files in the repository
 * @param rootDir - Root directory of the repository
 * @returns Array of identified components
 */
function identifyComponents(files: string[], rootDir: string): Component[] {
  // Group files by directory
  const dirGroups: Record<string, string[]> = {};

  for (const file of files) {
    const dir = path.dirname(file);
    if (!dirGroups[dir]) {
      dirGroups[dir] = [];
    }
    dirGroups[dir].push(file);
  }

  // Identify components based on directory structure
  const components: Component[] = [];

  // Process each directory group
  for (const [dir, dirFiles] of Object.entries(dirGroups)) {
    // Skip directories with too few files
    if (dirFiles.length < 2) {
      continue;
    }

    // Determine component type based on file types
    const fileTypes = dirFiles.map(file => path.extname(file).toLowerCase());
    const hasTypeScript = fileTypes.some(ext => FILE_TYPES.TYPESCRIPT.includes(ext));
    const hasReact = fileTypes.some(ext => FILE_TYPES.REACT.includes(ext));
    const hasPython = fileTypes.some(ext => FILE_TYPES.PYTHON.includes(ext));

    // Generate component description
    let description = 'Component based on directory structure';
    if (hasTypeScript) description += ', using TypeScript';
    if (hasReact) description += ', using React';
    if (hasPython) description += ', using Python';

    // Create the component
    const relativePath = path.relative(rootDir, dir);
    const component: Component = {
      name: path.basename(dir),
      path: relativePath,
      description,
      impactLevel: 'low' // Default impact level
    };

    components.push(component);
  }

  return components;
}

/**
 * Detects dependencies between files
 *
 * @param files - List of files in the repository
 * @param rootDir - Root directory of the repository
 * @returns Promise that resolves with the detected dependencies
 */
async function detectDependencies(files: string[], rootDir: string): Promise<Dependency[]> {
  const dependencies: Dependency[] = [];

  // Create a map of files for faster lookup
  const fileMap = new Set(files);

  // Process each file
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();

    // Skip non-code files
    if (![...FILE_TYPES.JAVASCRIPT, ...FILE_TYPES.TYPESCRIPT, ...FILE_TYPES.PYTHON, ...FILE_TYPES.JAVA,
          ...FILE_TYPES.GO, ...FILE_TYPES.RUST, ...FILE_TYPES.RUBY, ...FILE_TYPES.PHP].includes(ext)) {
      continue;
    }

    try {
      // Read the file content
      const content = await fsPromises.readFile(file, 'utf-8');

      // Detect imports based on file type
      if ([...FILE_TYPES.JAVASCRIPT, ...FILE_TYPES.TYPESCRIPT].includes(ext)) {
        // Detect JavaScript/TypeScript imports
        await detectJsImports(file, content, rootDir, fileMap, dependencies);

        // Detect class inheritance and usage
        detectJsClassRelations(file, content, rootDir, dependencies);

        // Detect function calls
        detectJsFunctionCalls(file, content, rootDir, dependencies);

      } else if (FILE_TYPES.PYTHON.includes(ext)) {
        // Detect Python imports
        detectPythonImports(file, content, rootDir, dependencies);

        // Detect Python class inheritance
        detectPythonClassRelations(file, content, rootDir, dependencies);

      } else if (FILE_TYPES.JAVA.includes(ext)) {
        // Detect Java imports
        detectJavaImports(file, content, rootDir, dependencies);

      } else if (FILE_TYPES.GO.includes(ext)) {
        // Detect Go imports
        detectGoImports(file, content, rootDir, dependencies);

      } else if (FILE_TYPES.RUST.includes(ext)) {
        // Detect Rust imports
        detectRustImports(file, content, rootDir, dependencies);
      }
    } catch (error) {
      console.error(`Error detecting dependencies in ${file}: ${error}`);
    }
  }

  // Detect transitive dependencies
  const transitiveDependencies = detectTransitiveDependencies(dependencies);
  dependencies.push(...transitiveDependencies);

  // Detect circular dependencies
  const circularDependencies = detectCircularDependencies(dependencies);

  // Add circular dependency information
  for (const circular of circularDependencies) {
    dependencies.push({
      source: circular[0],
      target: circular[circular.length - 1],
      type: 'data',
      description: `Circular dependency detected: ${circular.join(' -> ')} -> ${circular[0]}`
    });
  }

  return dependencies;
}

/**
 * Detects JavaScript/TypeScript imports
 */
async function detectJsImports(
  file: string,
  content: string,
  rootDir: string,
  fileMap: Set<string>,
  dependencies: Dependency[]
): Promise<void> {
  // Detect ES6 imports
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^\s,]+|[^\s,]+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];

    // Skip external dependencies
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      continue;
    }

    // Resolve the import path
    let resolvedPath;
    try {
      if (importPath.startsWith('.')) {
        resolvedPath = path.resolve(path.dirname(file), importPath);
      } else {
        resolvedPath = path.resolve(rootDir, importPath.substring(1));
      }

      // Add extensions if needed
      if (!path.extname(resolvedPath)) {
        // Try with different extensions
        for (const ext of [...FILE_TYPES.JAVASCRIPT, ...FILE_TYPES.TYPESCRIPT]) {
          const testPath = `${resolvedPath}${ext}`;
          if (fileMap.has(testPath)) {
            resolvedPath = testPath;
            break;
          }
        }

        // Try with index files
        if (!fileMap.has(resolvedPath)) {
          for (const ext of [...FILE_TYPES.JAVASCRIPT, ...FILE_TYPES.TYPESCRIPT]) {
            const indexPath = path.join(resolvedPath, `index${ext}`);
            if (fileMap.has(indexPath)) {
              resolvedPath = indexPath;
              break;
            }
          }
        }
      }

      // Skip if the resolved path is not in the file map
      if (!fileMap.has(resolvedPath)) {
        continue;
      }

      // Create the dependency
      const dependency: Dependency = {
        source: path.relative(rootDir, file),
        target: path.relative(rootDir, resolvedPath),
        type: 'imports',
        description: `${path.basename(file)} imports from ${path.basename(resolvedPath)}`
      };

      dependencies.push(dependency);
    } catch (error) {
      console.error(`Error resolving import path ${importPath} in ${file}: ${error}`);
    }
  }

  // Detect CommonJS requires
  const requireRegex = /(?:const|let|var)\s+(?:{[^}]*}|[^\s,]+)\s+=\s+require\(['"]([^'"]+)['"]\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = match[1];

    // Skip external dependencies
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      continue;
    }

    // Resolve the import path (similar to above)
    let resolvedPath;
    try {
      if (importPath.startsWith('.')) {
        resolvedPath = path.resolve(path.dirname(file), importPath);
      } else {
        resolvedPath = path.resolve(rootDir, importPath.substring(1));
      }

      // Add extensions if needed (similar to above)
      if (!path.extname(resolvedPath)) {
        for (const ext of [...FILE_TYPES.JAVASCRIPT, ...FILE_TYPES.TYPESCRIPT]) {
          const testPath = `${resolvedPath}${ext}`;
          if (fileMap.has(testPath)) {
            resolvedPath = testPath;
            break;
          }
        }
      }

      // Skip if the resolved path is not in the file map
      if (!fileMap.has(resolvedPath)) {
        continue;
      }

      // Create the dependency
      const dependency: Dependency = {
        source: path.relative(rootDir, file),
        target: path.relative(rootDir, resolvedPath),
        type: 'imports',
        description: `${path.basename(file)} requires ${path.basename(resolvedPath)}`
      };

      dependencies.push(dependency);
    } catch (error) {
      console.error(`Error resolving require path ${importPath} in ${file}: ${error}`);
    }
  }
}

/**
 * Detects JavaScript/TypeScript class inheritance and usage
 */
function detectJsClassRelations(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect class inheritance
  const extendsRegex = /class\s+([^\s]+)\s+extends\s+([^\s{]+)/g;
  let match;

  while ((match = extendsRegex.exec(content)) !== null) {
    const childClass = match[1];
    const parentClass = match[2];

    // Create the dependency
    const dependency: Dependency = {
      source: path.relative(rootDir, file),
      target: parentClass, // We don't know the file, just the class name
      type: 'extends',
      description: `${childClass} extends ${parentClass}`
    };

    dependencies.push(dependency);
  }

  // Detect class instantiation
  const newRegex = /new\s+([A-Z][a-zA-Z0-9_]*)\(/g;
  while ((match = newRegex.exec(content)) !== null) {
    const className = match[1];

    // Create the dependency
    const dependency: Dependency = {
      source: path.relative(rootDir, file),
      target: className, // We don't know the file, just the class name
      type: 'uses',
      description: `${path.basename(file)} instantiates ${className}`
    };

    dependencies.push(dependency);
  }
}

/**
 * Detects JavaScript/TypeScript function calls
 */
function detectJsFunctionCalls(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect function calls
  const functionCallRegex = /\b([a-zA-Z][a-zA-Z0-9_]*)\s*\(/g;
  let match;

  while ((match = functionCallRegex.exec(content)) !== null) {
    const functionName = match[1];

    // Skip common functions and keywords
    if (['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'console', 'require', 'import'].includes(functionName)) {
      continue;
    }

    // Create the dependency
    const dependency: Dependency = {
      source: path.relative(rootDir, file),
      target: functionName, // We don't know the file, just the function name
      type: 'uses',
      description: `${path.basename(file)} calls function ${functionName}`
    };

    dependencies.push(dependency);
  }
}

/**
 * Detects Python imports
 */
function detectPythonImports(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect Python imports
  const importRegex = /(?:from\s+([^\s]+)\s+import|import\s+([^\s,]+))/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1] || match[2];

    // Skip standard library imports
    if (!importPath.includes('.')) {
      continue;
    }

    // Create the dependency
    const dependency: Dependency = {
      source: path.relative(rootDir, file),
      target: importPath.replace(/\./g, '/'),
      type: 'imports',
      description: `${path.basename(file)} imports ${importPath}`
    };

    dependencies.push(dependency);
  }
}

/**
 * Detects Python class inheritance
 */
function detectPythonClassRelations(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect class inheritance
  const classRegex = /class\s+([^\s(]+)\s*\(([^)]+)\):/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const childClass = match[1];
    const parentClasses = match[2].split(',').map(c => c.trim());

    for (const parentClass of parentClasses) {
      // Skip object (base class)
      if (parentClass === 'object') {
        continue;
      }

      // Create the dependency
      const dependency: Dependency = {
        source: path.relative(rootDir, file),
        target: parentClass, // We don't know the file, just the class name
        type: 'extends',
        description: `${childClass} inherits from ${parentClass}`
      };

      dependencies.push(dependency);
    }
  }
}

/**
 * Detects Java imports
 */
function detectJavaImports(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect Java imports
  const importRegex = /import\s+([^;]+);/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1].trim();

    // Create the dependency
    const dependency: Dependency = {
      source: path.relative(rootDir, file),
      target: importPath.replace(/\./g, '/'),
      type: 'imports',
      description: `${path.basename(file)} imports ${importPath}`
    };

    dependencies.push(dependency);
  }
}

/**
 * Detects Go imports
 */
function detectGoImports(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect Go imports
  const importRegex = /import\s+\(\s*((?:"[^"]+"\s*)+)\s*\)/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importBlock = match[1];
    const importPaths = importBlock.match(/"([^"]+)"/g);

    if (importPaths) {
      for (const importPath of importPaths) {
        const cleanPath = importPath.replace(/"/g, '');

        // Create the dependency
        const dependency: Dependency = {
          source: path.relative(rootDir, file),
          target: cleanPath,
          type: 'imports',
          description: `${path.basename(file)} imports ${cleanPath}`
        };

        dependencies.push(dependency);
      }
    }
  }
}

/**
 * Detects Rust imports
 */
function detectRustImports(
  file: string,
  content: string,
  rootDir: string,
  dependencies: Dependency[]
): void {
  // Detect Rust imports
  const useRegex = /use\s+([^;]+);/g;
  let match;

  while ((match = useRegex.exec(content)) !== null) {
    const importPath = match[1].trim();

    // Create the dependency
    const dependency: Dependency = {
      source: path.relative(rootDir, file),
      target: importPath.replace(/::/g, '/'),
      type: 'imports',
      description: `${path.basename(file)} uses ${importPath}`
    };

    dependencies.push(dependency);
  }
}

/**
 * Detects transitive dependencies
 *
 * @param dependencies - Direct dependencies
 * @returns Array of transitive dependencies
 */
function detectTransitiveDependencies(dependencies: Dependency[]): Dependency[] {
  const transitiveDependencies: Dependency[] = [];

  // Build a dependency graph
  const graph: Record<string, Set<string>> = {};

  for (const dep of dependencies) {
    if (!graph[dep.source]) {
      graph[dep.source] = new Set();
    }
    graph[dep.source].add(dep.target);
  }

  // Find transitive dependencies using depth-first search
  for (const source in graph) {
    const visited = new Set<string>();
    const stack: string[] = [];

    // Add direct dependencies to the stack
    for (const target of graph[source]) {
      stack.push(target);
    }

    while (stack.length > 0) {
      const current = stack.pop()!;

      // Skip if already visited
      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      // Skip if not in the graph
      if (!graph[current]) {
        continue;
      }

      // Add transitive dependencies to the stack
      for (const target of graph[current]) {
        // Skip direct dependencies
        if (graph[source] && graph[source].has(target)) {
          continue;
        }

        // Skip if already visited
        if (visited.has(target)) {
          continue;
        }

        stack.push(target);

        // Add transitive dependency
        transitiveDependencies.push({
          source,
          target,
          type: 'data',
          description: `${source} indirectly depends on ${target} through ${current}`
        });
      }
    }
  }

  return transitiveDependencies;
}

/**
 * Detects circular dependencies
 *
 * @param dependencies - All dependencies
 * @returns Array of circular dependency chains
 */
function detectCircularDependencies(dependencies: Dependency[]): string[][] {
  const circularDependencies: string[][] = [];

  // Build a dependency graph
  const graph: Record<string, string[]> = {};

  for (const dep of dependencies) {
    if (!graph[dep.source]) {
      graph[dep.source] = [];
    }
    if (!graph[dep.target]) {
      graph[dep.target] = [];
    }

    // Add the dependency if it doesn't already exist
    if (!graph[dep.source].includes(dep.target)) {
      graph[dep.source].push(dep.target);
    }
  }

  // Find circular dependencies using depth-first search
  for (const source in graph) {
    const visited = new Set<string>();
    const path: string[] = [];

    function dfs(node: string): void {
      // Skip if already in the current path (circular dependency)
      if (path.includes(node)) {
        const cycle = path.slice(path.indexOf(node));
        cycle.push(node); // Complete the cycle

        // Check if this cycle is already in the results
        const cycleStr = cycle.join(',');
        if (!circularDependencies.some(c => c.join(',') === cycleStr)) {
          circularDependencies.push(cycle);
        }
        return;
      }

      // Skip if already visited
      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      path.push(node);

      // Visit neighbors
      for (const neighbor of graph[node] || []) {
        dfs(neighbor);
      }

      path.pop();
    }

    dfs(source);
  }

  return circularDependencies;
}

/**
 * Identifies files that may be impacted by the proposed changes
 *
 * @param files - List of files in the repository
 * @param keywords - Keywords to focus the analysis on
 * @returns Array of impacted files
 */
async function identifyImpactedFiles(files: string[], keywords: string[]): Promise<FileImpact[]> {
  // If no keywords are provided, return an empty array
  if (!keywords || keywords.length === 0) {
    return [];
  }

  const impactedFiles: FileImpact[] = [];
  const fileContentCache: Record<string, string> = {};

  // Process each file
  for (const file of files) {
    let impactScore = 0;
    const reasons: string[] = [];

    // Check if the file path contains any of the keywords
    const pathMatchedKeywords = keywords.filter(keyword =>
      file.toLowerCase().includes(keyword.toLowerCase())
    );

    if (pathMatchedKeywords.length > 0) {
      impactScore += pathMatchedKeywords.length * 2; // Higher weight for path matches
      reasons.push(`File path contains keywords: ${pathMatchedKeywords.join(', ')}`);
    }

    // Check file extension to determine if it's a code file
    const ext = path.extname(file).toLowerCase();
    const isCodeFile = [
      ...FILE_TYPES.JAVASCRIPT, ...FILE_TYPES.TYPESCRIPT, ...FILE_TYPES.PYTHON,
      ...FILE_TYPES.JAVA, ...FILE_TYPES.GO, ...FILE_TYPES.RUST, ...FILE_TYPES.RUBY,
      ...FILE_TYPES.PHP, ...FILE_TYPES.C_SHARP, ...FILE_TYPES.C_CPP
    ].includes(ext);

    // Check file content for keywords if it's a code file
    if (isCodeFile) {
      try {
        // Read the file content (or use cached content)
        if (!fileContentCache[file]) {
          fileContentCache[file] = await fsPromises.readFile(file, 'utf-8');
        }
        const content = fileContentCache[file];

        // Check for keyword matches in content
        const contentMatchedKeywords = keywords.filter(keyword =>
          content.toLowerCase().includes(keyword.toLowerCase())
        );

        if (contentMatchedKeywords.length > 0) {
          impactScore += contentMatchedKeywords.length;
          reasons.push(`File content contains keywords: ${contentMatchedKeywords.join(', ')}`);

          // Check for keyword matches in function/class names (higher relevance)
          const functionMatches = detectFunctionMatches(content, contentMatchedKeywords);
          if (functionMatches.length > 0) {
            impactScore += functionMatches.length * 3; // Higher weight for function matches
            reasons.push(`File contains relevant functions/classes: ${functionMatches.join(', ')}`);
          }
        }
      } catch (error) {
        console.error(`Error reading file ${file}: ${error}`);
      }
    }

    // Add the file to the impacted files list if it has a non-zero impact score
    if (impactScore > 0) {
      // Determine impact level
      let impactLevel = 'low';
      if (impactScore > 5) {
        impactLevel = 'high';
      } else if (impactScore > 2) {
        impactLevel = 'medium';
      }

      // Create the file impact
      const fileImpact: FileImpact = {
        path: file,
        reason: reasons.join('; '),
        suggestedChanges: impactScore > 3 ? 'May need significant modifications' : 'May need minor modifications'
      };

      impactedFiles.push(fileImpact);
    }
  }

  // Sort impacted files by relevance (impact score)
  return impactedFiles.sort((a, b) => {
    // Calculate impact scores based on reasons
    const scoreA = calculateImpactScore(a.reason);
    const scoreB = calculateImpactScore(b.reason);
    return scoreB - scoreA;
  });
}

/**
 * Calculates an impact score based on the reason string
 *
 * @param reason - Reason string
 * @returns Impact score
 */
function calculateImpactScore(reason: string): number {
  let score = 0;

  // Path matches are more significant
  if (reason.includes('File path contains keywords')) {
    score += 5;
  }

  // Function/class matches are very significant
  if (reason.includes('File contains relevant functions/classes')) {
    score += 10;
  }

  // Content matches are somewhat significant
  if (reason.includes('File content contains keywords')) {
    score += 3;
  }

  // Count the number of keywords matched
  const keywordMatches = (reason.match(/keywords:/g) || []).length;
  score += keywordMatches * 2;

  return score;
}

/**
 * Detects function or class names that match keywords
 *
 * @param content - File content
 * @param keywords - Keywords to match
 * @returns Array of matched function or class names
 */
function detectFunctionMatches(content: string, keywords: string[]): string[] {
  const matches: string[] = [];

  // Match function declarations
  const functionRegex = /function\s+([a-zA-Z0-9_]+)/g;
  let match;

  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1];

    // Check if the function name contains any of the keywords
    if (keywords.some(keyword =>
      functionName.toLowerCase().includes(keyword.toLowerCase())
    )) {
      matches.push(functionName);
    }
  }

  // Match class declarations
  const classRegex = /class\s+([a-zA-Z0-9_]+)/g;
  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];

    // Check if the class name contains any of the keywords
    if (keywords.some(keyword =>
      className.toLowerCase().includes(keyword.toLowerCase())
    )) {
      matches.push(className);
    }
  }

  // Match method declarations
  const methodRegex = /(?:public|private|protected)?\s+(?:static\s+)?(?:async\s+)?(?:function\s+)?([a-zA-Z0-9_]+)\s*\(/g;
  while ((match = methodRegex.exec(content)) !== null) {
    const methodName = match[1];

    // Skip constructor
    if (methodName === 'constructor') {
      continue;
    }

    // Check if the method name contains any of the keywords
    if (keywords.some(keyword =>
      methodName.toLowerCase().includes(keyword.toLowerCase())
    )) {
      matches.push(methodName);
    }
  }

  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Generates suggested questions based on the analysis results
 *
 * @param components - Identified components
 * @param impactedFiles - Impacted files
 * @param dependencies - Detected dependencies
 * @param projectRules - Relevant project rules
 * @returns Array of suggested questions
 */
function generateSuggestedQuestions(
  components: Component[],
  impactedFiles: FileImpact[],
  dependencies: Dependency[],
  projectRules: RelevantRule[] = []
): string[] {
  const questions: string[] = [];

  // Questions about components
  if (components.length > 0) {
    const highImpactComponents = components.filter(c => c.impactLevel === 'high');
    if (highImpactComponents.length > 0) {
      questions.push(`The analysis identified ${highImpactComponents.length} high-impact components. How will you ensure these components are properly updated?`);
    } else {
      questions.push(`Which of the ${components.length} identified components will be most affected by this change?`);
    }
    questions.push('Are there any components missing from the analysis that should be considered?');
  } else {
    questions.push('What components will be created or modified for this feature?');
  }

  // Questions about impacted files
  if (impactedFiles.length > 0) {
    questions.push(`The analysis identified ${impactedFiles.length} potentially impacted files. Are there any critical files missing from this list?`);

    // Check for files with suggested changes
    const filesWithSuggestedChanges = impactedFiles.filter(f => f.suggestedChanges);
    if (filesWithSuggestedChanges.length > 0) {
      questions.push(`${filesWithSuggestedChanges.length} files may need significant modifications. What specific changes will be made to these files?`);
    }
  } else {
    questions.push('What existing files will need to be modified for this feature?');
  }

  // Questions about dependencies
  if (dependencies.length > 0) {
    // Check for circular dependencies
    const circularDeps = dependencies.filter(d => d.description.includes('Circular dependency'));
    if (circularDeps.length > 0) {
      questions.push(`The analysis detected ${circularDeps.length} circular dependencies. How will these be addressed?`);
    } else {
      questions.push('Are there any additional dependencies that need to be considered?');
    }
  } else {
    questions.push('What dependencies will this feature have on existing code?');
  }

  // Questions about project rules
  if (projectRules.length > 0) {
    questions.push(`The analysis identified ${projectRules.length} relevant project rules. How will you ensure compliance with these rules?`);

    // Group rules by section
    const rulesBySection: Record<string, number> = {};
    for (const rule of projectRules) {
      rulesBySection[rule.sectionId] = (rulesBySection[rule.sectionId] || 0) + 1;
    }

    // Ask about sections with multiple rules
    for (const [sectionId, count] of Object.entries(rulesBySection)) {
      if (count > 1) {
        questions.push(`The "${sectionId}" section has ${count} applicable rules. What specific considerations are needed for this section?`);
      }
    }
  } else {
    questions.push('Are there any project rules or guidelines that should be considered for this implementation?');
  }

  // General questions
  questions.push('What are the potential risks or challenges in implementing this feature?');
  questions.push('Are there any performance considerations for this implementation?');
  questions.push('What testing approach would be most appropriate for this feature?');

  return questions;
}

/**
 * Calculates the confidence score for the analysis
 *
 * @param components - Identified components
 * @param impactedFiles - Impacted files
 * @param dependencies - Detected dependencies
 * @param focusKeywords - Keywords used to focus the analysis
 * @param hasProjectRules - Whether project rules were successfully integrated
 * @returns Confidence score (0-1)
 */
function calculateConfidence(
  components: Component[],
  impactedFiles: FileImpact[],
  dependencies: Dependency[],
  focusKeywords: string[],
  hasProjectRules: boolean = false
): number {
  // Base confidence
  let confidence = 0.5;

  // Adjust based on components
  if (components.length > 0) {
    confidence += 0.1;

    // Bonus for high-impact components
    const highImpactComponents = components.filter(c => c.impactLevel === 'high');
    if (highImpactComponents.length > 0) {
      confidence += 0.05;
    }
  }

  // Adjust based on impacted files
  if (impactedFiles.length > 0) {
    confidence += 0.1;

    // Bonus for files with suggested changes
    const filesWithSuggestedChanges = impactedFiles.filter(f => f.suggestedChanges);
    if (filesWithSuggestedChanges.length > 0) {
      confidence += 0.05;
    }
  }

  // Adjust based on dependencies
  if (dependencies.length > 0) {
    confidence += 0.1;

    // Bonus for transitive and circular dependency detection
    const transitiveDeps = dependencies.filter(d => d.description.includes('indirectly depends'));
    const circularDeps = dependencies.filter(d => d.description.includes('Circular dependency'));

    if (transitiveDeps.length > 0 || circularDeps.length > 0) {
      confidence += 0.05;
    }
  }

  // Adjust based on focus keywords
  if (focusKeywords.length > 0) {
    confidence += 0.1;
  } else {
    confidence -= 0.2; // Significant penalty for no focus keywords
  }

  // Adjust based on project rules integration
  if (hasProjectRules) {
    confidence += 0.1;
  }

  // Ensure the confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}
