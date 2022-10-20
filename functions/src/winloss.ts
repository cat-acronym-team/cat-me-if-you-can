import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { getPrivatePlayerCollection, lobbyCollection } from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";

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

async function getPrivatePlayer(lobbyDocRef: firestore.DocumentReference<Lobby>, id: string) {
  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

  const privatePlayerDoc = privatePlayerCollection.doc(id);
  const privatePlayer = await privatePlayerDoc.get();
  return privatePlayer.data();
}

export const getLobbyRole = functions.https.onCall(async (data: unknown, context) => {
  if (context.auth == undefined) {
    return { error: "You are not signed in!" };
  }

  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }

  const lobbyDoc = lobbyCollection.doc(data.code);
  const lobby = await lobbyDoc.get();
  if (lobby.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }

  const { players, uids } = lobby.data() as Lobby;

  let aliveCatCount = 0;
  const catfishDisplayname: string[] = [];
  for (let i = 0; i < uids.length; i++) {
    if (players[i].alive == true) {
      // count the number of remaining players who are alive
      const lobbyRoles = await getPrivatePlayer(lobbyDoc, uids[i]);
      if (lobbyRoles !== undefined) {
        if (lobbyRoles.role == "CAT") {
          aliveCatCount++;
          // within the alive players, count the number that are cats
        } else {
          let temp = "";
          temp = players[i].displayName;
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
});
