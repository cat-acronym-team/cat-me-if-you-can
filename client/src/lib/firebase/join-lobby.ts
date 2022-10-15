import { lobbyCollection } from "./firestore-collections";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import type { UserData } from "./firestore-types/users";
import type { Player } from "./firestore-types/lobby";

export async function findAndJoinLobby(id: string, allUserInfo: UserData & { uid: string }) {
  // lobby doc
  const lobby = doc(lobbyCollection, id);
  // check if this lobby exists
  const validLobby = await getDoc(lobby);
  if (!validLobby.exists()) {
    throw new Error("Lobby doesn't exist!");
  }
  // get existing lobby data and add the new user
  // First, check if they're already in the lobby
  const { uids, players } = validLobby.data();
  if (uids.includes(allUserInfo.uid)) {
    throw new Error("You are already in the lobby!");
  }
  await updateDoc(lobby, {
    uids: [...uids, allUserInfo.uid],
    players: [
      ...players,
      {
        displayName: allUserInfo.displayName,
        avatar: allUserInfo.avatar as Player["avatar"],
        alive: true,
      },
    ],
  });
}
