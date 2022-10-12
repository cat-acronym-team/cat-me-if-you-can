<script lang="ts">
  import Modal from "$components/Modal.svelte";
  import { saveDisplayName, getUser, createUser } from "$lib/firebase/splash";
  import { createLobby } from "$lib/firebase/create-lobby";
  import { loginAnonymous } from "$lib/firebase/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/app";
  import { goto } from "$app/navigation";

  let user = auth.currentUser;
  let userData: UserData | undefined;
  // check if the user is logged in with getAuth
  let openSignInModal = false;
  let name: string = "";
  // get name from database
  onMount(async () => {
    if (user !== null) {
      userData = await getUser(user.uid);
      // fixed error because it would try to look for the display name of a user that doesn't exist
      if (userData !== undefined) {
        // assign name from database to name variable
        if (userData.displayName !== "") {
          name = userData.displayName;
        }
      }
    }

    // if no name then it is empty
  });

  /* 
  Is called once user unfocuses the display name input field. It was 
  created to avoid excessive writes to the database with the onchange event.
  

  removes user logic from buttons
  when the user enters their display name

  there are three type of situations that could happen
  1. A Anon User without User Doc 
    - create anon user and create user doc with display name
  2. A User without User Doc
    - create user doc with display name
  3. A User with User Doc
    - just update their display name
  */
  const saveOrCreate = async () => {
    // this is an anon user
    // create anon user and user doc with display name
    if (user === null && userData === undefined) {
      const anon = (await loginAnonymous()).user;
      createUser(anon.uid, name);
    }
    // this is a user without user doc
    // create user doc with display name
    if (user !== null && userData === undefined) {
      createUser(user.uid, name);
    }
    // this is user with a user doc
    // just update their current display name
    if (user !== null && userData !== undefined) {
      saveDisplayName(user.uid, name);
    }
  };
  const createLobbyHandler = () => {
    if (name === "") {
      return;
    }
    // Create User
    // Used then and catch to force create lobby to wait for the user promise to resolve to create the lobby
    // Trying to solve the race condition concern
    saveOrCreate()
      .then(() => {
        // Create Lobby
        return createLobby();
      })
      .then((code) => {
        goto("/game/" + code);
      });
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
      <img src="https://picsum.photos/500/300" alt="our logo" />
    </div>
    <div class="cat-main-buttons">
      <input type="text" placeholder="Enter in your display name" bind:value={name} />
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
