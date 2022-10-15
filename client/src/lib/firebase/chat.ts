import { addDoc, query, where, getDocs, Timestamp, deleteDoc } from "firebase/firestore";
import { getChatRoomCollection, getChatRoomMessagesCollection } from "./firestore-collections";

// TODO: below function on server
/**
 * Create pairs and create chatrooms from those pairs
 */
export function generatePairChatrooms(lobbyId: string, uids: string[]) {
  const pairs: { one: string; two: string; stalker?: string }[] = [];
  let pairOne, pairTwo, stalker: string;
  // Check if the lobby is uneven to find stalker
  if (uids.length % 2 !== 0) {
    while (uids.length !== 1) {
      // get random pair
      pairOne = uids[Math.floor(Math.random() * uids.length)];
      pairTwo = uids[Math.floor(Math.random() * uids.length)];
      // generate a random player if the current pairs are equal
      while (pairOne === pairTwo) {
        pairTwo = uids[Math.floor(Math.random() * uids.length)];
      }
      // organize the pairs
      pairs.push({ one: pairOne, two: pairTwo });
      // delete them from temp array
      uids.splice(uids.indexOf(pairOne), 1);
      uids.splice(uids.indexOf(pairTwo), 1);
    }
    //TODO: Make this guy a stalker somehow
    stalker = uids[0];
  }
  // even number of players
  else {
    while (uids.length !== 0) {
      // get random pair
      pairOne = uids[Math.floor(Math.random() * uids.length)];
      pairTwo = uids[Math.floor(Math.random() * uids.length)];
      // generate a random player if the current pairs are equal
      while (pairOne === pairTwo) {
        pairTwo = uids[Math.floor(Math.random() * uids.length)];
      }
      // organize the pairs
      pairs.push({ one: pairOne, two: pairTwo });
      // delete them from temp array
      uids.splice(uids.indexOf(pairOne), 1);
      uids.splice(uids.indexOf(pairTwo), 1);
    }
  }
  pairs.forEach(async ({ one, two }) => {
    await createChatRoom(lobbyId, [one, two]);
  });
}
/**
 * Checks if the user is in a chatroom then returns their chatroom doc
 */
export async function findChatRoom(lobbyId: string, playerId: string) {
  const queryChatRoom = await getDocs(query(getChatRoomCollection(lobbyId), where("pair", "array-contains", playerId)));
  return queryChatRoom.docs[0];
}

// TODO: below function on server
/**
 * Creates a chatroom with the indicated pairs and lobby id
 */
export async function createChatRoom(lobbyId: string, pair: [string, string]) {
  const chatroom = await addDoc(getChatRoomCollection(lobbyId), {
    pair,
    viewers: [],
  });

  return chatroom;
}

export async function deleteChatRoom(lobbyId: string) {
  const chatRooms = await getDocs(getChatRoomCollection(lobbyId));
  chatRooms.docs.map(async (r) => await deleteDoc(r.ref));
}

/**
 * Checks if the user is in a chatroom
 */
export async function isInChatRoom(lobbyId: string, playerId: string) {
  const queryChatRoom = await getDocs(query(getChatRoomCollection(lobbyId), where("pair", "array-contains", playerId)));
  return queryChatRoom.empty;
}

/**
 * Create a doc with the submitted message
 */
export async function addMessage(lobbyId: string, roomId: string, sender: string, text: string) {
  addDoc(getChatRoomMessagesCollection(lobbyId, roomId), {
    sender,
    text,
    timestamp: Timestamp.now(),
  });
}
