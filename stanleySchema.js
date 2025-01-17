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
      "app",
      "code",
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
    ])
    .optional(),
  room: z.string().optional(),
});
