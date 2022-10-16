import { functions } from "$lib/firebase/app";
import { httpsCallable } from "firebase/functions";
import type { ErrorResponse } from "./firestore-functions-types";

export const startGame = httpsCallable<{ code: string }, ErrorResponse>(functions, "startGame");
export const addPlayer = httpsCallable<{ code: string }, ErrorResponse>(functions, "addPlayer");
