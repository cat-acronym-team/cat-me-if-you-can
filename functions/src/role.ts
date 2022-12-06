import { GAME_STATE_DURATIONS_DEFAULT, Lobby } from "./firestore-types/lobby";
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
  const { players } = lobbyData;

  // The uids of the players that will be catfish
  const catfishUids = new Set<string>();

  // Adds catfish to catfishUids until there are numCatFish catfish.
  const uidArray = Object.keys(players);

  while (catfishUids.size < lobbyData.lobbySettings.catfishAmount) {
    catfishUids.add(uidArray[Math.floor(Math.random() * uidArray.length)]);
  }
  const privatePlayerCollection = getPrivatePlayerCollection(lobby);

  for (const uid in players) {
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
    firestore.Timestamp.now().toMillis() + GAME_STATE_DURATIONS_DEFAULT.ROLE * 1000
  );
  transaction.update(lobby, { state: "ROLE", expiration });
}
