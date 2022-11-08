import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type { LobbyCreationResponse, LobbyRequest } from "./firebase-functions-types";
import type { ChangeAvatarData } from "./functions-types/avatar";

export const lobbyReturn = httpsCallable<LobbyRequest, void>(functions, "lobbyReturn");
export const createLobby = httpsCallable<void, LobbyCreationResponse>(functions, "createLobby");
export const startGame = httpsCallable<LobbyRequest, void>(functions, "startGame");
export const joinLobby = httpsCallable<LobbyRequest, void>(functions, "joinLobby");
export const leaveLobby = httpsCallable<LobbyRequest, void>(functions, "leaveLobby");
export const changeAvatar = httpsCallable<ChangeAvatarData, void>(functions, "changeAvatar");
export const verifyExpiration = httpsCallable<LobbyRequest, void>(functions, "verifyExpiration");
