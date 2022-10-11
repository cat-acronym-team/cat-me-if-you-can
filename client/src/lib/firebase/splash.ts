import { userCollection } from "./firestore-collections";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

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
