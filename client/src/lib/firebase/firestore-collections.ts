import { collection, type CollectionReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";
import type { ChatMessage, ChatRoom, Lobby } from "$lib/firebase/firestore-types/lobby";
import type { UserData } from "./firestore-types/users";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
export const userCollection = collection(db, "users") as CollectionReference<UserData>;

export function getChatRoomCollection(lobbyId: string) {
  return collection(lobbyCollection, lobbyId, "chatRooms") as CollectionReference<ChatRoom>;
}
export function getChatRoomMessagesCollection(lobbyId: string, roomId: string) {
  return collection(getChatRoomCollection(lobbyId), roomId, "chatMessages") as CollectionReference<ChatMessage>;
}
