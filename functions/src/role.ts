import { GAME_STATE_DURATIONS, Lobby } from "./firestore-types/lobby";
import { getPrivatePlayerCollection } from "./firestore-collections";
import { firestore } from "firebase-admin";

export async function assignRole(lobbySnap: firestore.DocumentSnapshot<Lobby>, transaction: firestore.Transaction) {
  // Number of catfish below, will later be made to be changeable by users.
  const numCatFish = 1;
  const lobby = lobbySnap.ref;
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
