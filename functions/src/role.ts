import type { Lobby } from "./firestore-types/lobby";
import { getPrivatePlayerCollection } from "./firestore-collections";
import { db } from "./app";
import { firestore } from "firebase-admin";

export function assignRole(lobby: firestore.DocumentReference<Lobby>) {
  // Number of catfish below, will later be made to be changable by users.
  const numCatFish = 1;
  const catfishCheck: number[] = [];
  let random = 0;

  return db.runTransaction(async (transaction) => {
    // const validLobby = await getDoc(lobby);
    const validLobby = await transaction.get(lobby);
    const lobbyData = validLobby.data();

    // Checks to see if lobby is indeed valid.
    if (lobbyData === undefined) {
      throw new Error("Invalid Lobby");
    }

    // Gets uids from lobby.
    const { uids } = lobbyData;

    // For loop that will create a random number between 0 and the amount of players.
    // This random number will represent the index of the uid that will be the catfish
    // Then adds it to 'catfishCheck', then loops back through again if needed, checking to see if the new random number was already selected and looping again if so.
    for (let i = 0; i < numCatFish; i++) {
      random = Math.floor(Math.random() * (uids.length - 1));
      if (catfishCheck.indexOf(random) === -1) {
        catfishCheck.push(random);
      } else i--;
    }
    const privatePlayerCollection = getPrivatePlayerCollection(lobby);

    await Promise.all(
      lobbyData.uids.map((uid) => {
        const privatePlayerDocRef = privatePlayerCollection.doc(uid);

        // get the list of uids, check the index and compare with catfishCheck. If equal, set to catfish
        if (catfishCheck.includes(uids.indexOf(uid))) {
          transaction.set(privatePlayerDocRef, { role: "CATFISH" }, { merge: true });
        } else {
          transaction.set(privatePlayerDocRef, { role: "CAT" }, { merge: true });
        }
      })
    );
    // TODO: Change game state to "PROMPT" with timer
  });
}
