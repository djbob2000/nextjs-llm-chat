import { toolRegistry } from "./registry";
import { getCurrentTime } from "./get-current-time";
import { summarizeText } from "./summarize-text";

// Register all tools
toolRegistry.register(getCurrentTime);
toolRegistry.register(summarizeText);

export { toolRegistry };
