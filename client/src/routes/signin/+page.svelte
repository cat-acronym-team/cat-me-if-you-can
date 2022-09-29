<script lang="ts">
  import { loginWithGoogle, loginWithMicrosoft, loginAnonymously } from "../../firebase";
</script>

<button class="googlebutton" on:click={loginWithGoogle}>sign in with google</button>
<button class="microsoftbutton" on:click={loginWithMicrosoft}>sign in with Microsoft</button>
<button class="anonymoussignin" on:click={loginAnonymously}>Play</button>

<style>
  button {
    border: none;
    cursor: pointer;
    padding-left: 24dp;
    padding-right: 24dp;
  }
</style>
