import { Lobby } from "./firestore-types/lobby";
import { db } from "./app";
import { firestore } from "firebase-admin";

export const lobbyCollection = db.collection("lobbies") as firestore.CollectionReference<Lobby>;
