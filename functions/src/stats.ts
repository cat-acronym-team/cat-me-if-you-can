import { Lobby } from "./firestore-types/lobby";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { userCollection } from "./firestore-collections";
import type { UserData } from "./firestore-types/users";

export async function applyStats(lobbyData: Lobby, lobbyDoc: DocumentReference<Lobby>, transaction: Transaction) {
  const { players, uids, winner } = lobbyData;
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
  // TODO: Might want to reset lobby information below

  // Back to the waiting to start new game
  transaction.update(lobbyDoc, { state: "WAIT" });
}
