import { GAME_STATE_DURATIONS, Lobby } from "./firestore-types/lobby";
import { getPrivatePlayerCollection } from "./firestore-collections";
import { firestore } from "firebase-admin";

export function assignRole(lobbySnap: firestore.DocumentSnapshot<Lobby>, transaction: firestore.Transaction) {
  const lobbyData = lobbySnap.data();
  // lobby reference used for getPrivatePlayerCollection and transaction
  const lobby = lobbySnap.ref;

  // Checks to see if lobby is indeed valid.
  if (lobbyData === undefined) {
    throw new Error("Invalid Lobby");
  }

  // Gets uids from lobby.
  const { uids } = lobbyData;

  // The uids of the players that will be catfish
  const catfishUids = new Set<string>();

  // Adds catfish to catfishUids until there are numCatFish catfish.
  while (catfishUids.size < lobbyData?.catfishAmount) {
    catfishUids.add(uids[Math.floor(Math.random() * uids.length)]);
  }
  const privatePlayerCollection = getPrivatePlayerCollection(lobby);

  for (const uid of uids) {
    const privatePlayerDocRef = privatePlayerCollection.doc(uid);

    // check set to catfish if it is inside catfishUids
    if (catfishUids.has(uid)) {
      transaction.create(privatePlayerDocRef, { role: "CATFISH", stalker: false });
    } else {
      transaction.create(privatePlayerDocRef, { role: "CAT", stalker: false });
    }
  }

  // expiration
  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS.ROLE * 1000
  );
  transaction.update(lobby, { state: "ROLE", expiration });
}
