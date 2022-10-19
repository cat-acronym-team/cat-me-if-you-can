export type LobbyRequest = { code: string };

export type ErrorResponse = { error?: string };

export function isLobbyRequest(data: unknown): data is LobbyRequest {
  // will only return true if the data is an object with a code property and string
  return data != null && typeof data === "object" && "code" in data && typeof (data as LobbyRequest).code === "string";
}

// lobby code and chat id are needed to stalk chatroom
export type StalkChatroomRequest = { code: string; chatId: string };

export function isStalkChatroomRequest(data: unknown): data is StalkChatroomRequest {
  return (
    data != null &&
    typeof data === "object" &&
    "code" in data &&
    "chatId" in data &&
    typeof (data as StalkChatroomRequest).code === "string" &&
    typeof (data as StalkChatroomRequest).chatId === "string"
  );
}

export type ChatRequest = { code: string; roomId: string; message: string };

export function isChatRequest(data: unknown): data is ChatRequest {
  return (
    data != null &&
    typeof data === "object" &&
    "code" in data &&
    typeof (data as ChatRequest).code === "string" &&
    "roomId" in data &&
    typeof (data as ChatRequest).roomId === "string" &&
    "message" in data &&
    typeof (data as ChatRequest).message === "string"
  );
}

export type GeneratedPairs = {
  pairs: { one: string; two: string }[];
  stalker?: string;
};
