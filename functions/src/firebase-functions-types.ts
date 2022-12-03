import type { LobbySettings } from "./firestore-types/lobby";

export type LobbyRequest = { code: string };

export type LobbySettingsRequest = {
  code: string;
  lobbySettings: LobbySettings;
};

export type LobbyCreationResponse = { code: string };

export type StalkChatroomRequest = { code: string; chatId: string };

export type KickBanRequest = { code: string; uid: string };

export function isLobbyRequest(data: unknown): data is LobbyRequest {
  // will only return true if the data is an object with a code property and string
  return data != null && typeof data === "object" && "code" in data && typeof (data as LobbyRequest).code === "string";
}

export function isLobbySettingsRequest(data: unknown): data is LobbySettingsRequest {
  return (
    data != null &&
    typeof data === "object" &&
    "code" in data &&
    "lobbySettings" in data &&
    typeof (data as LobbySettingsRequest).code === "string" &&
    typeof (data as LobbySettingsRequest).lobbySettings.catfishAmount === "number" &&
    typeof (data as LobbySettingsRequest).lobbySettings.promptTime === "number" &&
    typeof (data as LobbySettingsRequest).lobbySettings.chatTime === "number" &&
    typeof (data as LobbySettingsRequest).lobbySettings.voteTime === "number"
  );
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
  return (
    data != null &&
    typeof data === "object" &&
    "code" in data &&
    "uid" in data &&
    typeof (data as KickBanRequest).code === "string" &&
    typeof (data as KickBanRequest).uid === "string"
  );
}
