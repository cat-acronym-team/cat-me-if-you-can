import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type { LobbyRequest, ChatRequest, StalkChatroomRequest } from "./firestore-functions-types";
import type { ChangeAvatarData } from "./functions-types/avatar";

export const startGame = httpsCallable<LobbyRequest, void>(functions, "startGame");
export const joinLobby = httpsCallable<LobbyRequest, void>(functions, "joinLobby");
export const stalkChatroom = httpsCallable<StalkChatroomRequest, void>(functions, "stalkChatroom");
export const deleteChatRooms = httpsCallable<LobbyRequest, void>(functions, "deleteChatRooms");
export const addChatMessage = httpsCallable<ChatRequest, void>(functions, "addChatMessage");
export const changeAvatar = httpsCallable<ChangeAvatarData, void>(functions, "changeAvatar");
export const verifyExpiration = httpsCallable<LobbyRequest, void>(functions, "verifyExpiration");
