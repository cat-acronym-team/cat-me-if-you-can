import { firestore } from "firebase-admin";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { db } from "./app";
import {
  getChatRoomCollection,
  getChatRoomMessagesCollection,
  getPrivatePlayerCollection,
  getLobbyChatCollection,
} from "./firestore-collections";
import { Lobby } from "./firestore-types/lobby";

export async function deleteLobbyChatMessages(lobbyDoc: DocumentReference<Lobby>) {
  const messages = await getLobbyChatCollection(lobbyDoc).get();

  const batch = db.batch();
  for (const messageDoc of messages.docs) {
    batch.delete(messageDoc.ref);
  }
  await batch.commit();
}

export async function deleteChatRooms(lobbyData: Lobby, lobbyDoc: DocumentReference<Lobby>, transaction: Transaction) {
  const { players } = lobbyData;
  const chatRoomsSnapshot = await transaction.get(getChatRoomCollection(lobbyDoc));
  const chatRooms = chatRoomsSnapshot.docs.map((room) => room.ref);

  const chatMessages = await Promise.all(
    chatRooms.map(async (room) => {
      const chatMessagesSnapshot = await transaction.get(getChatRoomMessagesCollection(room));
      return chatMessagesSnapshot.docs;
    })
  );

  // delete stalker
  const stalkers = await transaction.get(getPrivatePlayerCollection(lobbyDoc).where("stalker", "==", true));

  for (const messageDoc of chatMessages.flat()) {
    // get message info
    const message = messageDoc.data();
    // if the message is the prompt answer then add it to their player object
    if (message.isPromptAnswer) {
      // get index and add their prompt answer to their player object
      players[message.sender].promptAnswer = message.text;
    }
    // delete all messages
    transaction.delete(messageDoc.ref);
  }

  for (const room of chatRooms) {
    transaction.delete(room);
  }

  for (const stalker of stalkers.docs) {
    transaction.update(stalker.ref, { stalker: false });
  }

  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + lobbyData.lobbySettings.voteTime * 1000
  );
  transaction.update(lobbyDoc, { state: "VOTE", expiration, players });
}
