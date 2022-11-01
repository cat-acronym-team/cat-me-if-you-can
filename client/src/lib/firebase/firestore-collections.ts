<<<<<<< HEAD
import type { ChatMessage, Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
=======
import type { Lobby, PrivatePlayer, PromptAnswer, ChatRoom, ChatMessage } from "./firestore-types/lobby";
>>>>>>> 5082facc09f1ecef5defb3da12e8fabd06d92793
import type { UserData } from "./firestore-types/users";
import { collection, type CollectionReference, type DocumentReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

export const userCollection = collection(db, "users") as CollectionReference<UserData>;
export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;

<<<<<<< HEAD
export function getLobbyChatCollection(lobbyId: string) {
  return collection(lobbyCollection, lobbyId, "chatMessages") as CollectionReference<ChatMessage>;
=======
export function getChatRoomCollection(lobbyId: string) {
  return collection(lobbyCollection, lobbyId, "chatRooms") as CollectionReference<ChatRoom>;
}

export function getChatRoomMessagesCollection(lobbyId: string, roomId: string) {
  return collection(getChatRoomCollection(lobbyId), roomId, "chatMessages") as CollectionReference<ChatMessage>;
>>>>>>> 5082facc09f1ecef5defb3da12e8fabd06d92793
}

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return collection(lobbyDoc, "privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getPromptAnswerCollection(lobbyCode: string): CollectionReference<PromptAnswer> {
  return collection(lobbyCollection, lobbyCode, "promptAnswers") as CollectionReference<PromptAnswer>;
}
