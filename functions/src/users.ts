import * as functions from "firebase-functions";
import { userCollection } from "./firestore-collections";

export const onDeleteUser = functions.auth.user().onDelete((user) => {
  const uid = user.uid;
  userCollection.doc(uid).delete();
});
