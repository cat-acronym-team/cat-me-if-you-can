export type LobbyRequest = { code: string };

export type LobbyCreationResponse = { code: string };

export type StalkChatroomRequest = { code: string; chatId: string };

export type KickBanRequest = { code: string; uid: string };

export function isLobbyRequest(data: unknown): data is LobbyRequest {
  // will only return true if the data is an object with a code property and string
  return data != null && typeof data === "object" && "code" in data && typeof (data as LobbyRequest).code === "string";
}

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

export function isKickBanRequest(data: unknown): data is KickBanRequest {
  // will only return true if the data is an object with a code and uid property and string
  return (
    data != null &&
    typeof data === "object" &&
    "code" in data &&
    "uid" in data &&
    typeof (data as KickBanRequest).code === "string" &&
    typeof (data as KickBanRequest).uid === "string"
  );
}
