<script lang="ts">
  import Modal from "./Modal.svelte";
  import { authStore as user } from "$stores/auth";
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail } from "$lib/firebase/auth";

  // check if the user is logged in with getAuth
  let openSignInModal = false;
  let password = "";
  let email = "";
  let clickedButton = false;
  function submitLogin() {
    if (password == "") {
      return;
    }
    if (email == "") {
      return;
    }
    loginWithEmail(email, password);
  }
  function clickedEmailButton() {
    clickedButton = !clickedButton;
  }
</script>

<!-- Sign In Modal -->
<Modal open={openSignInModal}>
  <!-- TODO: Sign In Modal Content Here -->

  <div class="container">
    <div class="google">
      <button id="google-button" on:click={loginWithGoogle}>sign in with google</button>
    </div>
    <div class="microsoft">
      <button id="microsoft-button" on:click={loginWithMicrosoft}>sign in with Microsoft</button>
    </div>
    <div class="email">
      <button class="" on:click={clickedEmailButton}>Sign In</button>
      {#if clickedButton}
        <form class="formContainer" on:submit|preventDefault={submitLogin}>
          <div class="formGroup">
            <label for="email"><b>Email</b></label>
            <input type="text" bind:value={email} placeholder="Enter Username" name="email" required />
          </div>
          <div class="formGroup">
            <label for="password"><b>Password</b></label>
            <input type="text" bind:value={password} placeholder="Enter Password" name="password" required />
          </div>
          <button type="submit">Login</button>
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
        <a href="/stats">Stats</a>
        <a href="/logout">Logout</a> -->
    </div>
  {/if}
</div>

<style>
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
    width: 25%;
    height: 50px;
    margin-top: 10px;
  }

  .formContainer {
    display: flex;
    width: 80%;
    margin: auto;
    margin-top: 20px;
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
</style>
