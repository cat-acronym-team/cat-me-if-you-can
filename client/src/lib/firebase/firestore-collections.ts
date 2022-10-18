import type { Lobby, PrivatePlayer, Vote } from "./firestore-types/lobby";
import { collection, CollectionReference, DocumentReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

import type { UserData } from "./firestore-types/users";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
export const userCollection = collection(db, "users") as CollectionReference<UserData>;

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return collection(lobbyDoc, "privatePlayers") as CollectionReference<PrivatePlayer>;
}

export function getVoteCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<Vote> {
  return collection(lobbyDoc, "votes") as CollectionReference<Vote>;
}
