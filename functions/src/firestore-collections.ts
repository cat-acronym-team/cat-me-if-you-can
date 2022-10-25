import type { ChatMessage, Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";
import { db } from "./app";

export const userCollection = db.collection("users") as CollectionReference<UserData>;

export const lobbyCollection = db.collection("lobbies") as CollectionReference<Lobby>;

export function getLobbyChatCollection(lobbyDoc: DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatMessages") as CollectionReference<ChatMessage>;
}

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return lobbyDoc.collection("privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getPromptAnswerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PromptAnswer> {
  return lobbyDoc.collection("promptAnswers") as CollectionReference<PromptAnswer>;
}
