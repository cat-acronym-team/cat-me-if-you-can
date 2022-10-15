import type { Lobby } from "$lib/firebase/firestore-types/lobby";
import { getPrivatePlayerCollection } from "$lib/firebase/firestore-collections";
import { doc, setDoc, getDoc, DocumentReference } from "firebase/firestore";

export async function assignRole(lobby: DocumentReference<Lobby>) {
  // Number of catfish below, will later be made to be changable by users.
  const numCatFish = 1;
  const check: number[] = [];
  let current = 0;
  const validLobby = await getDoc(lobby);

  // Checks to see if lobby is indeed valid.
  if (!validLobby.exists()) {
    throw new Error("Invalid Lobby");
  }

  // Gets uids from lobby.
  const { uids } = validLobby.data();

  // For loop that will create a random number between 0 and the amount of players.
  // Then adds it to 'check', then loops back through again if needed, checking to see if the new random number was already selected and looping agian if so.
  for (let i = 0; i < numCatFish; i++) {
    current = Math.floor(Math.random() * (uids.length - 1) + 0);
    if (check.indexOf(current) === -1) {
      check.push(current);
    } else i--;
  }
  // Loops through the players, checking to see if their spot in the user list matches with any of the random numbers.
  // If not then they will be a CAT, otherwise, a CATFISH.
  for (let j = 0; j < uids.length; j++) {
    if (check.indexOf(j) === -1) {
      await setDoc(doc(getPrivatePlayerCollection(lobby), uids[j]), {
        role: "CAT",
        prompt: "",
      });
    } else {
      await setDoc(doc(getPrivatePlayerCollection(lobby), uids[j]), {
        role: "CATFISH",
        prompt: "",
      });
    }
  }
}
