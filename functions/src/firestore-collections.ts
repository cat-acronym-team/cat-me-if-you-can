import { ChatMessage, ChatRoom, Lobby } from "./firestore-types/lobby";
import { db } from "./app";
import { firestore } from "firebase-admin";
import { UserData } from "./firestore-types/users";

export const userCollection = db.collection("users") as firestore.CollectionReference<UserData>;
export const lobbyCollection = db.collection("lobbies") as firestore.CollectionReference<Lobby>;

export function getChatRoomCollection(lobbyDoc: firestore.DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatRooms") as firestore.CollectionReference<ChatRoom>;
}
export function getChatRoomMessagesCollection(roomDoc: firestore.DocumentReference<ChatRoom>) {
  return roomDoc.collection("chatMessages") as firestore.CollectionReference<ChatMessage>;
}
