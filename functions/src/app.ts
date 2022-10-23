import * as admin from "firebase-admin";
import { AppOptions } from "firebase-admin";
import * as functions from "firebase-admin/functions";

const firebaseConfig: AppOptions = {
  serviceAccountId: "cat-me-if-you-can-game-dev@appspot.gserviceaccount.com",
};
const app = admin.initializeApp(firebaseConfig);

export const db = admin.firestore();
export const adminFunctions = functions.getFunctions(app);
