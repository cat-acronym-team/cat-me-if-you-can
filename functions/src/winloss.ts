import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { db } from "./app";
import { getPrivatePlayerCollection, lobbyCollection, userCollection } from "./firestore-collections";
import { isLobbyRequest } from "./firebase-functions-types";
import { Lobby } from "./firestore-types/lobby";

// this function will likely be obsolete once timers are introduced
export const lobbyReturn = functions.https.onCall(async (data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }

  // validate code
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }

  // get lobby doc
  const lobbyDocRef = lobbyCollection.doc(data.code);

  await db.runTransaction(async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyDocRef);
    if (lobbyDoc.exists === false) {
      throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
    }

    const lobbyData = lobbyDoc.data() as Lobby;
    // check if host
    if (auth.uid === lobbyData.host) {
      throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
    }

    // check game state
    if (lobbyData.state !== "END") {
      throw new functions.https.HttpsError("failed-precondition", "Wrong game state!");
    }
    await endGameProcess(lobbyData, lobbyDocRef, transaction);
  });
});

export async function endGameProcess(
  lobbyData: Lobby,
  lobbyDocRef: firestore.DocumentReference<Lobby>,
  transaction: firestore.Transaction
) {
  // apply the stats
  const { players, winner } = lobbyData;

  // update each players doc
  await Promise.all(
    Object.keys(lobbyData.players).map(async (uid) => {
      const userDocRef = userCollection.doc(uid);
      const userDoc = await transaction.get(userDocRef);

      if (lobbyData.players[uid].role == undefined) {
        functions.logger.error("This player's role doesn't exist!");
        return;
      } else if (players[uid].role == "SPECTATOR") {
        return;
      }

      const newStats: {
        playedAsCat?: firestore.FieldValue;
        playedAsCatfish?: firestore.FieldValue;
        catWins?: firestore.FieldValue;
        catfishWins?: firestore.FieldValue;
      } = {};

      // increment played as role
      if (lobbyData.players[uid].role == "CAT") {
        newStats.playedAsCat = firestore.FieldValue.increment(1);
      } else {
        newStats.playedAsCatfish = firestore.FieldValue.increment(1);
      }

      // increment wins
      if (winner == "CAT" && lobbyData.players[uid].role == "CAT") {
        newStats.catWins = firestore.FieldValue.increment(1);
      }
      if (winner == "CATFISH" && lobbyData.players[uid].role == "CATFISH") {
        newStats.catfishWins = firestore.FieldValue.increment(1);
      }
      // update their user doc
      if (userDoc.exists) {
        return transaction.update(userDocRef, newStats);
      }
      return;
    })
  );

  // reset the lobby
  for (const uid in players) {
    players[uid].alive = true;
    players[uid].votes = 0;
    delete players[uid].role;
  }

  // create a WriteBatch
  const batch = db.batch();
  const privatePlayerCollectionRef = getPrivatePlayerCollection(lobbyDocRef);

  // loop through each doc in the private player collection via uid and delete them one-by-one
  for (const uid in lobbyData.players) {
    const playerDoc = privatePlayerCollectionRef.doc(uid);
    // delete each private player document with the WriteBatch
    batch.delete(playerDoc);
  }
  await batch.commit();

  transaction.update(lobbyDocRef, {
    state: "WAIT",
    players,
    winner: firestore.FieldValue.delete(),
    votedOff: firestore.FieldValue.delete(),
    expiration: firestore.Timestamp.fromMillis(firestore.Timestamp.now().toMillis() + 3_600_000 * 3),
  });
}
