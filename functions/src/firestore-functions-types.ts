export type LobbyRequest = { code: string };

export type ErrorResponse = { error?: string };

export function isLobbyRequest(data: unknown): data is LobbyRequest {
  // will only return true if the data is an object with a code property and string
  return data != null && (data as LobbyRequest).code !== undefined && typeof (data as LobbyRequest).code === "string";
}
