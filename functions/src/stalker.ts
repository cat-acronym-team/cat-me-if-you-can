import * as functions from "firebase-functions";
import { db } from "./app";
import { isStalkChatroomRequest } from "./firebase-functions-types";
import { getChatRoomCollection, lobbyCollection } from "./firestore-collections";

export const stalkChatroom = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isStalkChatroomRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of StalkChatroomRequest type");
  }

  const lobbyDocRef = lobbyCollection.doc(data.code);
  return db.runTransaction(async (transaction) => {
    const chatRooms = getChatRoomCollection(lobbyDocRef);
    const chatRoomsRef = chatRooms.doc(data.chatId);
    const chatRoomsSnapshot = await transaction.get(chatRooms.where("viewers", "array-contains", auth.uid));
    if (!chatRoomsSnapshot.empty) {
      throw new functions.https.HttpsError("already-exists", "User already stalking a chat. Try refrshing the page");
    }
    const chatRoom = await transaction.get(chatRoomsRef);
    const chatRoomData = chatRoom.data();
    if (chatRoomData === undefined) {
      throw new functions.https.HttpsError("not-found", "Chatroom not found");
    }
    chatRoomData.viewers.push(auth.uid);
    transaction.update(chatRoomsRef, chatRoomData);
  });
});
