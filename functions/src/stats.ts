import { Lobby } from "./firestore-types/lobby";
import { db } from "./app";
import type { DocumentReference } from "firebase-admin/firestore";
import { userCollection } from "./firestore-collections";
import type { UserData } from "./firestore-types/users";

export function applyStats(lobbyDoc: DocumentReference<Lobby>) {
  return db.runTransaction(async (transaction) => {
    // get the lobby infomation
    const lobbySnapshot = await transaction.get(lobbyDoc);
    const { players, uids, winner } = lobbySnapshot.data() as Lobby;
    // update each players doc
    await Promise.all(
      players.map(async (player, index) => {
        // get the player's user doc
        const userDocRef = userCollection.doc(uids[index]);
        const userSnapshot = await transaction.get(userDocRef);
        const user = userSnapshot.data() as UserData;
        // increment played as role
        if (player.role == "CAT") {
          user.playedAsCat += 1;
        } else {
          user.playedAsCatfish += 1;
        }
        // increment wins
        if (winner == "CAT" && player.role == "CAT") {
          user.catWins += 1;
        }
        if (winner == "CATFISH" && player.role == "CATFISH") {
          user.catfishWins += 1;
        }
        // update their user doc
        transaction.update(userDocRef, { ...user });
      })
    );
  });
}
