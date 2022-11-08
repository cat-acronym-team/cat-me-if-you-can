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
    if (auth.uid !== lobbyData.uids[0]) {
      throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
    }

    // check game state
    if (lobbyData.state !== "END") {
      throw new functions.https.HttpsError("failed-precondition", "Wrong game state!");
    }
    await endGameProcess(lobbyData, lobbyDocRef, transaction);
  });
});

export function findWinner(lobbyDocRef: firestore.DocumentReference<Lobby>) {
  return db.runTransaction(async (transaction) => {
    const lobby = await transaction.get(lobbyDocRef);
    const lobbyData = lobby.data();

    if (lobbyData === undefined) {
      throw new Error("Lobby does not exist!");
    }
    const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);
    const { players, uids } = lobbyData;
    await Promise.all(
      lobbyData.uids.map(async (uid) => {
        const privatePlayerDocRef = privatePlayerCollection.doc(uid);
        const privatePlayerDoc = await transaction.get(privatePlayerDocRef);
        const privatePlayerData = privatePlayerDoc.data();

        if (!privatePlayerData) {
          throw new Error(`Private player not found for uid ${uid}`);
        }
        const playerId: string = uid;
        players[uids.indexOf(playerId)].role = privatePlayerData.role;
      })
    );

    let catfishCount = 0;
    for (let i = 0; i < uids.length; i++) {
      // check the alive players
      if (lobbyData.players[i].alive == true) {
        if (lobbyData.players[i].role == "CATFISH") {
          catfishCount++;
        }
      }
    }
    if (catfishCount == 0) {
      lobbyData.winner = "CAT";
    } else {
      lobbyData.winner = "CATFISH";
    }
    transaction.set(lobbyDocRef, lobbyData);
  });
}

export async function endGameProcess(
  lobbyData: Lobby,
  lobbyDocRef: firestore.DocumentReference<Lobby>,
  transaction: firestore.Transaction
) {
  // apply the stats
  let { players } = lobbyData;
  const { uids, winner } = lobbyData;

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

  // reset the lobby
  players = players.map(({ role, ...rest }) => {
    return { ...rest, alive: true };
  });

  // create a WriteBatch
  const batch = db.batch();
  const privatePlayerCollectionRef = getPrivatePlayerCollection(lobbyDocRef);

  // loop through each doc in the private player collection via uid and delete them one-by-one
  for (let i = 0; i < uids.length; i++) {
    const playerDoc = privatePlayerCollectionRef.doc(uids[i]);
    // delete each private player document with the WriteBatch
    batch.delete(playerDoc);
  }
  await batch.commit();

  transaction.update(lobbyDocRef, { state: "WAIT", players, winner: firestore.FieldValue.delete() });
}
