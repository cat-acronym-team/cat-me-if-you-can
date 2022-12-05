<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { getUser, saveOrCreate } from "$lib/firebase/splash";
  import { createLobby } from "$lib/firebase/firebase-functions";
  import { displayNameValidator, type UserData } from "$lib/firebase/firestore-types/users";
  import { goto } from "$app/navigation";
  import { authStore } from "$stores/auth";

  let userData: UserData | undefined;

  let name: string = "";
  let nameDirty: boolean = false;
  $: nameValidation = displayNameValidator(name);

  let errorMessage: string = "";

  /**
   * variable that will be set true if the corresponding function has no errors thrown
   * this will then allow the button to be pressed again if there is an error thrown
   */
  let waiting: boolean = false;

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
          nameDirty = true;
        }
      }
    }
  }
  // will call the above function if the user isn't null
  $: if (user !== null) {
    findUser();
  }

  async function createLobbyHandler() {
    waiting = true;
    try {
      // Create User
      await saveOrCreate(user, userData, name.trim());
      // Create Lobby
      const response = await createLobby();
      // go to game page
      goto("/game?code=" + response.data.code);
    } catch (err) {
      waiting = false;
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
  async function joinLobbyHandler() {
    waiting = true;
    try {
      // Create User
      await saveOrCreate(user, userData, name.trim());
      // go to join page
      goto("/join");
    } catch (err) {
      waiting = false;
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<header>
  <SigninButton {userData} />
</header>

<main class="cat-main-container">
  <div class="cat-main">
    <div class="logo-container">
      <img src="/images/banner.webp" alt="" />
    </div>
    <div class="cat-main-buttons">
      {#if errorMessage !== ""}
        <p class="error">{errorMessage}</p>
      {/if}
      <Textfield
        type="text"
        label="Display name"
        bind:value={name}
        bind:dirty={nameDirty}
        invalid={nameDirty && !nameValidation.valid}
        required
      >
        <HelperText validationMsg slot="helper">{nameValidation.valid ? "" : nameValidation.reason}</HelperText>
      </Textfield>
      <Button on:click={createLobbyHandler} disabled={!nameValidation.valid || waiting}>
        <Label>Create Lobby</Label>
      </Button>
      <Button on:click={joinLobbyHandler} disabled={!nameValidation.valid || waiting}>
        <Label>Join Lobby</Label>
      </Button>
    </div>
  </div>
</main>

<style>
  /* Phone Styles */
  header {
    height: 64px;
    display: flex;
    justify-content: right;
    align-items: center;
    padding-right: 16px;
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
