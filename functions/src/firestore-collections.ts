import {
  ChatMessage,
  ChatRoom,
  Lobby,
  PrivatePlayer,
  PromptAnswer,
  Vote,
  LobbyChatMessage,
} from "./firestore-types/lobby";
import { db } from "./app";
import { UserData } from "./firestore-types/users";
import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";

export const userCollection = db.collection("users") as CollectionReference<UserData>;

export const lobbyCollection = db.collection("lobbies") as CollectionReference<Lobby>;

export function getLobbyChatCollection(lobbyDoc: DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatMessages") as CollectionReference<LobbyChatMessage>;
}

export function getChatRoomCollection(lobbyDoc: DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatRooms") as CollectionReference<ChatRoom>;
}

export function getChatRoomMessagesCollection(roomDoc: DocumentReference<ChatRoom>) {
  return roomDoc.collection("chatMessages") as CollectionReference<ChatMessage>;
}

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return lobbyDoc.collection("privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getPromptAnswerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PromptAnswer> {
  return lobbyDoc.collection("promptAnswers") as CollectionReference<PromptAnswer>;
}

export function getVoteCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<Vote> {
  return lobbyDoc.collection("votes") as CollectionReference<Vote>;
}
