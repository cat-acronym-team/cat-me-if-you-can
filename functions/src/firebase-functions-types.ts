import { GAME_STATE_DURATIONS_MAX, GAME_STATE_DURATIONS_MIN, LobbySettings } from "./firestore-types/lobby";

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
  if (data === null || (data as LobbySettingsRequest).lobbySettings === null) {
    return false;
  }

  if (typeof data !== "object") {
    return false;
  }

  if (!("code" in data)) {
    return false;
  }

  if (!("lobbySettings" in data)) {
    return false;
  }

  if (Object.keys(data).length !== 2) {
    return false;
  }

  if (Object.keys((data as LobbySettingsRequest).lobbySettings).length !== 4) {
    return false;
  }

  if (typeof (data as LobbySettingsRequest).code !== "string" || (data as LobbySettingsRequest).code.length !== 6) {
    return false;
  }

  if (!Number.isInteger((data as LobbySettingsRequest).lobbySettings.catfishAmount)) {
    return false;
  }

  if (
    (data as LobbySettingsRequest).lobbySettings.catfishAmount < 1 ||
    (data as LobbySettingsRequest).lobbySettings.catfishAmount > 3
  ) {
    return false;
  }

  if (!Number.isInteger((data as LobbySettingsRequest).lobbySettings.promptTime)) {
    return false;
  }

  if (
    (data as LobbySettingsRequest).lobbySettings.promptTime < GAME_STATE_DURATIONS_MIN.PROMPT ||
    (data as LobbySettingsRequest).lobbySettings.promptTime > GAME_STATE_DURATIONS_MAX.PROMPT
  ) {
    return false;
  }

  if (!Number.isInteger((data as LobbySettingsRequest).lobbySettings.chatTime)) {
    return false;
  }

  if (
    (data as LobbySettingsRequest).lobbySettings.chatTime < GAME_STATE_DURATIONS_MIN.CHAT ||
    (data as LobbySettingsRequest).lobbySettings.chatTime > GAME_STATE_DURATIONS_MAX.CHAT
  ) {
    return false;
  }

  if (!Number.isInteger((data as LobbySettingsRequest).lobbySettings.voteTime)) {
    return false;
  }

  if (
    (data as LobbySettingsRequest).lobbySettings.voteTime < GAME_STATE_DURATIONS_MIN.VOTE ||
    (data as LobbySettingsRequest).lobbySettings.voteTime > GAME_STATE_DURATIONS_MAX.VOTE
  ) {
    return false;
  }

  return true;
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
