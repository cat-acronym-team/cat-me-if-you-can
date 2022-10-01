<script lang="ts">
  import { loginWithGoogle, loginWithMicrosoft, loginAnonymously } from "../../lib/firebase/authfunctions";
</script>

<button class="google-button" on:click={loginWithGoogle}>sign in with google</button>
<button class="microsoft-button" on:click={loginWithMicrosoft}>sign in with Microsoft</button>
<button class="anonymous-signin" on:click={loginAnonymously}>Play</button>

<style>
  button {
    border: none;
    cursor: pointer;
    padding-left: 24dp;
    padding-right: 24dp;
  }
</style>
