<script>
  import { getAuth, signOut } from "firebase/auth";
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
</script>

<button onClick={() => signOut()}>Sign out</button>

<style>
</style>
