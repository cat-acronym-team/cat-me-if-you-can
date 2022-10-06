import type { Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
import { collection, CollectionReference, DocumentReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return collection(lobbyDoc, "privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getPromptAnswerCollection(lobbyCode: string): CollectionReference<PromptAnswer> {
  return collection(lobbyCollection, lobbyCode, "promptAnswers") as CollectionReference<PromptAnswer>;
}
