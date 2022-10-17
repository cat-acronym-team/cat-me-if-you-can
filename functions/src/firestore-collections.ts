import { ChatMessage, ChatRoom, Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
import { db } from "./app";
import { firestore } from "firebase-admin";
import { UserData } from "./firestore-types/users";
import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";

export const userCollection = db.collection("users") as CollectionReference<UserData>;

export const lobbyCollection = db.collection("lobbies") as CollectionReference<Lobby>;

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return lobbyDoc.collection("privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getChatRoomCollection(lobbyDoc: firestore.DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatRooms") as firestore.CollectionReference<ChatRoom>;
}
export function getChatRoomMessagesCollection(roomDoc: firestore.DocumentReference<ChatRoom>) {
  return roomDoc.collection("chatMessages") as firestore.CollectionReference<ChatMessage>;
}
export function getPromptAnswerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PromptAnswer> {
  return lobbyDoc.collection("promptAnswers") as CollectionReference<PromptAnswer>;
}
