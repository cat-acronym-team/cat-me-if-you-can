import { firestore } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { db } from "./app";
import { getPrivatePlayerCollection, lobbyCollection } from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby, PrivatePlayer } from "./firestore-types/lobby";

// this function will likely be obsolete once timers are introduced
export const lobbyReturn = functions.https.onCall(async (data: unknown, context): Promise<void> => {
  if (context.auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "Not Signed In");
  }

  // validate code
  if (!isLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lobby code!");
  }

  // get lobby doc
  const lobby = await lobbyCollection.doc(data.code).get();
  if (lobby.exists === false) {
    throw new functions.https.HttpsError("not-found", "Lobby doesn't exist!");
  }

  const { uids, state } = lobby.data() as Lobby;
  // check if host
  if (context.auth.uid !== uids[0]) {
    throw new functions.https.HttpsError("permission-denied", "Not the host of the game!");
  }

  // check game state
  if (state !== "END") {
    throw new functions.https.HttpsError("invalid-argument", "Wrong game state!");
  }
  await resetLobby(lobby.ref);
});

// export const onWin = functions.firestore.document(".lobbies/{code}").onUpdate((change, context) => {
//   const lobbyDocRef = change.after.ref as firestore.DocumentReference<Lobby>;
//   const lobby = change.after.data() as Lobby;
//   const oldLobby = change.before.data() as Lobby;

//   if (lobby.state == "END" && oldLobby.state != "END") {
//     findWinner(lobbyDocRef);
//   }

//   if (lobby.state == "WAIT" && oldLobby.state == "END") {
//     makeAlive(lobbyDocRef);
//     deletePrivatePlayers(lobbyDocRef, getPrivatePlayerCollection(lobbyDocRef));
//   }
// });

export function findWinner(lobbyDocRef: firestore.DocumentReference<Lobby>) {
  return db.runTransaction(async (transaction) => {
    const lobby = await transaction.get(lobbyDocRef);
    const lobbyData = lobby.data();
    if (lobby === undefined) {
      throw new Error("Lobby does not exist!");
    }
    if (lobbyData === undefined) {
      throw new Error("Lobby does not exist!");
    }
    const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);
    const { players, uids } = lobby.data() as Lobby;

    for (let i = 0; i < players.length; i++) {
      const privatePlayerDocRef = privatePlayerCollection.doc(uids[i]);
      const privatePlayerDoc = await transaction.get(privatePlayerDocRef);
      const privatePlayerData = privatePlayerDoc.data();

      if (!privatePlayerData) {
        throw new Error(`Private player not found for uid ${uids[i]}`);
      }
      lobbyData.players[i].role = privatePlayerData.role;
    }

    let catfishCount = 0;
    let catCount = 0;
    for (let i = 0; i < uids.length; i++) {
      // check the alive players

      if (lobbyData.players[i].alive == true) {
        if (lobbyData.players[i].role == "CATFISH") {
          catfishCount++;
        } else {
          catCount++;
        }
      }
    }
    console.log(lobbyData.winner);
    if (catfishCount == 0) {
      lobbyData.winner = "CAT";
    } else {
      if (catCount <= catfishCount) {
        lobbyData.winner = "CATFISH";
      }
    }
    console.log(lobbyData.winner);

    transaction.set(lobbyDocRef, lobbyData);
  });
}

// when returning to the lobby, make every player alive again
export function resetLobby(lobbyDocRef: firestore.DocumentReference<Lobby>) {
  return db.runTransaction(async (transaction) => {
    const lobby = await transaction.get(lobbyDocRef);
    const lobbyData = lobby.data();
    const privatePlayerSnapshot = await transaction.get(getPrivatePlayerCollection(lobbyDocRef));
    if (lobby === undefined) {
      throw new Error("Lobby does not exist!");
    }

    if (lobbyData === undefined) {
      throw new Error("Lobby does not exist!");
    }

    // loop through each player and set their alive status to true
    let { players } = lobbyData;
    players = players.map(({ role, ...rest }) => {
      return { ...rest, alive: true };
    });

    privatePlayerSnapshot.docs.map((privatePlayerDoc) => {
      privatePlayerDoc.ref.delete();
    });

    transaction.update(lobbyDocRef, { state: "WAIT", players, winner: FieldValue.delete() });
  });
}

export async function deletePrivatePlayers(
  lobbyDocRef: firestore.DocumentReference<Lobby>,
  privatePlayerCollectionRef: firestore.CollectionReference<PrivatePlayer>
) {
  const lobby = await lobbyDocRef.get();
  if (lobby.exists === false) {
    throw new Error("Lobby does not exist!");
  }

  // loop through each doc in the private player collection via uid and delete them one-by-one
  const { uids } = lobby.data() as Lobby;
  for (let i = 0; i <= uids.length; i++) {
    const playerDoc = privatePlayerCollectionRef.doc(uids[i]);
    await playerDoc.delete();
  }
  return;
}
