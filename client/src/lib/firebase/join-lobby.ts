import { lobbyCollection } from "./firestore-collections";
import { doc, getDoc } from "firebase/firestore";
import type { UserData } from "./firestore-types/users";
import { joinLobby } from "./firestore-functions";

export async function findAndJoinLobby(id: string, allUserInfo: UserData & { uid: string }) {
  if (id === "") {
    throw new Error("Code can't be empty");
  }
  // lobby doc
  const lobby = doc(lobbyCollection, id);
  // check if this lobby exists
  const validLobby = await getDoc(lobby);
  if (!validLobby.exists()) {
    throw new Error("Lobby doesn't exist!");
  }
  // First, check if they're already in the lobby
  const { uids } = validLobby.data();
  if (uids.includes(allUserInfo.uid)) {
    throw new Error("You are already in the lobby!");
  }
  // make request to server
  const { data } = await joinLobby({ code: lobby.id });
  if (data.error !== undefined) {
    throw new Error(data.error);
  }
}
