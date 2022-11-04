import { Lobby } from "./firestore-types/lobby";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { firestore } from "firebase-admin";
import { userCollection } from "./firestore-collections";
import * as functions from "firebase-functions";

export function applyStats(lobbyData: Lobby, lobbyDoc: DocumentReference<Lobby>, transaction: Transaction) {
  const { players, uids, winner } = lobbyData;
  // update each players doc
  // get the player's user doc
  for (let i = 0; i < players.length; i++) {
    const userDocRef = userCollection.doc(uids[i]);

    if (players[i].role == undefined) {
      functions.logger.error("This player's role doesn't exist!");
      continue;
    }

    const newStats: {
      playedAsCat?: firestore.FieldValue;
      playedAsCatfish?: firestore.FieldValue;
      catWins?: firestore.FieldValue;
      catfishWins?: firestore.FieldValue;
    } = {};

    // increment played as role
    if (players[i].role == "CAT") {
      newStats.playedAsCat = firestore.FieldValue.increment(1);
    } else {
      newStats.playedAsCatfish = firestore.FieldValue.increment(1);
    }

    // increment wins
    if (winner == "CAT" && players[i].role == "CAT") {
      newStats.catWins = firestore.FieldValue.increment(1);
    }
    if (winner == "CATFISH" && players[i].role == "CATFISH") {
      newStats.catfishWins = firestore.FieldValue.increment(1);
    }

    // update their user doc
    transaction.update(userDocRef, newStats);
  }

  // TODO: Might want to reset lobby information below

  // Back to the waiting to start new game
  transaction.update(lobbyDoc, { state: "WAIT" });
}
