import * as functions from "firebase-functions";
import { lobbyCollection, userCollection } from "./firestore-collections";
import { isLobbyRequest, LobbyRequest } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";

export const startGame = functions.https.onCall(async (data: unknown, context) => {
  // no auth then you shouldn't be here
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
  // check if the request is coming from the host of the game
  const { uids } = lobby.data() as Lobby;
  if (context.auth.uid !== uids[0]) {
    return { error: "Not allowed to start game!" };
  }

  return lobbyCollection.doc(data.code).update({ state: "PROMPT" });
});

export const joinLobby = functions.https.onCall(async (data: unknown, context) => {
  // no auth then you shouldn't be here
  if (context.auth === undefined) {
    return { error: "Not Signed In" };
  }
  // validate code
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }
  // lobby doc
  const lobby = lobbyCollection.doc(data.code);
  const lobbyInfo = await lobby.get();
  // extra validation to make sure it exist
  if (lobbyInfo.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }
  // user doc
  const user = await userCollection.doc(context.auth.uid).get();
  // make sure this user has a doc with a displayName and avatar
  if (user.exists === false) {
    return { error: "You need to have a displayName and avatar!" };
  }
  // user data
  const userInfo = user.data() as UserData;

  // get lobby data
  const { players, uids } = lobbyInfo.data() as Lobby;
  if (uids.includes(context.auth.uid)) {
    return { error: "You are already in the lobby!" };
  }
  // add player
  return lobby.update({
    players: [...players, { ...userInfo, alive: true }],
    uids: [...uids, context.auth.uid],
  });
});
