import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { getPrivatePlayerCollection, lobbyCollection } from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";

export const lobbyReturn = functions.https.onCall(async (data: unknown, context) => {
  if (context.auth === undefined) {
    return { error: "Not Signed In" };
  }

  // validate code
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }
  // get lobby doc
  const lobby = await lobbyCollection.doc(data.code).get();
  if (lobby.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }

  const { uids, players } = lobby.data() as Lobby;
  if (context.auth.uid !== uids[0]) {
    return { error: "Not allowed to return to lobby!" };
  }

  // bring everyone back alive
  // TODO: Fix this and test
  for(let i = 0; i < players.length; i++) {
    if(players[i].alive == false) {
      players[i].alive == true;
    }
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
    // count the number of remaining players who are alive
    const lobbyRoles = await getPrivatePlayer(lobbyDoc, uids[i]);
    // check the alive players
    if (players[i].alive == true) {
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
      // check any catfish who are not alive and add their display name to the list
    } else {
      if (lobbyRoles !== undefined) {
        if (lobbyRoles.role == "CATFISH") {
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
