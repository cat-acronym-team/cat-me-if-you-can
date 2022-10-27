import { auth } from "$lib/firebase/app";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInAnonymously,
  deleteUser,
  signOut,
} from "firebase/auth";

// Google login/signup
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const user = await signInWithPopup(auth, provider);
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

export async function loginWithEmail() {
  try {
    // const user = await createUserWithEmailAndPassword(auth, email, password);
    // console.log(user);
  } catch (error) {
    console.log(error);
  }
}

export function loginAnonymous() {
  return signInAnonymously(auth);
}

export async function deleteAccount() {
  const user = auth.currentUser;

  if (user !== null) {
    return await deleteUser(user);
  }

  return user;
}

export function logOut() {
  return signOut(auth);
}
