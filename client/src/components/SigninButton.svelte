<script lang="ts">
  import Modal from "./Modal.svelte";
  import { authStore as user } from "$stores/auth";
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail, onSignOut, createUser } from "$lib/firebase/auth";

  // check if the user is logged in with getAuth
  let openSignInModal = false;
  let email = "";
  let password = "";
  let confirmPass = "";
  let clickedButton = false;
  let clickedButton2 = false;
  let errorMessage = "";
  async function createAccount() {
    if (password == "") {
      return;
    }
    if (password != confirmPass) {
      return;
    }
    if (email == "") {
      return;
    } else {
      try {
        await createUser(email, password);
      } catch (err) {
        errorMessage = "Invalid Username or Password";
      }
    }
    if (errorMessage == "") {
      openSignInModal = false;
    }
    email = "";
    password = "";
    confirmPass = "";
  }
  async function submitLogin() {
    if (password == "") {
      return;
    }
    if (email == "") {
      return;
    } else
      try {
        await loginWithEmail(email, password);
      } catch (err) {
        errorMessage = "Invalid Username or Password";
      }
    if (errorMessage == "") {
      openSignInModal = false;
    }
    password = "";
    email = "";
  }
  function signInWithEmailAndPassword() {
    clickedButton = !clickedButton;
    clickedButton2 = false;
  }
  function createWithEmailAndPassword() {
    clickedButton2 = !clickedButton2;
    clickedButton = false;
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
            <input type="password" bind:value={password} placeholder="Enter Password" name="password" required />
          </div>
        </div>
        <div class="formButton">
          <button type="submit">Login</button>
        </div>
      </form>
    {/if}
    <button on:click={createWithEmailAndPassword}>Create Account</button>
    {#if clickedButton2}
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
        <div class="formButton">
          <button type="submit">Create Account</button>
        </div>
      </form>
    {/if}
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
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
