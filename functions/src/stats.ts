import { Lobby } from "./firestore-types/lobby";
import { DocumentReference, FieldValue, Transaction } from "firebase-admin/firestore";
import { userCollection } from "./firestore-collections";
import * as functions from "firebase-functions";

export async function applyStats(lobbyData: Lobby, lobbyDoc: DocumentReference<Lobby>, transaction: Transaction) {
  const { players, uids, winner } = lobbyData;
  // update each players doc
  await Promise.all(
    players.map(async (player, index) => {
      // get the player's user doc
      const userDocRef = userCollection.doc(uids[index]);
      const userSnapshot = await transaction.get(userDocRef);

      if (!userSnapshot.exists) {
        functions.logger.error("A user doesn't exist!");
        return;
      }

      if (player.role == undefined) {
        functions.logger.error("This player's role doesn't exist!");
        return;
      }

      const newStats: {
        playedAsCat?: FieldValue;
        playedAsCatfish?: FieldValue;
        catWins?: FieldValue;
        catfishWins?: FieldValue;
      } = {};

      // increment played as role
      if (player.role == "CAT") {
        newStats.playedAsCat = FieldValue.increment(1);
      } else {
        newStats.playedAsCatfish = FieldValue.increment(1);
      }

      // increment wins
      if (winner == "CAT" && player.role == "CAT") {
        newStats.catWins = FieldValue.increment(1);
      }
      if (winner == "CATFISH" && player.role == "CATFISH") {
        newStats.catfishWins = FieldValue.increment(1);
      }

      // update their user doc
      transaction.update(userDocRef, newStats);
    })
  );
  // TODO: Might want to reset lobby information below

  // Back to the waiting to start new game
  transaction.update(lobbyDoc, { state: "WAIT" });
}
