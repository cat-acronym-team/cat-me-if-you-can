import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type { LobbyRequest, ErrorResponse, ChatRequest, StalkChatroomRequest } from "./firestore-functions-types";
import type { ChangeAvatarData } from "./functions-types/avatar";

export const startGame = httpsCallable<LobbyRequest, void>(functions, "startGame");
export const joinLobby = httpsCallable<LobbyRequest, void>(functions, "joinLobby");
export const stalkChatroom = httpsCallable<StalkChatroomRequest, ErrorResponse>(functions, "stalkChatroom");
export const deleteChatRooms = httpsCallable<LobbyRequest, ErrorResponse>(functions, "deleteChatRooms");
export const addChatMessage = httpsCallable<ChatRequest, ErrorResponse>(functions, "addChatMessage");
export const changeAvatar = httpsCallable<ChangeAvatarData, void>(functions, "changeAvatar");
export const verifyExpiration = httpsCallable<LobbyRequest, void>(functions, "verifyExpiration");
