import { z } from "zod";

export const StanleyResponse = z.object({
  content: z.string(), // Verbal response
  type: z.enum(["action", "query", "conversational", "convert", "ignored"]),
  target: z
    .enum([
      "noTarget",
      "lights",
      "curtains",
      "temperature",
      "tv",
      "distance",
      "general",
      "fantasy football",
      "text",
      "weather",
      "phone",
      "internet",
      "updates",
      "stocks",
      "pc command",
      "vs code command",
      "health",
      "blood pressure",
    ])
    .optional(),
  value: z.string().optional(),
  state: z
    .enum([
      "forecast",
      "temperature",
      "deadline",
      "latest",
      "trendRecently",
      "trendMonth",
      "trendYear",
      "open",
      "close",
    ])
    .optional(),
  room: z.string().optional(),

  appNames: z
    .array(
      z.enum([
        // Browsers
        "microsoft edge",
        "google chrome",
        "firefox",
        "opera",

        // Microsoft Office Apps
        "outlook",
        "excel",
        "word",
        "powerpoint",
        "onenote",

        // Windows Apps
        "calendar",
        "people",
        "mail",
        "files",
        "file explorer",
        "notepad",
        "calculator",
        "settings",
        "photos",
        "store",

        // Development Tools
        "visual studio code",
        "vs code",
        "visual studio",
        "github desktop",
        "terminal",

        // Communication Apps
        "skype",
        "teams",
        "slack",
        "discord",
      ])
    )
    .optional(),

  appCommands: z.array(z.enum(["open", "close", "minimize", "maximize"])),
  vsCodeCommands: z.array(
    z.enum([
      "build",
      "run",
      "git log",
      "close log",
      "git pull",
      "git status",
      "git push",
      "git commit",
      "git checkout main",
      "install dependencies",
      "run tests",
      "lint",
      "storybook",
    ])
  ),
});
