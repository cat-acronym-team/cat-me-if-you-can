import { DocumentReference } from "firebase-admin/firestore";
import { db } from "./app";
import { getChatRoomCollection, getChatRoomMessagesCollection, getLobbyChatCollection } from "./firestore-collections";
import { Lobby } from "./firestore-types/lobby";

export function deleteChatRooms(lobbyDoc: DocumentReference<Lobby>) {
  db.runTransaction(async (transaction) => {
    const lobbyDocRef = (await transaction.get(lobbyDoc)).ref;
    const chatRooms = await getChatRoomCollection(lobbyDocRef).listDocuments();

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
