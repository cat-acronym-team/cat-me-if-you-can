<script lang="ts">
  import AccountButton from "$components/AccountButton.svelte";
  import Header from "$components/Header.svelte";
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { getUser, saveOrCreate } from "$lib/firebase/splash";
  import { createLobby } from "$lib/firebase/firebase-functions";
  import { displayNameValidator, type UserData } from "$lib/firebase/firestore-types/users";
  import { goto } from "$app/navigation";
  import { authStore } from "$stores/auth";
  import { analytics } from "$lib/firebase/app";
  import { logEvent } from "firebase/analytics";

  let userData: UserData | undefined;

  let name: string = "";
  let nameDirty: boolean = false;
  $: nameValidation = displayNameValidator(name.trim());

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

      // log lobbies created
      logEvent(analytics, "lobby-creation");

      // go to game page
      goto("/game?code=" + response.data.code);
    } catch (err) {
      waiting = false;
      console.error(err);
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
      console.error(err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<Header>
  <AccountButton slot="top-right" {userData} />
</Header>

<main>
  <img
    class="banner"
    srcset="/banner-small.webp 1013w, /banner.webp 2026w"
    sizes="(max-aspect-ratio: 8/5) 50vw, 80vh"
    src="/banner.webp"
    alt=""
  />
  <h1 class="mdc-typography--headline1">Cat Me If You Can</h1>
  <div class="form">
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
    {/if}
    <div class="textbox">
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
    </div>
    <div class="buttons">
      <Button on:click={createLobbyHandler} disabled={!nameValidation.valid || waiting} variant="raised">
        <Label>Create Lobby</Label>
      </Button>
      <Button on:click={joinLobbyHandler} disabled={!nameValidation.valid || waiting} variant="raised">
        <Label>Join Lobby</Label>
      </Button>
    </div>
  </div>
</main>

<style>
  main {
    box-sizing: border-box;
    display: grid;
    justify-items: center;
    grid-template-rows: auto auto 1fr;
    height: 100%;
    gap: 12px;
    --scale: min(calc(5vw + 12px), max(8vh, 16px));
    padding: 16px;
    padding-top: 80px;
  }

  .banner {
    width: min(100%, calc(var(--scale) * 10));
  }

  h1 {
    margin: 0;
    padding: 0;
    font-size: var(--scale);
    line-height: var(--scale);
  }

  .form {
    display: grid;
    gap: 16px;
    justify-items: center;
    align-content: center;
  }

  .textbox {
    width: 200px;
    display: grid;
  }

  .buttons {
    display: grid;
    gap: inherit;
  }
</style>
