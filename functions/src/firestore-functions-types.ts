export type LobbyRequest = { code: string };
export type ErrorResponse = { error?: string };
export function codeCheck(code: unknown) {
  return typeof code === "string" && code.length === 6;
}
