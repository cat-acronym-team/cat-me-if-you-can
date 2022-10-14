<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
  import { auth } from "$lib/firebase/app";
  import { findAndJoinLobby } from "$lib/firebase/join-lobby";
  import { getUser, saveDisplayName, createUser } from "$lib/firebase/splash";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { loginAnonymous } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let name: string = "";
  let { currentUser } = auth;
  let error = {
    status: false,
    message: "",
  };
  let code: string;

  // Checks to see if the join page has the code query paramter
  onMount(() => {
    const queryCode = $page.url.search.split("=")[1];
    // sets it the code var for two way binding
    if (queryCode !== undefined) {
      code = queryCode;
    }
  });

  const joinLobby = async () => {
    // If current user is null, give them an anonymous account
    if (currentUser === null) {
      currentUser = (await loginAnonymous()).user;
      await createUser(currentUser.uid, name);
    }
    // get the current user info
    const { displayName, avatar } = (await getUser(currentUser.uid)) as UserData;
    try {
      // enter lobby with the user's info
      await findAndJoinLobby(code, {
        displayName,
        avatar,
        uid: currentUser.uid,
      });
      // go to game page
      goto(`/game?=${code}`);
    } catch (err: any) {
      // if the lobby doesn't exist then error is thrown
      error = {
        status: true,
        message: err.message,
      };
      code = "";
    }
  };
</script>

<!-- If not then show regular page -->
<nav class="temp-nav">
  <SigninButton />
</nav>
<div class="cat-join-container">
  <h2>Join Lobby!</h2>
  {#if error.status}
    <p style="color:red;">{error.message}</p>
  {/if}
  <form on:submit|preventDefault={joinLobby}>
    {#if currentUser === null}
      <input type="text" placeholder="Enter in your display name" bind:value={name} />
    {/if}
    <input bind:value={code} />
    <button type="submit" placeholder="Enter the lobby code">Join</button>
  </form>
</div>

<style>
  .temp-nav {
    display: flex;
    justify-content: right;
  }
  .cat-join-container {
    width: 60%;
    margin: auto;
    text-align: center;
  }
  .cat-join-container input {
    margin-top: 5px;
    width: 100%;
    height: 35px;
    text-align: center;
  }
  .cat-join-container button {
    margin-top: 10px;
    border: 0;
    width: 50%;
    height: 25px;
  }

  @media only screen and (min-width: 1000px) {
    .cat-join-container {
      width: 30%;
    }
  }
</style>
