import { app } from "../../firebase";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInAnonymously,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// Google login/signup
export async function loginWithGoogle() {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  try {
    const user = await signInWithPopup(auth, provider);
    localStorage.setItem("uid", user.user.uid); // Stores user logging ins uid in local storage
    console.log(user);
  } catch (error) {
    console.log(error);
  }
  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     const uid = user.uid;
  //     localStorage.setItem("name", uid);
  //   } else {
  //     return;
  //   }
  // });
}

// Microsoft login/signup
export async function loginWithMicrosoft() {
  const auth = getAuth();
  const provider = new OAuthProvider("microsoft.com");
  try {
    const user = await signInWithPopup(auth, provider);
    localStorage.setItem("uid", user.user.uid); // Stores user logging ins uid in local storage
    console.log(user);
  } catch (error) {
    console.log(error);
  }
}

// Anonymous login
export async function loginAnonymously() {
  try {
    const auth = getAuth();
    const user = await signInAnonymously(auth);

    localStorage.setItem("uid", user.user.uid); // Stores user logging ins uid in local storage
    console.log(user);
  } catch (error) {
    error;
  }
}

// export function loginWithEmail() {
//   const auth = getAuth();

//   signInWithEmailAndPassword(auth, email, password);

export async function loginWithEmail() {
  try {
    const auth = getAuth();

    // const user = await createUserWithEmailAndPassword(auth, email, password);
    // console.log(user);
  } catch (error) {
    console.log(error);
  }
}
