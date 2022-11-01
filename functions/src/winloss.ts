import * as functions from "firebase-functions";
import { lobbyCollection } from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";

// this function will likely be obsolete once timers are introduced
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

  const { uids } = lobby.data() as Lobby;
  if (context.auth.uid !== uids[0]) {
    return { error: "Not allowed to return to lobby!" };
  }
  return lobbyCollection.doc(data.code).update({ state: "WAIT" });
});
