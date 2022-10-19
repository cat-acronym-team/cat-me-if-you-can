import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { getChatRoomCollection, getChatRoomMessagesCollection, lobbyCollection } from "./firestore-collections";
import { isChatRequest, isLobbyRequest } from "./firestore-functions-types";
import { chatMessageValidator, ChatRoom, Lobby } from "./firestore-types/lobby";

export const addChatMessage = functions.https.onCall(async (data: unknown, context) => {
  if (!context.auth) {
    return { error: "Not Signed In" };
  }
  if (!isChatRequest(data)) {
    return { error: "Invalid Chat Request!" };
  }

  // get room doc
  const lobbyDoc = lobbyCollection.doc(data.code);
  const roomDoc = getChatRoomCollection(lobbyDoc).doc(data.roomId);
  const room = await roomDoc.get();
  // check if the room exist
  if (!room.exists) {
    return { error: "Chatroom doesn't exist!" };
  }
  // check if the sender is allowed to add messages
  const { pair } = room.data() as ChatRoom;
  if (!pair.includes(context.auth.uid)) {
    return { error: "You can't add a message" };
  }
  // validate the messgae
  const isValid = chatMessageValidator(data.message);
  if (!isValid.valid) {
    return { error: isValid.reason };
  }
  // create message doc
  return getChatRoomMessagesCollection(roomDoc).add({
    sender: context.auth.uid,
    text: data.message,
    timestamp: firestore.Timestamp.now(),
  });
});

export const deleteChatRooms = functions.https.onCall(async (data: unknown, context) => {
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
  // only allow the request coming from host or co-host to delete the chatrooms
  const { uids } = lobbyData.data() as Lobby;
  if (![uids[0], uids[1]].includes(context.auth.uid)) {
    return { error: "Not allowed to delete chatrooms" };
  }
  // delete all chatrooms
  const chatRooms = await getChatRoomCollection(lobby).listDocuments();
  // possibility that the host and co-host are deleting at the same time
  //  if one already deleted the chatrooms no need to try to delete them again
  if (chatRooms.length === 0) {
    return { error: "There's nothing to delete!" };
  }
  for (const room of chatRooms) {
    // delete all of the messages within collection
    const messageCollection = getChatRoomMessagesCollection(room);
    (await messageCollection.listDocuments()).forEach((m) => m.delete());
    // delete chatroom
    await room.delete();
  }
  // change game state
  return lobby.set({ state: "VOTE" }, { merge: true });
});
