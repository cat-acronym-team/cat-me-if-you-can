import { PUBLIC_USE_EMULATORS, PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { connectFirestoreEmulator, doc, Firestore, getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  updateCurrentUser,
  updateProfile,
  sendEmailVerification,
  connectAuthEmulator,
} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
let firebaseConfig: FirebaseOptions;

if (PUBLIC_FIREBASE_CONFIG === "staging") {
  firebaseConfig = {
    apiKey: "AIzaSyDchZomvaTB59iRD1Y9JY0PjrQcZoEIv-g",
    authDomain: "cat-me-if-you-can-game-dev.firebaseapp.com",
    projectId: "cat-me-if-you-can-game-dev",
    storageBucket: "cat-me-if-you-can-game-dev.appspot.com",
    messagingSenderId: "694545219858",
    appId: "1:694545219858:web:2a3f2ca632e247121333cb",
  };
} else if (PUBLIC_FIREBASE_CONFIG === "production") {
  firebaseConfig = {
    apiKey: "AIzaSyDNUjAQyqRKXCoS7UPRs-uVh9xQ8qgSg7s",
    authDomain: "cat-me-if-you-can-game.firebaseapp.com",
    projectId: "cat-me-if-you-can-game",
    storageBucket: "cat-me-if-you-can-game.appspot.com",
    messagingSenderId: "205088834267",
    appId: "1:205088834267:web:dac48e8f7d9532e2a042fe",
  };
} else {
  throw new Error("Invalid PUBLIC_FIREBASE_CONFIG");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

if (PUBLIC_USE_EMULATORS === "true") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
}

//Google login/signup
export async function loginWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;

      sendEmailVerification(user).then(() => {
        // Email verification sent!
        // ...
      });
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode: unknown = error.code;
      const errorMessage: unknown = error.message;
      // The email of the user's account used.
      const email: unknown = error.customData.email;
      // The AuthCredential type that was used.
      const credential: unknown = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
}

//Microsoft login/signup
export async function loginWithMicrosoft() {
  const auth = getAuth();
  const provider = new OAuthProvider("microsoft.com");
  signInWithPopup(auth, provider)
    .then((result) => {
      // User is signed in.
      // IdP data available in result.additionalUserInfo.profile.

      // Get the OAuth access token and ID Token
      const credential = OAuthProvider.credentialFromResult(result);
      const accessToken: string | undefined = credential.accessToken;
      const idToken: string | undefined = credential.idToken;
    })
    .catch((error) => {
      // Handle error.
    });
}

//Anonymous login
export function loginAnonymously() {
  const auth = getAuth();
  signInAnonymously(auth)
    .then(() => {
      // Signed in..
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ...
    });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
}
