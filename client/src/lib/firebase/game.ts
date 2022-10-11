import { doc } from "firebase/firestore";
import { lobbyCollection } from "$lib/firebase/firestore-collections";

/*
  You can change the game state of the current lobby
*/
export const changeGameState = (lobbyId: string, state: string) => {};
