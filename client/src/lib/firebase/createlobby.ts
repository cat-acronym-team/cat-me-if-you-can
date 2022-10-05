import { doc, getDocs, setDoc } from "firebase/firestore";
import { lobbyCollection } from "./firestore-collections";
import { auth } from "./app";
import { FieldValue } from "@google-cloud/firestore";

export async function createLobby() {
  const code = await createCode(); // Creates lobby code
  const user = auth.currentUser?.uid;

  if (user === null || user === undefined) {
    return; // Figure out later
  } else {
    await setDoc(doc(lobbyCollection, code), {
      uids: [user.toString()], // Somehow get uids
      players: [
        {
          alive: true,
          avatar: 1,
          displayName: "default", // Change to real display name once display names exist
          // votes
        },
      ],

      state: "WAIT",
    });
  }
}

const characters = "abcdefghijklmnopqrstuvwxyz";

async function createCode() {
  let code = " ";
  const charactersLength = characters.length;

  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  const checkCode = await getDocs(lobbyCollection);

  checkCode.forEach((doc) => {
    /* Run check to see if lobby with code already exists */
    if (code === doc.id) {
      createCode();
    }
  });

  return code;
}

// export async function getCode() {}
