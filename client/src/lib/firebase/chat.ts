import { addDoc, query, where, getDocs, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { getChatRoomCollection, getChatRoomMessagesCollection, lobbyCollection } from "./firestore-collections";

/**
 * Checks if the user is in a chatroom then returns their chatroom doc
 */
export async function findChatRoom(lobbyId: string, playerId: string) {
  const queryChatRoom = await getDocs(query(getChatRoomCollection(lobbyId), where("pair", "array-contains", playerId)));
  return queryChatRoom.docs[0];
}
/**
 * Create a doc with the submitted message
 */
export async function addMessage(lobbyId: string, roomId: string, sender: string, text: string) {
  if (typeof lobbyId !== "string" || typeof roomId !== "string") {
    throw new Error("Invalid Code!");
  }
  // check if the lobby and roomId exist
  const lobby = doc(lobbyCollection, lobbyId);
  const lobbyInfo = await getDoc(lobby);
  if (!lobbyInfo.exists()) {
    throw new Error("Lobby doesn't exist!");
  }
  const room = doc(getChatRoomCollection(lobbyId), roomId);
  const roomInfo = await getDoc(room);
  if (!roomInfo.exists) {
    return new Error("Room doesn't exist!");
  }

  addDoc(getChatRoomMessagesCollection(lobbyId, roomId), {
    sender,
    text,
    timestamp: serverTimestamp(),
  });
}
