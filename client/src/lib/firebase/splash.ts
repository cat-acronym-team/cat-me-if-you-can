import { userCollection } from "./firestore-collections";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserData } from "./firestore-types/users";
import { loginAnonymous } from "$lib/firebase/auth";

export const saveOrCreate = async (user: User | null, userData: UserData | undefined, name: string) => {
  // this is an anon user
  // create anon user and user doc with display name
  if (user === null && userData === undefined) {
    const anon = (await loginAnonymous()).user;
    createUser(anon.uid, name);
  }
  // this is a user without user doc
  // create user doc with display name
  if (user !== null && userData === undefined) {
    createUser(user.uid, name);
  }
  // this is user with a user doc
  // just update their current display name
  if (user !== null && userData !== undefined) {
    saveDisplayName(user.uid, name);
  }
};
// users collection
//  - displayName
//  - avatar
// get display name function to autofill the name input text
export const getUser = async (id: string) => {
  const user = await getDoc(doc(userCollection, id));
  return user.data();
};
// allow user to changing after every keystroke
export const saveDisplayName = async (id: string, name: string) => {
  const user = doc(userCollection, id);
  await updateDoc(user, {
    displayName: name,
  });
};

// create user document for anon user
export const createUser = async (uid: string, name: string) => {
  await setDoc(doc(userCollection, uid), {
    displayName: name,
    avatar: 0,
  });
};
