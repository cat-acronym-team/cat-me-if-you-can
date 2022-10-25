import { query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { getLobbyChatCollection } from "./firestore-collections";
import { chatMessageValidator } from "./firestore-types/lobby";

export async function addLobbyChatMessage(lobbyId: string, sender: string, text: string) {
  const isValid = chatMessageValidator(text);
  if (!isValid.valid) {
    throw new Error(isValid.reason);
  }
  addDoc(getLobbyChatCollection(lobbyId), {
    text,
    sender,
    timestamp: serverTimestamp(),
  });
}
