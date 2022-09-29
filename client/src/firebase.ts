import { PUBLIC_USE_EMULATORS, PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

if (PUBLIC_USE_EMULATORS === "true") {
  connectFirestoreEmulator(db, "localhost", 8080);
}

export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);

export async function loginWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token: unknown = credential.accessToken;
      // The signed-in user info.
      const user: unknown = result.user;
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
