export {
  gpt3,
  makeChatRequest,
  makeOneOffChatRequestForWidget,
  makeOneOffChatRequest,
} from "./utils/gptUtils.js";
export {
  addAssistantMessage,
  addSystemMessage,
  addUserMessage,
  initConversation,
  resetConversation,
  updateLatestAssistantContent,
  addFulfilmentKeysToHistory,
  getLatestFulfilmentKeyEntry,
  getMinutesSinceKeyWasUsed,
} from "./utils/conversationUtils.js";

// import { addUserMessage, initConversation } from "./utils/conversationUtils.js";
// import { makeChatRequest } from "./utils/gptUtils.js";
// initConversation();
// addUserMessage("fetch the latest changes");
// makeChatRequest().then((response) => {
//   console.log(response.responseData);

//   addUserMessage("Thanks");
//   makeChatRequest().then((response) => {
//     console.log(response.responseData);
//   });
// });
