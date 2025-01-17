let conversation = [];
let fulfilmentKeyHistory = []; // Stores the keys of the fulfilment text that have been used in the conversation
let conversationTimer;

export const getConversation = () => conversation;

export const initConversation = (name = "Stanley") => {
  resetConversationTimer();

  // addSystemMessage(`Your name is ${name}`);
  addSystemMessage(systemPrompt);
};

export const addUserMessage = (messageText) => {
  const message = {
    role: "user",
    content: messageText,
  };
  conversation.push(message);
  resetConversationTimer();
};

export const addAssistantMessage = (messageObject) => {
  const message = {
    role: "assistant",
    content: JSON.stringify(messageObject),
  };
  conversation.push(message);
  resetConversationTimer();
};

export const addSystemMessage = (messageText) => {
  conversation.push({
    role: "system",
    content: messageText,
  });

  resetConversationTimer();
};

export const resetConversation = () => {
  conversation = [];
  fulfilmentKeyHistory = [];
  initConversation();
};

const resetConversationTimer = () => {
  clearTimeout(conversationTimer);
  conversationTimer = setTimeout(() => {
    resetConversation();
  }, 600000); // 10 minutes
};

export const updateLatestAssistantContent = (newContent) => {
  for (let i = conversation.length - 1; i >= 0; i--) {
    if (conversation[i].role === "assistant") {
      conversation[i].content = newContent;
      break;
    }
  }
};

export const addFulfilmentKeysToHistory = (keys) => {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  keys.forEach((key) => {
    fulfilmentKeyHistory.push({
      key,
      timestamp: new Date().toISOString(),
    });
  });
};

export const getLatestFulfilmentKeyEntry = (keyToFind) => {
  const filteredEntries = fulfilmentKeyHistory.filter(
    (entry) => entry.key === keyToFind
  );
  const sortedEntries = filteredEntries.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  return sortedEntries[0] || null; // Return the first item or null if no entries found
};

export const getMinutesSinceKeyWasUsed = (keyToFind) => {
  const latestEntry = getLatestFulfilmentKeyEntry(keyToFind);
  if (!latestEntry) {
    return null;
  }

  const { timestamp } = latestEntry;
  const timeDifference = new Date() - new Date(timestamp);
  return timeDifference / 60000; // Convert milliseconds to minutes
};

const systemPrompt = `Hello, Stanley! Your role is to analyze and classify user intent, not enforce access restrictions. 
Your responses must always follow the structured JSON format.

**Your Responsibilities:**
1. **Analyze user intent:** Identify whether a request is an action, query, or general conversation.
2. **Return structured JSON responses:** Format responses to match predefined schema.
3. **Do not enforce privacy restrictions:** If a user asks about personal data (e.g., blood pressure), assume they have access to it.

**What You Should NOT Do:**
- Do not refuse queries due to privacy concerns. If a request involves data retrieval (e.g., health records), assume the user has permission.
- Do not make assumptions about user restrictions.
- Do not ask the user if they need something—assume they will explicitly state their needs.

**Examples:**
- User: "What is my blood pressure?"
  Response: {"content":"", "type":"query", "target":"health", "value":"blood pressure"}
  
- User: "Turn on the kitchen lights"
  Response: {"content":"Okay, turning on the kitchen lights", "type":"action", "target":"lights", "state":"on", "room":"kitchen"}

- User: "What is the capital of France?"
  Response: {"content":"The capital of France is Paris.", "type":"conversational"}
  
**Output Format Requirements:**
- Responses **must** include "content" and "type" fields.
- "type" must be **one of**: "action", "query", "conversational", "convert", "ignored".
- "target" values must be strictly chosen from predefined categories.

Always analyze the request and return a **structured intent response**, without making assumptions about access or permissions.

If a query doesn't make sense for the current conversation context, you should assume it was an accidental query and simply ignore it without asking for clarification and specify the type "ignored".
`;
