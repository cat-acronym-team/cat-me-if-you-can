import * as functions from "firebase-functions";
import { lobbyCollection } from "./firestore-collections";
import { ChangeState, Lobby, Player } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";

export const changeState = functions.https.onCall((data: ChangeState, context) => {
  // no auth then you shouldn't be here
  if (context.auth === undefined) {
    return { error: "Not Signed In" };
  }
  // return
  return lobbyCollection.doc(data.code).update({ state: data.state });
});

export const addPlayer = functions.https.onCall(async (data: UserData & { uid: string; code: string }, context) => {
  // no auth then you shouldn't be here
  if (context.auth === undefined) {
    return { error: "Not Signed In" };
  }
  // lobby doc
  const lobby = lobbyCollection.doc(data.code);
  const lobbyInfo = await lobby.get();
  // extra validation to make sure it exist
  if (lobbyInfo.exists === false) {
    return { error: "Lobby doesn't exist!" };
  }
  // get lobby data
  const { players, uids } = lobbyInfo.data() as Lobby;
  if (uids.includes(data.uid)) {
    return { error: "You are already in the lobby!" };
  }
  // add player
  return lobby.update({
    players: [...players, { displayName: data.displayName, avatar: data.avatar as Player["avatar"], alive: true }],
    uids: [...uids, data.uid],
  });
});
