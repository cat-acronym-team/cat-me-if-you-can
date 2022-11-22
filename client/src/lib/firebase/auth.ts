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
  type User,
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

export function linkWithGoogle(user: User | null) {
  if (user === undefined) {
    throw new Error("Not signed in");
  }

  if (user != null) {
    if (hasGoogleProvider(user)) {
      throw new Error("google-account-already-linked");
    }
    const google = new GoogleAuthProvider();
    return linkWithPopup(user, google);
  }
}

export function linkWithMicrosoft(user: User | null) {
  if (user === undefined) {
    throw new Error("Not signed in");
  }

  if (user != null) {
    if (hasMicrosoftProvider(user)) {
      throw new Error("microsoft-account-already-linked");
    }

    const microsoft = new OAuthProvider("microsoft.com");
    return linkWithPopup(user, microsoft);
  }
}

export function linkWithPassword(password: string) {
  const user = auth.currentUser;
  if (user === undefined) {
    throw new Error("Not Signed In");
  }

  if (user != null) {
    return updatePassword(user, password);
  } else {
    return user;
  }
}

export function hasGoogleProvider(user: User | null) {
  if (user == null) {
    return false;
  }
  if (user) {
    const signInMethods = user.providerData;

    for (const provider of signInMethods) {
      if (provider.providerId == "google.com") {
        return true;
      }
    }
    return false;
  }
}

export function hasMicrosoftProvider(user: User | null) {
  if (user == null) {
    return false;
  }
  if (user) {
    const signInMethods = user.providerData;

    for (const provider of signInMethods) {
      if (provider.providerId == "microsoft.com") {
        return true;
      }
    }
    return false;
  }
}

export function logOut() {
  window.location.href = "/";
  return signOut(auth);
}
