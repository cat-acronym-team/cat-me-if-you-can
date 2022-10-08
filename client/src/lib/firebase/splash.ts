import { db } from "./app";
import type { UserData } from "./firestore-types/users";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

// users collection
//  - displayName
//  - avatar
// get display name function to autofill the name input text
export const getDisplayName = async (id: string) => {
  const user = await getDoc(doc(db, `/users/${id}`));
  return user.data() as UserData;
};
// allow user to changing after every keystroke
export const saveDisplayName = async (id: string, name: string) => {
  const user = doc(db, `/users/${id}`);
  await updateDoc(user, {
    displayName: name,
  });
};

// create user document for anon user
export const createUser = async (uid: string, name: string) => {
  await setDoc(doc(db, `/users/${uid}`), {
    displayName: name,
    avatar: 0,
  });
};
