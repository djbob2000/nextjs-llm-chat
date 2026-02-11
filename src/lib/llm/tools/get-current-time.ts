import { ToolHandler } from "./registry";

export const getCurrentTime: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and time in a specific timezone",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description:
              'IANA timezone, e.g. "America/New_York", "Europe/London", "UTC"',
          },
        },
        required: ["timezone"],
      },
    },
  },
  execute: (args: { timezone: string }) => {
    return new Date().toLocaleString("en-US", { timeZone: args.timezone });
  },
};
