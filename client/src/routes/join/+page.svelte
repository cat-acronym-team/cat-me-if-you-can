<script lang="ts">
  import { auth } from "$lib/firebase/app";
  import { onMount } from "svelte";
  import { findAndJoinLobby } from "$lib/firebase/join-lobby";
  import SigninPopup from "$components/SigninPopup.svelte";
  import { getUser } from "$lib/firebase/splash";
  import type { UserData } from "$lib/firebase/firestore-types/users";

  // get current user
  const { currentUser } = auth;
  let isAnon: boolean = false;
  let code: string;

  // check if they're a anon user
  // POTENTIAL PROBLEM: what if a user that already have a account isn't signed in but clicked the link
  onMount(async () => {
    if (currentUser === null) {
      isAnon = true;
    }
  });

  const joinLobby = async () => {
    // get the user doc
    if (currentUser === null) {
      return;
    }

    const { displayName, avatar } = (await getUser(currentUser.uid)) as UserData;
    findAndJoinLobby(code, {
      displayName,
      avatar,
      uid: currentUser.uid,
    });
  };
</script>

<!-- If they're anon user then show popup -->
{#if isAnon}
  <SigninPopup open={isAnon} />
{/if}
<!-- If not then show regular page -->
<div class="cat-join-container">
  <h2>Join Lobby!</h2>
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
