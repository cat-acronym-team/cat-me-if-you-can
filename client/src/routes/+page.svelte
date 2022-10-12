<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
  import { saveDisplayName, getUser, createUser } from "$lib/firebase/splash";
  import { createLobby } from "$lib/firebase/create-lobby";
  import { loginAnonymous } from "$lib/firebase/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { onMount } from "svelte";
  import { getAuth } from "firebase/auth";
  import { goto } from "$app/navigation";

  const auth = getAuth();
  let user = auth.currentUser;
  let name: string = "";
  // get name from database
  onMount(async () => {
    if (user !== null) {
      const { displayName } = (await getUser(user.uid)) as UserData;
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

    goto("/game?code=" + code);
  };
  const JoinLobbyHandler = async () => {
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
      <input type="text" placeholder="Enter in your display name" on:change={saveName} bind:value={name} />
      <button on:click={createLobbyHandler}>Create Lobby</button>
      <button on:click={JoinLobbyHandler}>Join Lobby</button>
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
