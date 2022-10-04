<script lang="ts">
  import { loginWithGoogle, loginWithMicrosoft, loginAnonymously, loginWithEmail } from "$lib/firebase/authfunctions";

  function emailLoginInput() {
    const newInputEmail = document.createElement("input");
    newInputEmail.setAttribute("id", "email-input");
    document.getElementById("input")?.appendChild(newInputEmail);

    const newInputPassword = document.createElement("input");
    newInputPassword.setAttribute("id", "password-input");
    document.getElementById("input")?.appendChild(newInputPassword);
  }

  // export const email = document.querySelector("#email-input")?.ariaValueText;
  // export const password = document.querySelector("#password-input")?.ariaValueText;
</script>

<div class="container">
  <div class="google">
    <button id="google-button" on:click={loginWithGoogle}>sign in with google</button>
  </div>
  <div class="microsoft">
    <button id="microsoft-button" on:click={loginWithMicrosoft}>sign in with Microsoft</button>
  </div>
  <div class="anonymous">
    <button id="anonymous-signin" on:click={loginAnonymously}>Play</button>
  </div>
  <div class="email">
    <button id="email-button" on:click={emailLoginInput}>Sign in With Email</button>
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
      ". . . . anonymous . . . ."
      ". . . . email . . . ."
      ". . . . input . . . ."
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

  .anonymous {
    grid-area: anonymous;
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
