import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type { LobbyRequest, ErrorResponse } from "./firestore-functions-types";
import type { ChangeAvatarData } from "./functions-types/avatar";

export const startGame = httpsCallable<LobbyRequest, ErrorResponse>(functions, "startGame");
export const joinLobby = httpsCallable<LobbyRequest, ErrorResponse>(functions, "joinLobby");
export const changeAvatar = httpsCallable<ChangeAvatarData, void>(functions, "changeAvatar");