import { addDoc } from "firebase/firestore";
import { chatRoomCollection } from "./firestore-collections";

export const createChatRoom = async (pair: [string, string]) => {
  const chatroom = await addDoc(chatRoomCollection, {
    pair,
    viewers: [],
  });

  return chatroom.id;
};
