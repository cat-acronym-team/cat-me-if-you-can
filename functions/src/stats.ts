import { Lobby } from "./firestore-types/lobby";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { firestore } from "firebase-admin";
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
        playedAsCat?: firestore.FieldValue;
        playedAsCatfish?: firestore.FieldValue;
        catWins?: firestore.FieldValue;
        catfishWins?: firestore.FieldValue;
      } = {};

      // increment played as role
      if (player.role == "CAT") {
        newStats.playedAsCat = firestore.FieldValue.increment(1);
      } else {
        newStats.playedAsCatfish = firestore.FieldValue.increment(1);
      }

      // increment wins
      if (winner == "CAT" && player.role == "CAT") {
        newStats.catWins = firestore.FieldValue.increment(1);
      }
      if (winner == "CATFISH" && player.role == "CATFISH") {
        newStats.catfishWins = firestore.FieldValue.increment(1);
      }

      // update their user doc
      transaction.update(userDocRef, newStats);
    })
  );
  // TODO: Might want to reset lobby information below

  // Back to the waiting to start new game
  transaction.update(lobbyDoc, { state: "WAIT" });
}
