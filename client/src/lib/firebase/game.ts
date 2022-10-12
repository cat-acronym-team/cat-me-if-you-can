import { doc, updateDoc } from "firebase/firestore";
import { lobbyCollection } from "$lib/firebase/firestore-collections";
import type { GameState } from "./firestore-types/lobby";

/*
  You can change the game state of the current lobby
*/
export const changeGameState = async (lobbyId: string, state: GameState) => {
  await updateDoc(doc(lobbyCollection, lobbyId), {
    state,
  });
};
