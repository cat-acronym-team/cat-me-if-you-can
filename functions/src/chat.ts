import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "./app";
import { getChatRoomCollection, getChatRoomMessagesCollection } from "./firestore-collections";
import { Lobby } from "./firestore-types/lobby";

export function deleteChatRooms(lobbyDoc: DocumentReference<Lobby>) {
  return db.runTransaction(async (transaction) => {
    const lobbyDocSnapshot = await transaction.get(lobbyDoc);
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
          messageDoc.ref.delete();
        });

        // add the prompt answers to their player object
        const { players, uids } = lobbyDocSnapshot.data() as Lobby;
        for (const [key, value] of answers) {
          // get index and add their prompt answer to their player object
          const playerIndex = uids.indexOf(key);
          const player = players[playerIndex];
          player.promptAnswer = value;
          // add back to the original array
          players[playerIndex] = player;
        }

        // updating the players with the new players array with their answers
        transaction.update(lobbyDoc, { players });

        // then delete room
        room.delete();
      })
    );
  });
}
