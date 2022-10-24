import { Timestamp } from "firebase-admin/firestore";

export type LobbyRequest = { code: string };

export type ErrorResponse = { error?: string };

export type ExpirationRequest = {
  time: Timestamp;
  code: string;
};

export type GeneratedPairs = {
  pairs: { one: string; two: string }[];
  stalker?: string;
};

export function isLobbyRequest(data: unknown): data is LobbyRequest {
  // will only return true if the data is an object with a code property and string
  return data != null && typeof data === "object" && "code" in data && typeof (data as LobbyRequest).code === "string";
}

export function isExpirationRequest(data: unknown): data is ExpirationRequest {
  return (
    data != null &&
    typeof data === "object" &&
    "code" in data &&
    typeof (data as ExpirationRequest).code === "string" &&
    "time" in data &&
    typeof (data as ExpirationRequest).time === "object" &&
    "seconds" in (data as ExpirationRequest).time &&
    "nanoseconds" in (data as ExpirationRequest).time
  );
}
