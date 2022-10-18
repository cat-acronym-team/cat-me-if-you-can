import { doc, getDoc } from "firebase/firestore";
import { getPrivatePlayerCollection, lobbyCollection } from "./firestore-collections";

export const getLobbyData = async (code: string) => {
  const lobbySnap = await getDoc(doc(lobbyCollection, code));
  return lobbySnap.data();
};

function getLobby(code: string) {
  const lobby = doc(lobbyCollection, code);
  return lobby;
}

export const getPrivatePlayer = async (code: string, id: string) => {
  const privatePlayer = await getDoc(doc(getPrivatePlayerCollection(getLobby(code)), id));
  return privatePlayer.data();
}

export const getCurrentPlayer = async (code: string, id: string) => {
  const currentPlayer = await getDoc(doc(getPrivatePlayerCollection(getLobby(code)), id));
  return currentPlayer.data();
}

export const lobbyReturn = async (code: string) => {
  const lobbyData = await getLobbyData(code);
  if(lobbyData !== undefined) {
  lobbyData.state = "WAIT";
  }
}
