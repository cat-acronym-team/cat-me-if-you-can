<<<<<<< HEAD
import type { Lobby, PrivatePlayer } from "./firestore-types/lobby";
import { collection, CollectionReference, DocumentReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

import type { UserData } from "./firestore-types/users";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
export const userCollection = collection(db, "users") as CollectionReference<UserData>;
=======
import type { Lobby, PrivatePlayer, PromptAnswer } from "./firestore-types/lobby";
import type { UserData } from "./firestore-types/users";
import { collection, type CollectionReference, type DocumentReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

export const userCollection = collection(db, "users") as CollectionReference<UserData>;

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
>>>>>>> 74a594e77503c601be15baa1fa367bb03da09875

export function getPrivatePlayerCollection(lobbyDoc: DocumentReference<Lobby>): CollectionReference<PrivatePlayer> {
  return collection(lobbyDoc, "privatePlayers") as CollectionReference<PrivatePlayer>;
}
<<<<<<< HEAD
=======

export function getPromptAnswerCollection(lobbyCode: string): CollectionReference<PromptAnswer> {
  return collection(lobbyCollection, lobbyCode, "promptAnswers") as CollectionReference<PromptAnswer>;
}
>>>>>>> 74a594e77503c601be15baa1fa367bb03da09875
