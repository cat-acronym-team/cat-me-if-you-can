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
  linkWithPopup,
  updatePassword,
} from "firebase/auth";

const google = new GoogleAuthProvider();
const microsoft = new OAuthProvider("microsoft.com");

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

export function linkWithGoogle() {
  const user = auth.currentUser;
  if (user != null) {
    const signInMethods = user.providerData;

    signInMethods.forEach((provider) => {
      if (provider.providerId == "google.com") {
        throw new Error("a-google-account-already-exists-for-this-user");
      }
    });
    return linkWithPopup(user, google);
  } else {
    return user;
  }
}

export function linkWithMicrosoft() {
  const user = auth.currentUser;
  if (user != null) {
    const signInMethods = user.providerData;

    signInMethods.forEach((provider) => {
      if (provider.providerId == "microsoft.com") {
        throw new Error("a-microsoft-account-already-exists-for-this-user");
      }
    });

    return linkWithPopup(user, microsoft);
  } else {
    return user;
  }
}

export function linkWithPassword(password: string) {
  const user = auth.currentUser;

  if (user != null) {
    return updatePassword(user, password);
  } else {
    return user;
  }
}

export function logOut() {
  return signOut(auth);
}

export function getEmail() {
  const user = auth.currentUser;

  if (user != null) {
    return user.email;
  } else {
    return user;
  }
}
