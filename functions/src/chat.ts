import type { DocumentReference, Transaction } from "firebase-admin/firestore";
import { getChatRoomCollection, getChatRoomMessagesCollection } from "./firestore-collections";
import { Lobby } from "./firestore-types/lobby";

// export async function deleteLobbyChatMessages(
//   lobbyData: Lobby,
//   lobbyDoc: DocumentReference<Lobby>,
//   transaction: Transaction
// ) {
//   const messages = await transaction.get(getLobbyChatCollection(lobbyDoc));
//   messages.forEach((messageDoc) => {
//     transaction.delete(messageDoc.ref);
//   });
// }

export async function deleteChatRooms(lobbyData: Lobby, lobbyDoc: DocumentReference<Lobby>, transaction: Transaction) {
  const { players, uids } = lobbyData;
  const chatRoomsSnapshot = await transaction.get(getChatRoomCollection(lobbyDoc));
  const chatRooms = chatRoomsSnapshot.docs.map((room) => room.ref);

  await Promise.all(
    chatRooms.map(async (room) => {
      // get the messages from the chatroom
      const messages = await transaction.get(getChatRoomMessagesCollection(room));
      // get the prompt answers from the messages
      const answers = new Map<string, string>();
      messages.forEach((messageDoc) => {
        // get message info
        const message = messageDoc.data();
        // if the message is the prompt answer then add to map
        if (message.isPromptAnswer) {
          answers.set(message.sender, message.text);
        }
        // delete all messages
        transaction.delete(messageDoc.ref);
      });

      // add the prompt answers to their player object
      for (const [key, value] of answers) {
        // get index and add their prompt answer to their player object
        const playerIndex = uids.indexOf(key);
        players[playerIndex].promptAnswer = value;
      }

      // then delete room
      transaction.delete(room);
    })
  );

  transaction.update(lobbyDoc, { state: "VOTE", players });
}
