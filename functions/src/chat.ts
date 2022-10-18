import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { getChatRoomCollection, getChatRoomMessagesCollection, lobbyCollection } from "./firestore-collections";
import { isChatRequest, isLobbyRequest } from "./firestore-functions-types";
import { chatMessageValidator, ChatRoom } from "./firestore-types/lobby";

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
  // delete all chatrooms
  const chatRooms = await getChatRoomCollection(lobby).listDocuments();
  for (const room of chatRooms) {
    await room.delete();
  }
  // change game state
  return lobby.set({ state: "VOTE" }, { merge: true });
});
