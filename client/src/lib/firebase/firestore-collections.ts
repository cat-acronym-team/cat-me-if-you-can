import type { Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
import type { UserData } from "./firestore-types/users";
import { collection, type CollectionReference, type DocumentReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

export const userCollection = collection(db, "users") as CollectionReference<UserData>;

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return collection(lobbyDoc, "privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getPromptAnswerCollection(lobbyCode: string): CollectionReference<PromptAnswer> {
  return collection(lobbyCollection, lobbyCode, "promptAnswers") as CollectionReference<PromptAnswer>;
}
