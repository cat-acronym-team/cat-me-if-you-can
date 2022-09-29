<script lang="ts">
  import { loginWithGoogle } from "../../firebase";
</script>

<button class="googlebutton" on:click={loginWithGoogle}>sign in with google</button>

<style>
  button {
    background-image: url("./images/signin-assets/google_signin_buttons/web/2x/btn_google_signin_dark_normal_web@2x.png")
      no-repeat;
    border: none;
    cursor: pointer;
    padding-left: 24dp;
    padding-right: 24dp;
  }
</style>
