import { doc, updateDoc, getDoc } from "../../client/node_modules/firebase/firestore";
import { getPrivatePlayerCollection, lobbyCollection } from "../../client/src/lib/firebase/firestore-collections";

export const lobbyReturn = async (code: string) => {
  await updateDoc(doc(lobbyCollection, code), {
    state: "WAIT",
  });
};

function getLobby(code: string) {
  const lobbyDocRef = doc(lobbyCollection, code);
  return lobbyDocRef;
}

export const getPrivatePlayer = async (code: string, id: string) => {
  const privatePlayerSnap = await getDoc(doc(getPrivatePlayerCollection(getLobby(code)), id));
  const privatePlayer = privatePlayerSnap.data();
  return privatePlayer;
};
