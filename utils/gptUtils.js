import { Configuration, OpenAIApi } from "openai";
import { addAssistantMessage, getConversation } from "./conversationUtils.js";

const openAIConfig = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(openAIConfig);
const promptSeparator = "--->"; // We need to append our prompts with this when using our fine tuned model

const model = "ft:gpt-3.5-turbo-0125:personal:april1:99AKCmjO";

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

  const response = await openai.createChatCompletion({
    model,
    messages: getConversation(),
    temperature: 0.7,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`ChatGPT call duration: ${duration} milliseconds`); // Log the duration

  if (response.data && response.data.choices) {
    let responseDataString = response.data.choices[0].message.content;
    responseDataString = responseDataString.replace(/(\r\n|\n|\r)/gm, "");
    const parsedResponseData = JSON.parse(responseDataString);

    if (parsedResponseData.type !== "ignored") {
      addAssistantMessage(responseDataString);
    }

    return {
      responseData: parsedResponseData,
      usage: response.data.usage,
    };
  }

  throw new Error("The response is in an unsupported format");
};

export const makeCompletionRequest = async (
  prompt,
  model = "davinci:ft-personal-2023-04-22-09-11-35"
) => {
  const response = await openai.createCompletion({
    model,
    stop: ["}"], // Used for fine tuned model. Not needed if using build in models
    prompt: prompt + promptSeparator,
    temperature: 0.7,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  if (response.data && response.data.choices) {
    let responseJsonString = response.data.choices[0].text.trim() + "}";
    // Manually switch the single quotes with double quotes - but NOT for mid sentance single quotes such as "i'm, we're"
    responseJsonString = responseJsonString
      .replace(/\' , '/g, '","')
      .replace(/\', '/g, '","')
      .replace(/\' ,'/g, '","')
      .replace(/\','/g, '","')
      .replace(/\' : '/g, '":"')
      .replace(/\': '/g, '":"')
      .replace(/\' :'/g, '":"')
      .replace(/\':'/g, '":"')
      .replace(/\{'/g, '{"')
      .replace(/\'}/g, '"}');

    try {
      const responseData = JSON.parse(responseJsonString);
      return {
        responseData,
        usage: response.data.usage,
      };
    } catch (error) {
      console.log("couldn't parse result: ");
      console.log(responseJsonString);
      throw Error(error);
    }
  }

  console.log(response);
  throw new Error("The response is in an unsupported format");
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
  const response = await openai.createChatCompletion({
    model: model.name,
    messages: [
      {
        role: "system",
        content: systemQuery,
      },
      { role: "user", content: userQuery },
    ],
    temperature: 0.7,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  if (response.data && response.data.choices) {
    let responseData = response.data.choices[0].message.content;
    responseData = responseData.replace(/(\r\n|\n|\r)/gm, "");

    const usageData = response.data.usage;

    return {
      responseData,
      usage: usageData,
      cost: calculateQueryCost(usageData, model),
    };
  }

  throw new Error("The response is in an unsupported format");
};

/** Prints estimated token costs */
const printUsage = (usageData) => {
  const promptTokens = usageData.prompt_tokens;
  const completionTokens = usageData.completion_tokens;
  const totalTokens = usageData.total_tokens;

  const centsThousandTokens = 0.02;
  const centsPerToken = centsThousandTokens / 1000;

  const promptCents = promptTokens * centsPerToken;
  const completionCents = completionTokens * centsPerToken;
  const totalCents = totalTokens * centsPerToken;

  const roughUsdToGbpRate = 0.8;

  console.log(`Estimate token usage -
        Prompt: ${promptTokens} tokens ($${promptCents}/£${
    promptCents * roughUsdToGbpRate
  })
        Completion: ${completionTokens} tokens ($${completionCents}/£${
    completionCents * roughUsdToGbpRate
  })
        Total: ${totalTokens} tokens ($${totalCents}/£${
    totalCents * roughUsdToGbpRate
  })
    `);
};

function calculateQueryCost(usageData, model, gbpToUsdExchangeRate) {
  // Invert the exchange rate to get USD to GBP
  const usdToGbpRate = 1 / gbpToUsdExchangeRate;

  const promptTokens = usageData.prompt_tokens;
  const completionTokens = usageData.completion_tokens;

  // Calculate the cost for input and output tokens
  const inputCost = (promptTokens / 1000) * model.inputCostPer1k;
  const outputCost = (completionTokens / 1000) * model.outputCostPer1k;

  // Calculate the total cost in USD
  const totalCostUsd = inputCost + outputCost;

  // Convert the total cost to GBP
  const totalCostGbp = totalCostUsd * usdToGbpRate;

  // Return the total cost in GBP
  return totalCostGbp;
}
