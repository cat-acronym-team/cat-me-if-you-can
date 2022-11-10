import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type {
  KickBanRequest,
  LobbyCreationResponse,
  LobbyRequest,
  StalkChatroomRequest,
} from "./firebase-functions-types";
import type { ChangeAvatarData } from "./functions-types/avatar";

export const lobbyReturn = httpsCallable<LobbyRequest, void>(functions, "lobbyReturn");
export const createLobby = httpsCallable<void, LobbyCreationResponse>(functions, "createLobby");
export const startGame = httpsCallable<LobbyRequest, void>(functions, "startGame");
export const joinLobby = httpsCallable<LobbyRequest, void>(functions, "joinLobby");
export const leaveLobby = httpsCallable<LobbyRequest, void>(functions, "leaveLobby");
export const stalkChatroom = httpsCallable<StalkChatroomRequest, void>(functions, "stalkChatroom");
export const changeAvatar = httpsCallable<ChangeAvatarData, void>(functions, "changeAvatar");
export const verifyExpiration = httpsCallable<LobbyRequest, void>(functions, "verifyExpiration");
export const kick = httpsCallable<KickBanRequest, void>(functions, "kick");
export const ban = httpsCallable<KickBanRequest, void>(functions, "ban");
