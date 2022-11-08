import type { Lobby } from "./firestore-types/lobby";
import { getPrivatePlayerCollection } from "./firestore-collections";
import { db } from "./app";
import { firestore } from "firebase-admin";

export function assignRole(lobby: firestore.DocumentReference<Lobby>) {
  // Number of catfish below, will later be made to be changable by users.
  const numCatFish = 1;

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

    // The uids of the players that will be catfish
    const catfishUids = new Set<string>();

    // Adds catfish to catfishUids until there are numCatFish catfish.
    while (catfishUids.size < numCatFish) {
      catfishUids.add(uids[Math.floor(Math.random() * uids.length)]);
    }
    const privatePlayerCollection = getPrivatePlayerCollection(lobby);

    await Promise.all(
      lobbyData.uids.map((uid) => {
        const privatePlayerDocRef = privatePlayerCollection.doc(uid);

        // get the list of uids, check the index and compare with catfishCheck. If equal, set to catfish
        if (catfishUids.has(uid)) {
          transaction.create(privatePlayerDocRef, { role: "CATFISH" });
        } else {
          transaction.create(privatePlayerDocRef, { role: "CAT" });
        }
      })
    );
    // TODO: Change game state to "PROMPT" with timer
  });
}
