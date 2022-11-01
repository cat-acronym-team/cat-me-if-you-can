<<<<<<< HEAD
import type { ChatMessage, Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
=======
import { ChatMessage, ChatRoom, Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
import { db } from "./app";
>>>>>>> 5082facc09f1ecef5defb3da12e8fabd06d92793
import { UserData } from "./firestore-types/users";
import type { CollectionReference, DocumentReference } from "firebase-admin/firestore";

export const userCollection = db.collection("users") as CollectionReference<UserData>;

export const lobbyCollection = db.collection("lobbies") as CollectionReference<Lobby>;

export function getLobbyChatCollection(lobbyDoc: DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatMessages") as CollectionReference<ChatMessage>;
}

<<<<<<< HEAD
=======
export function getChatRoomCollection(lobbyDoc: DocumentReference<Lobby>) {
  return lobbyDoc.collection("chatRooms") as CollectionReference<ChatRoom>;
}

export function getChatRoomMessagesCollection(roomDoc: DocumentReference<ChatRoom>) {
  return roomDoc.collection("chatMessages") as CollectionReference<ChatMessage>;
}

>>>>>>> 5082facc09f1ecef5defb3da12e8fabd06d92793
export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return lobbyDoc.collection("privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getPromptAnswerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PromptAnswer> {
  return lobbyDoc.collection("promptAnswers") as CollectionReference<PromptAnswer>;
}
