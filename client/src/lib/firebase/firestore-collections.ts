import { collection, type CollectionReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

import type { ChatRoom, Lobby } from "$lib/firebase/firestore-types/lobby";
import type { UserData } from "./firestore-types/users";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
export const userCollection = collection(db, "users") as CollectionReference<UserData>;
export const chatRoomCollection = collection(lobbyCollection, "chatRooms") as CollectionReference<ChatRoom>;
