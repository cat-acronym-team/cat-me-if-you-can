import { auth } from "$lib/firebase/app";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Google login/signup
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const user = await signInWithPopup(auth, provider);
    console.log(user);
  } catch (error) {
    console.log(error);
  }
}

// Microsoft login/signup
export async function loginWithMicrosoft() {
  const provider = new OAuthProvider("microsoft.com");
  try {
    const user = await signInWithPopup(auth, provider);
    console.log(user);
  } catch (error) {
    console.log(error);
  }
}

// Login with email and password
export async function loginWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function createUser(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export function loginAnonymous() {
  return signInAnonymously(auth);
}

// Sign out
export function onSignOut() {
  signOut(auth);
}
