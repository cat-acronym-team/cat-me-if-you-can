import { collection, DocumentReference, type CollectionReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";
import type { ChatMessage, ChatRoom, Lobby } from "$lib/firebase/firestore-types/lobby";
import type { UserData } from "./firestore-types/users";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
export const userCollection = collection(db, "users") as CollectionReference<UserData>;

export function getChatRoomCollection(lobbyId: string) {
  return collection(lobbyCollection, lobbyId, "chatRooms") as CollectionReference<ChatRoom>;
}

export function getChatRoomMessages(ref: DocumentReference<ChatRoom>) {
  return collection(ref, "chatMessages") as CollectionReference<ChatMessage>;
}
