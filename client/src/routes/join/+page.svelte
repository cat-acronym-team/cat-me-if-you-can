<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
  import { authStore as user } from "$stores/auth";
  import { findAndJoinLobby } from "$lib/firebase/join-lobby";
  import { saveOrCreate } from "$lib/firebase/splash";
  import { getUser } from "$lib/firebase/splash";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import type { User } from "firebase/auth";

  let name: string = "";
  let userData: UserData | undefined;
  let errorMessage: string = "";
  let queryCode: string | null;
  let code: string = "";

  // Checks to see if the join page has the code query paramter
  onMount(async () => {
    if ("errorMessage" in history.state) {
      const { errorMessage: stateError } = history.state;
      errorMessage = stateError;
      // do this to remove the errorMessage property in state
      goto("/join", { replaceState: true });
    }
    // gets code from url search
    queryCode = $page.url.searchParams.get("code");

    // sets it the code var for two way binding
    if (queryCode !== null) {
      code = queryCode;
    }
  });
  async function joinLobby() {
    try {
      await saveOrCreate($user, userData, name.trim());
      // get the current user info
      const { displayName, avatar } = (await getUser(($user as User).uid)) as UserData;
      // enter lobby with the user's info
      await findAndJoinLobby(code, {
        displayName,
        avatar,
        uid: ($user as User).uid,
      });
      // go to game page
      goto(`/game?code=${code}`);
    } catch (err) {
      // if the lobby doesn't exist then error is thrown
      errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage == "You are already in the lobby!") {
        goto(`/game?code=${code}`);
      }
      // this checks if the query code is set
      // fixes the issue of the code going empty after an error
      if (queryCode === undefined) {
        code = "";
      }
    }
  }

  // this function will find user if the auth isnt null
  async function findUser() {
    if ($user !== null) {
      userData = await getUser($user.uid);
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
  $: if ($user !== null) {
    findUser();
  }
</script>

<!-- If not then show regular page -->
<nav class="temp-nav">
  <SigninButton />
</nav>
<div class="cat-join-container">
  <h2>Join Lobby!</h2>
  {#if errorMessage !== ""}
    <p style="color:red;">{errorMessage}</p>
  {/if}
  <form on:submit|preventDefault={joinLobby}>
    <input type="text" placeholder="Enter in your display name" bind:value={name} />
    <input bind:value={code} />
    <button type="submit" placeholder="Enter the lobby code" disabled={name === "" || code === ""}>Join</button>
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
