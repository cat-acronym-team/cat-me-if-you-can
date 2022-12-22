import { firestore } from "firebase-admin";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { db } from "./app";
import {
  getChatRoomCollection,
  getChatRoomMessagesCollection,
  getPrivatePlayerCollection,
  getLobbyChatCollection,
  getPromptAnswerCollection,
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

export async function deleteChatCollections(lobbyDoc: firestore.DocumentReference<Lobby>) {
  const batch = db.batch();

  const chatRooms = await getChatRoomCollection(lobbyDoc).get();

  for (const chatRoomDoc of chatRooms.docs) {
    // place messages in batch
    const chatMessages = await getChatRoomMessagesCollection(chatRoomDoc.ref).get();
    for (const messageDoc of chatMessages.docs) {
      batch.delete(messageDoc.ref);
    }

    // place room in batch
    batch.delete(chatRoomDoc.ref);
  }

  await batch.commit();
}

export async function setAndDeleteAnswers(
  lobbyData: Lobby,
  lobbyDoc: DocumentReference<Lobby>,
  transaction: Transaction
) {
  const { players } = lobbyData;
  const promptAnswersSnapshot = await transaction.get(getPromptAnswerCollection(lobbyDoc));

  // delete stalker
  const stalkers = await transaction.get(getPrivatePlayerCollection(lobbyDoc).where("stalker", "==", true));

  for (const stalker of stalkers.docs) {
    transaction.update(stalker.ref, { stalker: false });
  }

  // iterate through promptAnswer docs and place the answer on their player object and delete the doc
  for (const promptAnswerDoc of promptAnswersSnapshot.docs) {
    const promptData = promptAnswerDoc.data();

    players[promptAnswerDoc.id].promptAnswer = promptData.answer;

    transaction.delete(promptAnswerDoc.ref);
  }

  const expiration = firestore.Timestamp.fromMillis(
    firestore.Timestamp.now().toMillis() + lobbyData.lobbySettings.voteTime * 1000
  );

  transaction.update(lobbyDoc, { state: "VOTE", expiration, players });
}
