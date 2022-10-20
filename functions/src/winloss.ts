import { firestore } from "firebase-admin";
import * as functions from "../node_modules/firebase-functions";
import { db } from "./app";
import { getPrivatePlayerCollection, lobbyCollection } from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby, PrivatePlayer } from "./firestore-types/lobby";

export const lobbyReturn = functions.https.onCall(async (data: unknown) => {
  // validate code
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }
  // get lobby doc
  const lobby = await lobbyCollection.doc(data.code).get();
  if (lobby.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }
  return lobbyCollection.doc(data.code).update({ state: "WAIT" });
});

function getLobby(code: string) {
  const lobbyDocRef = lobbyCollection.doc(code);
  return lobbyDocRef;
}

function getPrivatePlayer(lobbyDocRef: firestore.DocumentReference<Lobby>, id: string) {
  let privatePlayerData: PrivatePlayer | undefined;
  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

  db.runTransaction(async (transaction) => {
    const privatePlayerDocRef = privatePlayerCollection.doc(id);
    const privatePlayerDoc = await transaction.get(privatePlayerDocRef);
    privatePlayerData = privatePlayerDoc.data();
  });
  return privatePlayerData;
}

export async function getLobbyRoles(lobby: Lobby, lobbyCode: string) {
  let aliveCatCount = 0;
  const catfishDisplayname: string[] = [];
  for (let i = 0; i < lobby.uids.length; i++) {
    if (lobby.players[i].alive == true) {
      // count the number of remaining players who are alive
      const lobbyRoles = await getPrivatePlayer(getLobby(lobbyCode), lobby.uids[i]);
      if (lobbyRoles !== undefined) {
        if (lobbyRoles.role == "CAT") {
          aliveCatCount++;
          // within the alive players, count the number that are cats
        } else {
          let temp = "";
          temp = lobby.players[i].displayName;
          catfishDisplayname.push(temp);
        }
      }
    }
  }
  // returns both the number of cats that are alive and the catfish display name array
  return {
    aliveCatCount: aliveCatCount,
    catfishDisplayname: catfishDisplayname,
  };
}
