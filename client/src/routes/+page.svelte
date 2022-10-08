<script lang="ts">
  import Modal from "$components/Modal.svelte";
  import { saveDisplayName, getDisplayName, createUser } from "$lib/firebase/splash";
  import { createLobby } from "$lib/firebase/create-lobby";
  import { loginAnonymous } from "$lib/firebase/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { onMount } from "svelte";
  import { getAuth } from "firebase/auth";
  import { goto } from "$app/navigation";

  const auth = getAuth();
  let user = auth.currentUser;
  // check if the user is logged in with getAuth
  let openSignInModal = false;
  let name: string = "";
  // get name from database
  onMount(async () => {
    if (user !== null) {
      const { displayName } = (await getDisplayName(user.uid)) as UserData;
      // assign name from database to name variable
      if (displayName !== "") {
        name = displayName;
      }
    }

    // if no name then it is empty
  });
  const saveName = () => {
    if (user !== null && name !== "") {
      saveDisplayName(user.uid, name);
    }
  };
  const createLobbyHandler = async () => {
    if (name === "") {
      return;
    }
    // if user is null create anon user
    // then create a document with the id of the anon user if it doesn't exist create one
    if (user === null) {
      user = (await loginAnonymous()).user;
    }
    // creates user doc for any user or overwrite if it already exist
    createUser(user.uid, name);

    const code = (await createLobby()) as string;

    goto("/game/" + code);
  };
</script>

<!-- Sign In Modal -->
<Modal
  open={openSignInModal}
  onClosed={() => {
    openSignInModal = false;
  }}
>
  <!-- TODO: Sign In Modal Content Here -->
</Modal>
<header class="cat-main-header">
  <div class="header-first-level">
    <div class="account-container">
      <!-- If you are not signed in show this  -->
      {#if user == null}
        <button
          on:click={() => {
            openSignInModal = true;
          }}
          class="account-signin">Sign in</button
        >
        <!-- If you show account and dropdown -->
      {:else}
        <button class="account-account">Account</button>
        <!-- Hover doesn't work on mobile -->
        <div class="account-content">
          <!-- TODO: Account Hover Links -->
          <!-- <a href="/settings">Account Settings</a>
        <a href="/stats">Stats</a>
        <a href="/logout">Logout</a> -->
        </div>
      {/if}
    </div>
  </div>
</header>

<main class="cat-main-container">
  <div class="cat-main">
    <div class="logo-container">
      <img src="https://cataas.com/cat/says/hello%20world!" alt="our logo" />
    </div>
    <div class="cat-main-buttons">
      <input type="text" placeholder="Enter in your display name" on:change={saveName} bind:value={name} />
      <button on:click={createLobbyHandler}>Create Lobby</button>
      <button>Join Lobby</button>
    </div>
  </div>
</main>

<style>
  /* Phone Styles */
  .cat-main-header {
    width: 100%;
  }
  .header-first-level {
    width: 100%;
    display: flex;
    justify-content: right;
    align-items: center;
  }
  .account-signin {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-container {
    position: relative;
    display: inline-block;
  }
  .account-account {
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

  .logo-container {
    width: 50%;
    margin: auto;
  }
  .logo-container img {
    width: 100%;
  }
  .cat-main-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 70%;
  }
  .cat-main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin-top: auto;
    margin-bottom: auto;
  }
  .cat-main-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70%;
    margin: auto;
  }
  .cat-main-buttons input {
    width: 100%;
    height: 25px;
    text-align: center;
  }
  .cat-main-buttons button {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    margin-top: 20px;
    background-color: #151515;
    color: red;
    width: 100%;
    height: 45px;
  }
  /* Tablet Styles */
  @media only screen and (min-width: 700px) {
    .account-container {
      margin-right: 10px;
    }
    .logo-container {
      width: 40%;
    }
    .cat-main-buttons input {
      height: 35px;
      font-size: 1.4em;
    }
    .cat-main-buttons a {
      height: 50px;
      font-size: 1.4em;
    }
  }
  /* Desktop Styles */
  @media only screen and (min-width: 1000px) {
    .question-container {
      width: 3%;
    }
    .logo-container {
      width: 20%;
    }
    .cat-main-buttons {
      width: 35%;
    }
    .cat-main-buttons a {
      height: 60px;
    }
  }
</style>
