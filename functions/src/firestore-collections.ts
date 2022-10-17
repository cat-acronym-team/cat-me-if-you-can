import { Lobby } from "./firestore-types/lobby";
import { db } from "./app";
import { firestore } from "firebase-admin";
import { UserData } from "./firestore-types/users";

export const userCollection = db.collection("users") as firestore.CollectionReference<UserData>;
export const lobbyCollection = db.collection("lobbies") as firestore.CollectionReference<Lobby>;
