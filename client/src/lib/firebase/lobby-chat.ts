import { query, where, getDocs, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { getLobbyChatCollection } from "./firestore-collections";
import { chatMessageValidator } from "./firestore-types/lobby";

export async function addLobbyChatMessage(lobbyId: string, sender: string, text: string) {
  //Validate Chat Message
  const isValid = chatMessageValidator(text);
  if (!isValid.valid) {
    throw new Error(isValid.reason);
  }
  //Add Message Doc
  await addDoc(getLobbyChatCollection(lobbyId), {
    text,
    sender,
    timestamp: serverTimestamp(),
  });
}
