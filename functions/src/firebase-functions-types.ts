import { LobbySettings } from "./firestore-types/lobby";

export type LobbyRequest = { code: string };

export type LobbySettingsRequest = {
  code: string;
  lobbySettings: LobbySettings;
};

export type LobbyCreationResponse = { code: string };

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
