import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type { LobbyRequest, ErrorResponse, ChatRequest } from "./firestore-functions-types";

export const startGame = httpsCallable<LobbyRequest, ErrorResponse>(functions, "startGame");
export const joinLobby = httpsCallable<LobbyRequest, ErrorResponse>(functions, "joinLobby");
<<<<<<< HEAD
export const stalkChatroom = httpsCallable<LobbyRequest, ErrorResponse>(functions, "stalkChatroom");
=======
export const deleteChatRooms = httpsCallable<LobbyRequest, ErrorResponse>(functions, "deleteChatRooms");
export const addChatMessage = httpsCallable<ChatRequest, ErrorResponse>(functions, "addChatMessage");
>>>>>>> 34b204159b5aa2ecd44f428a6fd4a8f79985dc0b
