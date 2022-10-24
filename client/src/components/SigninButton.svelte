<script lang="ts">
  import Modal from "./Modal.svelte";
  import { authStore as user } from "$stores/auth";
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail, onSignOut, createUser } from "$lib/firebase/auth";

  // check if the user is logged in with getAuth
  let openSignInModal = false;
  let email = "";
  let password = "";
  let confirmPass = "";
  let signInButton = false;
  let createAccountButton = false;
  let errorMessage: string = "";
  function clearFields() {
    email = "";
    password = "";
  }
  function outputErrorMessage() {
    switch (errorMessage) {
      case "Firebase: Error (auth/user-not-found).":
        errorMessage = "The email you entered is not registered, please create an account.";
        return;
      case "Firebase: Error (auth/popup-closed-by-user).":
        errorMessage = "";
        return;
      case "Firebase: Error (auth/wrong-password).":
        errorMessage = "Incorrect Password.";
        return;
      default:
        return;
    }
  }

  async function createAccount() {
    if (password != confirmPass) {
      password = "";
      confirmPass = "";
      errorMessage = "Passwords do not match";
      return;
    }
    try {
      await createUser(email, password);
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
      return;
    }
    createAccountButton = false;
    openSignInModal = false;
    email = "";
    password = "";
    confirmPass = "";
  }
  async function submitLogin() {
    try {
      await loginWithEmail(email, password);
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
      return;
    }
    signInButton = false;
    openSignInModal = false;
    password = "";
    email = "";
  }
  function signInDropDown() {
    errorMessage = "";
    signInButton = !signInButton;
    createAccountButton = false;
  }
  function createAccountDropDown() {
    errorMessage = "";
    createAccountButton = !createAccountButton;
    signInButton = false;
  }
  async function googleLogin() {
    try {
      await loginWithGoogle();
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
      return;
    }
    openSignInModal = false;
  }

  async function microsoftLogin() {
    try {
      await loginWithMicrosoft();
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
      return;
    }
    openSignInModal = false;
  }
</script>

<!-- Sign In Modal -->
<Modal open={openSignInModal}>
  <button class="close" on:click={() => (openSignInModal = false)}
    ><img src="/images/closeOutButton.svg" alt="closeButton" /></button
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

    <div>
      <button on:click={signInDropDown} on:click={clearFields}>Sign In</button>
      {#if signInButton}
        <form class="formContainer" on:submit|preventDefault={submitLogin}>
          <div class="groupContainer">
            <div class="formGroup">
              <label for="email"><b>Email</b></label>
              <input type="email" bind:value={email} placeholder="Enter Username" name="email" required />
            </div>
            <div class="formGroup">
              <label for="password"><b>Password</b></label>
              <input type="password" bind:value={password} placeholder="Enter Password" name="password" required />
            </div>
          </div>
          {#if errorMessage !== ""}
            <p class="error">{errorMessage}</p>
          {/if}
          <div class="formButton">
            <button type="submit">Login</button>
          </div>
        </form>
      {/if}
    </div>
    <button on:click={createAccountDropDown} on:click={clearFields}>Create Account</button>
    {#if createAccountButton}
      <form class="formContainer" on:submit|preventDefault={createAccount}>
        <div class="groupContainer">
          <div class="formGroup">
            <label for="email"><b>Email</b></label>
            <input type="email" bind:value={email} placeholder="Enter Username" name="email" required />
          </div>
          <div class="formGroup">
            <label for="password"><b>Password</b></label>
            <input type="password" bind:value={password} placeholder="Enter Password" name="password" required />
          </div>
          <div class="formGroup">
            <label for="confirmPass"><b>Confirm Password</b></label>
            <input
              type="password"
              bind:value={confirmPass}
              placeholder="Confirm Password"
              name="confirmPass"
              required
            />
          </div>
        </div>
        {#if errorMessage !== ""}
          <p class="error">{errorMessage}</p>
        {/if}
        <div class="formButton">
          <button type="submit">Register Account</button>
        </div>
      </form>
    {/if}

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
  .error {
    color: salmon;
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
</style>
