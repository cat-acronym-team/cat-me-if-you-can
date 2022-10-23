import { DocumentReference } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { db } from "./app";
import { getChatRoomCollection, getChatRoomMessagesCollection, getLobbyChatCollection } from "./firestore-collections";

import { Lobby } from "./firestore-types/lobby";

export const testTask = functions.tasks.taskQueue().onDispatch((data, context) => {
  const promise = new Promise((resolve) => {
    console.log("Hello World");
    functions.logger.info("IN HERE BROTHER");
  }) as Promise<void>;

  return promise;
});
export function deleteChatRooms(lobbyDoc: DocumentReference<Lobby>) {
  db.runTransaction(async (transaction) => {
    const lobbyDocRef = (await transaction.get(lobbyDoc)).ref;
    const chatRooms = await getChatRoomCollection(lobbyDoc).listDocuments();

    // get prompts answer then delete chatrooms
    const lobbyChatCollection = getLobbyChatCollection(lobbyDocRef);
    chatRooms.forEach(async (room) => {
      // order the messages from the chatroom
      const orderMessages = await getChatRoomMessagesCollection(room).orderBy("timestamp", "asc").get();
      // get the first two messages which are the prompt answers and add to lobby chat
      lobbyChatCollection.add(orderMessages.docs[0].data());
      lobbyChatCollection.add(orderMessages.docs[1].data());
      // delete messages
      orderMessages.docs.forEach((m) => m.ref.delete());
      // then delete room
      room.delete();
    });
  });
}
// export const deleteChatRooms = functions.https.onCall(async (data: unknown, context) => {
//   if (!context.auth) {
//     return { error: "Not Signed In" };
//   }
//   if (!isLobbyRequest(data)) {
//     return { error: "Invalid lobby code!" };
//   }

//   // get lobby doc, and check if the lobby exist
//   const lobby = lobbyCollection.doc(data.code);
//   const lobbyData = await lobby.get();
//   if (!lobbyData.exists) {
//     return { error: "Lobby doesn't exist!" };
//   }
//   // only allow the request coming from host or co-host to delete the chatrooms
//   const { uids } = lobbyData.data() as Lobby;
//   if (![uids[0], uids[1]].includes(context.auth.uid)) {
//     return { error: "Not allowed to delete chatrooms" };
//   }
//   // delete all chatrooms
//   const chatRooms = await getChatRoomCollection(lobby).listDocuments();
//   // possibility that the host and co-host are deleting at the same time
//   //  if one already deleted the chatrooms no need to try to delete them again
//   if (chatRooms.length === 0) {
//     return { error: "There's nothing to delete!" };
//   }

//   // Collect prompts answers from chatrooms
//   const lobbyChatMessages = getLobbyChatCollection(lobby);
//   for (const room of chatRooms) {
//     // delete all of the messages within collection
//     const messageCollection = getChatRoomMessagesCollection(room);
//     const queryMessages = await messageCollection.orderBy("timestamp", "asc").get();

//     // Add message to lobby messages
//     // batch.create(lobbyChatMessages.add(queryMessages.docs[0]));
//     // batch.create(lobbyChatMessages);

//     // delete chatroom
//     await room.delete();
//   }
//   // change game state
//   return lobby.set({ state: "VOTE" }, { merge: true });
// });
