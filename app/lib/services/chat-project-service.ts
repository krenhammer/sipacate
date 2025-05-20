import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { logger as defaultLogger } from '@/app/utils/logger'; // Assuming logger path

const logger = defaultLogger.child({ service: 'ChatProjectService' });

interface ProjectConfig {
  system_prompt: string;
  context_file_names: string[];
}

const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  system_prompt: 'You are a helpful AI assistant. Please answer the user\'s questions.',
  context_file_names: [],
};

export class ChatProjectService {
  private projectConfigPath: string;
  private contextFilesDir: string;
  private loadedConfig: ProjectConfig | null = null;

  constructor(basePath: string = path.join(process.cwd(), 'app', '.state', 'chat_project')) {
    this.projectConfigPath = path.join(basePath, 'project.yaml');
    this.contextFilesDir = path.join(basePath, 'context_files');
    this.loadProjectConfig().catch(err => {
        logger.error({ error: err }, 'Failed to preload project config during construction');
        // We can choose to throw here or let methods fail gracefully
    });
  }

  private async loadProjectConfig(): Promise<ProjectConfig> {
    try {
      const fileContents = await fs.readFile(this.projectConfigPath, 'utf8');
      const config = yaml.load(fileContents) as ProjectConfig;
      if (!config || typeof config.system_prompt !== 'string' || !Array.isArray(config.context_file_names)) {
        logger.warn('Project config is malformed or incomplete. Using default config.', { loadedConfig: config });
        this.loadedConfig = { ...DEFAULT_PROJECT_CONFIG };
        if (config && config.system_prompt) this.loadedConfig.system_prompt = config.system_prompt;
        if (config && Array.isArray(config.context_file_names)) {
            this.loadedConfig.context_file_names = config.context_file_names.filter(name => typeof name === 'string');
        } else {
            this.loadedConfig.context_file_names = [];
        }
      } else {
        this.loadedConfig = config;
      }
      logger.info('Project config loaded successfully.');
      return this.loadedConfig;
    } catch (error) {
      logger.warn(
        { err: error, path: this.projectConfigPath },
        'project.yaml not found or failed to load. Using default configuration.'
      );
      this.loadedConfig = { ...DEFAULT_PROJECT_CONFIG };
      return this.loadedConfig;
    }
  }

  public async getProjectConfig(): Promise<ProjectConfig> {
    if (!this.loadedConfig) {
        // Attempt to load if not preloaded or if preloading failed
        return await this.loadProjectConfig();
    }
    return this.loadedConfig;
  }

  public async getSystemPrompt(): Promise<string> {
    const config = await this.getProjectConfig();
    return config.system_prompt;
  }

  public async getContextContent(): Promise<string> {
    const config = await this.getProjectConfig();
    if (!config.context_file_names || config.context_file_names.length === 0) {
      logger.info('No context files specified in project config.');
      return '';
    }

    let combinedContext = '';
    for (const fileName of config.context_file_names) {
      if (typeof fileName !== 'string') {
        logger.warn({ fileName }, 'Invalid file name in context_file_names, skipping.');
        continue;
      }
      const filePath = path.join(this.contextFilesDir, fileName);
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        combinedContext += `\n\n--- Context from ${fileName} ---\n${fileContent}`;
        logger.debug({ file: fileName }, 'Successfully read context file.');
      } catch (error) {
        logger.error({ err: error, file: filePath }, 'Failed to read context file. It will be skipped.');
      }
    }
    return combinedContext;
  }

  public async getFullDynamicPrompt(userMessage: string): Promise<string> {
    const systemPrompt = await this.getSystemPrompt();
    const contextContent = await this.getContextContent();
    
    // Ensure userMessage is not undefined or null
    const safeUserMessage = userMessage || ""; 

    // Construct the prompt. Adjust the order and formatting as needed.
    let fullPrompt = systemPrompt;
    if (contextContent) {
      fullPrompt += `\n\n## Context:\n${contextContent}`;
    }
    fullPrompt += `\n\n## User Query:\n${safeUserMessage}`;
    
    logger.info('Full dynamic prompt constructed.');
    logger.debug({ 
        systemPromptLength: systemPrompt.length,
        contextLength: contextContent.length,
        userMessageLength: safeUserMessage.length,
        fullPromptLength: fullPrompt.length
    }, 'Prompt construction details');

    return fullPrompt;
  }

  // Future methods for managing the project can be added here:
  // async updateSystemPrompt(newPrompt: string): Promise<void> { ... }
  // async addContextFile(filePathOnUserSystem: string, targetFileNameInContextDir: string): Promise<void> { ... }
  // async removeContextFile(fileNameInContextDir: string): Promise<void> { ... }
}

// Optional: Export a singleton instance if preferred for some use cases,
// though typically instantiation in the API route is clearer.
// export const chatProjectService = new ChatProjectService(); 