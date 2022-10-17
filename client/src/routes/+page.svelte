<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
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
      // fixed error because it would try to look for the display name of a user that doesn't exist
      if (userData !== undefined) {
        // assign name from database to name variable
        if (userData.displayName !== "") {
          name = userData.displayName;
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
      <input type="text" placeholder="Enter in your display name" bind:value={name} />
      <button on:click={createLobbyHandler}>Create Lobby</button>
      <button on:click={joinLobbyHandler}>Join Lobby</button>
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
