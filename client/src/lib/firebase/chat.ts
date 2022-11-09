import { addDoc, serverTimestamp } from "firebase/firestore";
import { getChatRoomMessagesCollection, getLobbyChatCollection } from "./firestore-collections";
import { chatMessageValidator } from "./firestore-types/lobby";

/**
 * Adds Message for the user to the chatroom
 */
export async function addChatMessage(lobbyId: string, roomId: string, sender: string, text: string) {
  // Validate Chat Message
  const isValid = chatMessageValidator(text);
  if (!isValid.valid) {
    throw new Error(isValid.reason);
  }
  // Add Message Doc
  await addDoc(getChatRoomMessagesCollection(lobbyId, roomId), {
    text,
    sender,
    timestamp: serverTimestamp(),
  });
}
export async function addLobbyChatMessages(lobbyId: string, sender: string, text: string, alive: boolean) {
  // Validate Chat Message
  const isValid = chatMessageValidator(text);
  if (!isValid.valid) {
    throw new Error(isValid.reason);
  }
  // Add Message Doc
  addDoc(getLobbyChatCollection(lobbyId), {
    text,
    sender,
    timestamp: serverTimestamp(),
    alive,
  });
}
