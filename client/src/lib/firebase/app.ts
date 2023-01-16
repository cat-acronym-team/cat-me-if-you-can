import { PUBLIC_USE_EMULATORS, PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { authStore } from "$stores/auth";

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
    measurementId: "G-4JE1BZR910",
  };
} else if (PUBLIC_FIREBASE_CONFIG === "production") {
  firebaseConfig = {
    apiKey: "AIzaSyDNUjAQyqRKXCoS7UPRs-uVh9xQ8qgSg7s",
    authDomain: "cat-me-if-you-can-game.firebaseapp.com",
    projectId: "cat-me-if-you-can-game",
    storageBucket: "cat-me-if-you-can-game.appspot.com",
    messagingSenderId: "205088834267",
    appId: "1:205088834267:web:dac48e8f7d9532e2a042fe",
    measurementId: "G-RS9KEVPKF4",
  };
} else {
  throw new Error("Invalid PUBLIC_FIREBASE_CONFIG");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

auth.onAuthStateChanged((user) => {
  authStore.set(user);
});

if (PUBLIC_USE_EMULATORS === "true") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "localhost", 5001);
}
