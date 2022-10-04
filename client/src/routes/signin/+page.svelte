<script lang="ts">
  import { loginWithGoogle, loginWithMicrosoft } from "$lib/firebase/auth";
</script>

<div class="container">
  <div class="google">
    <button id="google-button" on:click={loginWithGoogle}>sign in with google</button>
  </div>
  <div class="microsoft">
    <button id="microsoft-button" on:click={loginWithMicrosoft}>sign in with Microsoft</button>
  </div>
  <div class="email">
    <button id="email-button">Sign in With Email</button>
  </div>
  <div id="input" />
</div>

<!-- <h1>{$id}</h1> -->
<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      ". . . . . . . . ."
      ". . . . . . . . ."
      ". . . . . . . . ."
      ". . . . google . . . ."
      ". . . . microsoft . . . ."
      ". . . . email . . . ."
      ". . . . input . . . ."
      ". . . . . . . . ."
      ". . . . . . . . ."
      ". . . . . . . . .";
  }

  .google {
    grid-area: google;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .microsoft {
    grid-area: microsoft;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .email {
    grid-area: email;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  button {
    border: none;
    cursor: pointer;
    padding-left: 24dp;
    padding-right: 24dp;
    width: 150px;
    height: 50px;
  }

  #email-input {
    grid-area: input;
    align-items: center;
  }
</style>
