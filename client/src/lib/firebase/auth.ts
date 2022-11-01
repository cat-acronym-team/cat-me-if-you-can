import { auth } from "$lib/firebase/app";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  deleteUser,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";

// Google login/signup
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// Microsoft login/signup
export async function loginWithMicrosoft() {
  const provider = new OAuthProvider("microsoft.com");
  await signInWithPopup(auth, provider);
}

// Login with email and password
export async function loginWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function createUser(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginAnonymous() {
  return await signInAnonymously(auth);
}

export function deleteAccount() {
  const user = auth.currentUser;

  if (user == null) {
    throw new Error("User is not defined.");
  }

  deleteUser(user);
}

export async function linkUserCredentials(password: string) {
  const user = auth.currentUser;

  // If user is signed in
  if (user !== null && user !== undefined) {
    const email = user.email;
    if (email !== null) {
      const credential = EmailAuthProvider.credential(email, password);
      return await linkWithCredential(user, credential);
    }
  }
}

export function logOut() {
  return signOut(auth);
}
