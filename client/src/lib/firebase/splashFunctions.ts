import { db } from "../../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

// users collection
//  - displayName
//  - avatar
// get display name function to autofill the name input text
export const getDisplayName = async (id: string) => {
  const user = await getDoc(doc(db, `/users/${id}`));
  return user.data() as { displayName: string };
};
// allow user to changing after every keystroke
export const saveDisplayName = async (id: string, name: string) => {
  const user = doc(db, `/users/${id}`);
  await updateDoc(user, {
    displayName: name,
  });
};
