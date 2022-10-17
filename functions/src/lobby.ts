import { firestore } from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import {
  getChatRoomCollection,
  getChatRoomMessagesCollection,
  lobbyCollection,
  userCollection,
} from "./firestore-collections";
import { isLobbyRequest } from "./firestore-functions-types";
import { Lobby } from "./firestore-types/lobby";
import { UserData } from "./firestore-types/users";
import { generatePairs } from "./util";

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

// Temporary Function
// Will run everytime lobby updates
export const onLobbyUpdate = functions.firestore.document("/lobbies/{code}").onUpdate((change, context) => {
  const lobbyDocRef = change.after.ref as firestore.DocumentReference<Lobby>;
  const lobby = change.after.data() as Lobby;
  const oldLobby = change.before.data() as Lobby;

  if (lobby.state == "CHAT" && oldLobby.state != "CHAT") {
    // await startPrompt(lobbyDocRef);
    createChatRooms(lobbyDocRef, lobby);
  }
});

// Code inside this function will be under nates code for getting prompt answers
function createChatRooms(lobbyDoc: firestore.DocumentReference<Lobby>, lobbyData: Lobby) {
  const pairs = generatePairs(lobbyData);
  // create a chatroom for each pair
  pairs.forEach(async ({ one, two }) => {
    const room = await getChatRoomCollection(lobbyDoc).add({ pair: [one, two], viewers: [] });
    // get answers of the pair
    // const oneAnswer = promptAnswers.get(one);
    // const twoAnswer = promptAnswers.get(two);

    const oneAnswer = "Pair One Answer";
    const twoAnswer = "Pair Two Answer";
    // place answers in chatMessages inside their room
    await getChatRoomMessagesCollection(room).add({ sender: one, text: oneAnswer, timestamp: Timestamp.now() });
    await getChatRoomMessagesCollection(room).add({ sender: two, text: twoAnswer, timestamp: Timestamp.now() });
  });
}
export const deleteChatRooms = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return { error: "Not Signed In" };
  }
  if (!isLobbyRequest(data)) {
    return { error: "Invalid lobby code!" };
  }

  // get lobby doc, and check if the lobby exist
  const lobby = lobbyCollection.doc(data.code);
  const lobbyData = await lobby.get();
  if (!lobbyData.exists) {
    return { error: "Lobby doesn't exist!" };
  }
  // delete all chatrooms
  const chatRooms = await getChatRoomCollection(lobby).listDocuments();
  for (const room of chatRooms) {
    await room.delete();
  }
  // change game state
  return lobby.set({ state: "VOTE" }, { merge: true });
});
