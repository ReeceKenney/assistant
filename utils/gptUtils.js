import OpenAI from "openai";
import { addAssistantMessage, getConversation } from "./conversationUtils.js";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { StanleyResponse } from "../stanleySchema.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const gpt4 = {
  name: "gpt-4",
  inputCostPer1k: 0.03,
  outputCostPer1k: 0.06,
};

export const gpt3 = {
  name: "gpt-3.5-turbo-1106",
  inputCostPer1k: 0.001,
  outputCostPer1k: 0.002,
};

export const makeChatRequest = async () => {
  const startTime = performance.now();

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: formatConversationForAPI(),
    temperature: 0.7,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: zodResponseFormat(StanleyResponse, "stanley_response"),
  });

  const endTime = performance.now();
  console.log(`ChatGPT call duration: ${endTime - startTime}ms`);

  if (!completion.choices) {
    throw new Error("The response is in an unsupported format");
  }

  const parsedResponseData = completion.choices[0].message.parsed; // ✅ This now returns a structured response!

  if (parsedResponseData.type !== "ignored") {
    addAssistantMessage(parsedResponseData);
  }
  console.log("parsedResponseData", parsedResponseData);
  return {
    responseData: parsedResponseData,
    usage: null, //response.data.usage,
  };
};

/**
 * Function to make a one-off request to ChatGPT.
 * @param {string} query - The standalone query to be sent to ChatGPT.
 * @returns {Promise<{responseData: string, usage: object}>}
 */
export const makeOneOffChatRequestForWidget = async (query) => {
  const model = gpt3;
  const systemQuery =
    "This is a one-off request where your response will be displayed on a dashboard - as is. The user will not be able to respond with any follow ups so do not ask.";

  return makeOneOffChatRequest(query, systemQuery, model);
};

export const makeOneOffChatRequest = async (
  userQuery,
  systemQuery,
  model = gpt4
) => {
  const completion = await openai.beta.chat.completions.parse({
    model: model.name,
    messages: [
      { role: "system", content: systemQuery },
      { role: "user", content: userQuery },
    ],
    temperature: 0.7,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  if (!completion.choices) {
    throw new Error("The response is in an unsupported format");
  }

  const responseData = completion.choices[0].message.content.trim();

  return {
    responseData,
    usage: null, //response.data.usage || null,
    cost: 0, //calculateQueryCost(response.data.usage, model),
  };
};

const formatConversationForAPI = () => {
  const conversation = getConversation();
  return conversation.map((msg) => ({
    ...msg,
    content:
      typeof msg.content === "object"
        ? JSON.stringify(msg.content)
        : msg.content,
  }));
};
