import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "./app";
import { getChatRoomCollection, getChatRoomMessagesCollection } from "./firestore-collections";
import { Lobby } from "./firestore-types/lobby";

export async function deleteChatRooms(lobbyDoc: DocumentReference<Lobby>) {
  const lobbyDocSnapshot = await lobbyDoc.get();
  return db.runTransaction(async () => {
    const chatRooms = await getChatRoomCollection(lobbyDoc).listDocuments();

    Promise.all(
      chatRooms.map(async (room) => {
        // get the messages from the chatroom
        const messages = await getChatRoomMessagesCollection(room).get();
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
        lobbyDoc.update({ players });

        // then delete room
        room.delete();
      })
    );
  });
}
