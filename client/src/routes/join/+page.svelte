<script lang="ts">
  import { auth } from "$lib/firebase/app";
  import { onMount } from "svelte";
  import { findAndJoinLobby } from "$lib/firebase/join-lobby";
  import SigninPopup from "$components/SigninPopup.svelte";
  import { getUser } from "$lib/firebase/splash";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { goto } from "$app/navigation";

  // get current user
  const { currentUser } = auth;
  let isAnon: boolean = false;
  let error = {
    status: false,
    message: "",
  };
  let code: string;

  // check if they're a anon user
  // POTENTIAL PROBLEM: what if a user that already have a account isn't signed in but clicked the link
  onMount(async () => {
    if (currentUser === null) {
      isAnon = true;
    }
  });

  const joinLobby = async () => {
    if (currentUser === null) {
      return;
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
      goto(`/game/${code}`);
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

<!-- If they're anon user then show popup -->
{#if isAnon}
  <SigninPopup open={isAnon} />
{/if}
<!-- If not then show regular page -->
<div class="cat-join-container">
  <h2>Join Lobby!</h2>
  {#if error.status}
    <p style="color:red;">{error.message}</p>
  {/if}
  <form on:submit|preventDefault={joinLobby}>
    <input bind:value={code} />
    <button type="submit">Join</button>
  </form>
</div>

<style>
  .cat-join-container {
    width: 60%;
    margin: auto;
    text-align: center;
  }
  .cat-join-container input {
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
