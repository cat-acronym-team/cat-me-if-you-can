import { collection, type CollectionReference } from "firebase/firestore";
import { db } from "$lib/firebase/app";

import type { Lobby } from "$lib/firebase/firestore-types/lobby";

export const lobbyCollection = collection(db, "lobbies") as CollectionReference<Lobby>;
