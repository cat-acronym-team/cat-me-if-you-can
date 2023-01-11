import { DocumentReference, FieldValue, Timestamp, Transaction } from "firebase-admin/firestore";
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
    if (auth.uid !== lobbyData.host) {
      throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
    }

    // check game state
    if (lobbyData.state !== "END") {
      throw new functions.https.HttpsError("failed-precondition", "Wrong game state!");
    }
    await endGameProcess(lobbyData, lobbyDocRef, transaction);
  });
});

/**
 * Applies the stats once the timer on the end screen ends
 */
export async function endGameProcess(
  lobbyData: Lobby,
  lobbyDocRef: DocumentReference<Lobby>,
  transaction: Transaction
) {
  // apply the stats
  const { players, winner } = lobbyData;

  // update each players doc
  await Promise.all(
    Object.entries(lobbyData.players).map(async ([uid, player]) => {
      const userDocRef = userCollection.doc(uid);
      const userDoc = await transaction.get(userDocRef);

      if (player.role == undefined) {
        functions.logger.error("This player's role doesn't exist!");
        return;
      } else if (player.role == "SPECTATOR") {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Workaround for https://github.com/googleapis/nodejs-firestore/issues/1808
    players: players satisfies Lobby["players"] as any,
    winner: FieldValue.delete(),
    votedOff: FieldValue.delete(),
    expiration: Timestamp.fromMillis(Timestamp.now().toMillis() + 3_600_000 * 3),
  });
}
