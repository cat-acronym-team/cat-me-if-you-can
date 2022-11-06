import { Lobby } from "./firestore-types/lobby";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { firestore } from "firebase-admin";
import { userCollection } from "./firestore-collections";
import * as functions from "firebase-functions";

export async function applyStats(lobbyData: Lobby, lobbyDoc: DocumentReference<Lobby>, transaction: Transaction) {
  const { players, uids, winner } = lobbyData;

  // update each players doc
  await Promise.all(
    uids.map(async (uid, index) => {
      const userDocRef = userCollection.doc(uid);
      const userDoc = await transaction.get(userDocRef);

      if (players[index].role == undefined) {
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
      if (players[index].role == "CAT") {
        newStats.playedAsCat = firestore.FieldValue.increment(1);
      } else {
        newStats.playedAsCatfish = firestore.FieldValue.increment(1);
      }

      // increment wins
      if (winner == "CAT" && players[index].role == "CAT") {
        newStats.catWins = firestore.FieldValue.increment(1);
      }
      if (winner == "CATFISH" && players[index].role == "CATFISH") {
        newStats.catfishWins = firestore.FieldValue.increment(1);
      }
      // update their user doc
      if (userDoc.exists) {
        return transaction.update(userDocRef, newStats);
      }
      return;
    })
  );
  // TODO: Might want to reset lobby information below

  // Back to the waiting to start new game
  transaction.update(lobbyDoc, { state: "WAIT" });
}
