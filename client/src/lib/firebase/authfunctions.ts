import { app } from "../../firebase";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Google login/signup
export async function loginWithGoogle() {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential!.accessToken;
    // The signed-in user info.
    const user = result.user;
  });
}

// Microsoft login/signup
export async function loginWithMicrosoft() {
  const auth = getAuth();
  const provider = new OAuthProvider("microsoft.com");

  signInWithPopup(auth, provider);
}

// Anonymous login
export function loginAnonymously() {
  const auth = getAuth();
  signInAnonymously(auth);
}

// export function loginWithEmail() {
//   const auth = getAuth();

//   signInWithEmailAndPassword(auth, email, password);
// }
