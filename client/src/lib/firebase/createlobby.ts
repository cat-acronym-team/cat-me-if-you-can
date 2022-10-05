import { db } from "$lib/firebase/app";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

export async function createLobby() {
  const code = createCode(); // Creates lobby code

  await setDoc(doc(db, "lobbies", code), {
    uids: [], // Somehow get uids
    players: {
      alive: true,
      avatar: 1,
      displayName: "default", // Change to real display name once display names exist
      // votes
    },

    GameState: "WAIT",
  });
}

const characters = "abcdefghijklmnopqrstuvwxyz0123456789";

async function createCode() {
  let code = " ";
  const charactersLength = characters.length;

  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  const checkCode = await getDocs(collection(db, "lobbies"));

  checkCode.forEach((doc) => {
    /* Run check to see if lobby with code already exists */
    if (code == doc.id) {
      createCode();
    }
  });

  return code;
}

export async function getCode() {}
