export type LobbyRequest = { code: string };

export type LobbyCreationResponse = { code: string };

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
