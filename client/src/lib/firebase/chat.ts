import { query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getChatRoomCollection, getChatRoomMessagesCollection } from "./firestore-collections";
import { chatMessageValidator } from "./firestore-types/lobby";

/**
 * Checks if the user is in a chatroom then returns their chatroom doc
 */
export async function findChatRoom(lobbyId: string, playerId: string) {
  const queryChatRoom = await getDocs(query(getChatRoomCollection(lobbyId), where("pair", "array-contains", playerId)));
  return queryChatRoom.docs[0];
}

export async function findViewerChatRoom(lobbyId: string, viewerId: string) {
  const queryChatRoom = await getDocs(
    query(getChatRoomCollection(lobbyId), where("viewers", "array-contains", viewerId))
  );
  return queryChatRoom.docs[0];
}
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
  addDoc(getChatRoomMessagesCollection(lobbyId, roomId), {
    text,
    sender,
    timestamp: serverTimestamp(),
  });
}
