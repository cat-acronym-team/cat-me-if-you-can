import * as functions from "firebase-functions";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { db } from "./app";
import {
  getChatRoomCollection,
  getChatRoomMessagesCollection,
  getPrivatePlayerCollection,
  getLobbyChatCollection,
  getPromptAnswerCollection,
  lobbyCollection,
} from "./firestore-collections";
import { Lobby } from "./firestore-types/lobby";
import { isStalkChatroomRequest as isLeaveLobbyRequest } from "./firebase-functions-types";

export async function deleteLobbyChatMessages(lobbyDoc: DocumentReference<Lobby>) {
  const messages = await getLobbyChatCollection(lobbyDoc).get();

  const batch = db.batch();
  for (const messageDoc of messages.docs) {
    batch.delete(messageDoc.ref);
  }
  await batch.commit();
}

export async function deleteChatCollections(lobbyDoc: DocumentReference<Lobby>) {
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
  const { players, uids } = lobbyData;
  const promptAnswersSnapshot = await transaction.get(getPromptAnswerCollection(lobbyDoc));

  // delete stalker
  const stalkers = await transaction.get(getPrivatePlayerCollection(lobbyDoc).where("stalker", "==", true));

  for (const stalker of stalkers.docs) {
    transaction.update(stalker.ref, { stalker: false });
  }

  // iterate through promptAnswer docs and place the answer on their player object and delete the doc
  for (const promptAnswerDoc of promptAnswersSnapshot.docs) {
    const promptData = promptAnswerDoc.data();
    const promptAns = promptData.answer;

    const playerIndex = uids.indexOf(promptAnswerDoc.id);
    players[playerIndex].promptAnswer = promptAns;

    transaction.delete(promptAnswerDoc.ref);
  }

  const expiration = Timestamp.fromMillis(Timestamp.now().toMillis() + lobbyData.lobbySettings.voteTime * 1000);

  transaction.update(lobbyDoc, { state: "VOTE", expiration, players });
}

export const removeFromChatroom = functions.https.onCall((data: unknown, context): Promise<void> => {
  const auth = context.auth;
  if (auth === undefined) {
    throw new functions.https.HttpsError("permission-denied", "User is not Authenticated");
  }

  if (!isLeaveLobbyRequest(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data is not of isLeaveLobbyRequest type");
  }

  const lobbyDocRef = lobbyCollection.doc(data.code);
  return db.runTransaction(async (transaction) => {
    const chatRoomCollection = getChatRoomCollection(lobbyDocRef);
    const chatRoomRef = chatRoomCollection.doc(data.chatId);

    const chatRoom = await transaction.get(chatRoomRef);
    if (!chatRoom.exists) {
      throw new functions.https.HttpsError("not-found", "Chatroom not found");
    }

    transaction.update(chatRoomRef, {
      viewers: FieldValue.arrayRemove(auth.uid),
    });
  });
});
