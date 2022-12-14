import { userCollection } from "./firestore-collections";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { displayNameValidator, type UserData } from "./firestore-types/users";
import { loginAnonymous } from "$lib/firebase/auth";

/*
  there are three type of situations that could happen
  1. A Anon User without User Doc 
    - create anon user and create user doc with display name
  2. A User without User Doc
    - create user doc with display name
  3. A User with User Doc
    - just update their display name
*/
export async function saveOrCreate(user: User | null, userData: UserData | undefined, name: string) {
  const isValid = displayNameValidator(name);
  if (!isValid.valid) {
    throw new Error(isValid.reason);
  }
  // this is an anon user
  // create anon user and user doc with display name
  if (user === null && userData === undefined) {
    const anon = (await loginAnonymous()).user;
    await createUser(anon.uid, name);
  }
  // this is a user without user doc
  // create user doc with display name
  if (user !== null && userData === undefined) {
    await createUser(user.uid, name);
  }
  // this is user with a user doc
  // just update their current display name
  if (user !== null && userData !== undefined) {
    await saveDisplayName(user.uid, name);
  }
}
// users collection
//  - displayName
//  - avatar
// get display name function to autofill the name input text
export async function getUser(id: string) {
  const user = await getDoc(doc(userCollection, id));
  return user.data();
}
// allow user to changing after every keystroke
export async function saveDisplayName(id: string, name: string) {
  const user = doc(userCollection, id);
  await updateDoc(user, {
    displayName: name,
  });
}

// create user document for anon user
export const createUser = async (uid: string, name: string) => {
  await setDoc(doc(userCollection, uid), {
    displayName: name,
    avatar: 0,
    catfishWins: 0,
    catWins: 0,
    playedAsCat: 0,
    playedAsCatfish: 0,
  });
};
