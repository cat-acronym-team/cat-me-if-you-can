<script lang="ts">
  import { auth } from "$lib/firebase/app";
  import { signOut } from "firebase/auth";
  function onsignout() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  }
</script>

<button on:click={onsignout}>Sign out</button>

<style>
</style>
