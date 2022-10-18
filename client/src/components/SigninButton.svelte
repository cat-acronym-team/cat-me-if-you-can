<script lang="ts">
  import Modal from "./Modal.svelte";
  import { authStore as user } from "$stores/auth";
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail, onSignOut } from "$lib/firebase/auth";
  import { error } from "@sveltejs/kit";

  // check if the user is logged in with getAuth
  let openSignInModal = false;
  let password = "";
  let email = "";
  let clickedButton = false;
  async function submitLogin() {
    if (password == "") {
      return;
    }
    if (email == "") {
      return;
    } else await loginWithEmail(email, password);

    openSignInModal = false;
    password = "";
    email = "";
  }
  function signInWithEmailAndPassword() {
    clickedButton = !clickedButton;
  }
  async function googleLogin() {
    await loginWithGoogle();
    openSignInModal = false;
  }

  async function microsoftLogin() {
    await loginWithMicrosoft();
    openSignInModal = false;
  }
</script>

<!-- Sign In Modal -->
<Modal open={openSignInModal}>
  <!-- TODO: Sign In Modal Content Here -->
  <button class="close" on:click={() => (openSignInModal = false)}
    ><img src="/images/stuff2.svg" alt="closeButton" /></button
  >
  <div class="container">
    <h2>Sign In</h2>
    <div>
      <button class="loginButton" on:click={googleLogin}>
        <img src="/images/google.png" alt="googleButton" />
      </button>
    </div>
    <div>
      <button class="loginButton" on:click={microsoftLogin}>
        <img src="/images/microsoft.png" alt="microsoftButton" />
      </button>
    </div>
    <div class="email">
      <button on:click={signInWithEmailAndPassword}>Sign In</button>
      {#if clickedButton}
        <form class="formContainer" on:submit|preventDefault={submitLogin}>
          <div class="groupContainer">
            <div class="formGroup">
              <label for="email"><b>Email</b></label>
              <input type="email" bind:value={email} placeholder="Enter Username" name="email" required />
            </div>
            <div class="formGroup">
              <label for="password"><b>Password</b></label>
              <input type="text" bind:value={password} placeholder="Enter Password" name="password" required />
            </div>
          </div>
          <div class="formButton">
            <button type="submit">Login</button>
          </div>
        </form>
      {/if}
    </div>
    <div id="input" />
  </div>
</Modal>
<div class="account-container">
  <!-- If you are not signed in show this  -->
  {#if $user == null}
    <button
      on:click={() => {
        openSignInModal = true;
      }}
      class="account-signin">Sign in</button
    >
    <!-- If you show account and dropdown -->
  {:else}
    <button class="account-button">Account</button>
    <!-- Hover doesn't work on mobile -->
    <div class="account-content">
      <!-- TODO: Account Hover Links -->
      <!-- <a href="/settings">Account Settings</a>
        <a href="/stats">Stats</a> -->
      <button class="signOut" on:click={onSignOut}>Logout</button>
    </div>
  {/if}
</div>

<style>
  .loginButton img {
    width: 100%;
  }
  /* .microsoft-button {
    background: url(images/sign-in-with-microsoft.png);
    background-size: cover;
    background-repeat: no-repeat;
  }
  .google-button {
    background: url(images/btn_google_signin_dark_normal_web@2x.png);
    background-size: cover;
    background-repeat: no-repeat;
  } */

  .signOut:hover {
    cursor: pointer;
  }
  .account-container {
    position: relative;
    display: inline-block;
  }
  .account-signin {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-button {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-container button {
    background-color: #151515;
    color: red;
    padding: 16px;
    font-size: 16px;
    border: none;
  }

  .account-content {
    display: none;
    position: absolute;
    right: 5px;
    background-color: #151515;
    min-width: 160px;
    /* box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2); */
    z-index: 1;
  }

  .account-content a {
    color: red;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }
  .account-container:hover .account-content {
    display: block;
  }
  .container {
    text-align: center;
  }
  .container button {
    border: none;
    cursor: pointer;
    width: 35%;
    background: none;
  }

  .close {
    cursor: pointer;
    background: none;
    border: none;
    width: 5%;
  }
  .close img {
    width: 100%;
  }

  .groupContainer {
    display: flex;
    width: 100%;
  }

  .formGroup {
    display: flex;
    flex-direction: column;
    width: 40%;
    margin: auto;
  }
  .formGroup label {
    text-align: left;
  }

  .formGroup input {
    width: 100%;
    height: 25px;
  }
  .formContainer button {
    margin: auto;
    margin-top: 10px;
  }

  .btnColor {
    background-color: white;
  }
</style>
