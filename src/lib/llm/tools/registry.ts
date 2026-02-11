import { ToolDefinition } from "../types";

export interface ToolHandler {
  definition: ToolDefinition;
  execute: (args: any) => Promise<string> | string;
}

class ToolRegistry {
  private tools: Map<string, ToolHandler> = new Map();

  register(handler: ToolHandler) {
    this.tools.set(handler.definition.function.name, handler);
  }

  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  async execute(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    try {
      const result = await tool.execute(args);
      return typeof result === "string" ? result : JSON.stringify(result);
    } catch (error: any) {
      return `Error executing tool ${name}: ${error.message}`;
    }
  }

  isAllowed(name: string): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new ToolRegistry();
