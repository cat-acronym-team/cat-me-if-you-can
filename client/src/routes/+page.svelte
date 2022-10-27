<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import { getUser, saveOrCreate } from "$lib/firebase/splash";
  import { createLobby } from "$lib/firebase/create-lobby";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { goto } from "$app/navigation";
  import { authStore } from "$stores/auth";

  let userData: UserData | undefined;
  // check if the user is logged in with getAuth
  let name: string = "";

  // update user once auth store changes
  $: user = $authStore;
  // this function will find user if the auth isnt null
  async function findUser() {
    if (user !== null) {
      userData = await getUser(user.uid);
      // if they have a user doc
      if (userData !== undefined) {
        // assign name from database to name variable
        if (userData.displayName !== "") {
          name = userData.displayName;
        }
      } 
      // if they dont have a user doc and used sign in with google/microsoft
      else {
        if (user.displayName !== null) {
          name = user.displayName;
        }
      }
    }
  }
  // will call the above function if the user isn't null
  $: if (user !== null) {
    findUser();
  }

  const createLobbyHandler = async () => {
    if (name === "") {
      return;
    }
    // Create User
    await saveOrCreate(user, userData, name);
    // Create Lobby
    const code = await createLobby(name);
    // Go to game page
    goto("/game?code=" + code);
  };
  const joinLobbyHandler = async () => {
    if (name === "") {
      return;
    }
    // Create User
    await saveOrCreate(user, userData, name);
    // go to join page
    goto("/join");
  };
</script>

<header class="cat-main-header">
  <div class="header-first-level">
    <SigninButton />
  </div>
</header>

<main class="cat-main-container">
  <div class="cat-main">
    <div class="logo-container">
      <img src="https://picsum.photos/500/300" alt="our logo" />
    </div>
    <div class="cat-main-buttons">
      <Textfield type="text" label="Display name" bind:value={name} />
      <Button on:click={createLobbyHandler}><Label>Create Lobby</Label></Button>
      <Button on:click={joinLobbyHandler}><Label>Join Lobby</Label></Button>
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

  /* Tablet Styles */
  @media only screen and (min-width: 700px) {
    .logo-container {
      width: 40%;
    }
  }
  /* Desktop Styles */
  @media only screen and (min-width: 1000px) {
    .logo-container {
      width: 20%;
    }
    .cat-main-buttons {
      width: 35%;
    }
  }
</style>
