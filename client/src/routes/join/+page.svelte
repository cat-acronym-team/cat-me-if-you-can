<script lang="ts">
  import SigninButton from "$components/SigninButton.svelte";
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { authStore as user } from "$stores/auth";
  import { findAndJoinLobby } from "$lib/firebase/join-lobby";
  import { saveOrCreate } from "$lib/firebase/splash";
  import { getUser } from "$lib/firebase/splash";
  import { displayNameValidator, type UserData } from "$lib/firebase/firestore-types/users";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let userData: UserData | undefined;
  let errorMessage: string = "";
  let queryCode: string | null;

  let name: string = "";
  let nameDirty: boolean = false;
  $: nameValidation = displayNameValidator(name);

  let code: string = "";
  let codeDirty: boolean = false;
  $: codeValidation = lobbyCodeValidator(code);

  /**
   * variable that will be set true if the corresponding function has no errors thrown
   * this will then allow the button to be pressed again if there is an error thrown
   */

  let waiting: boolean = false;

  function lobbyCodeValidator(code: string): { valid: true } | { valid: false; reason: string } {
    if (code.length === 0) {
      return { valid: false, reason: "Please enter a lobby code" };
    }
    if (!/^[a-zA-Z]+$/.test(code)) {
      return { valid: false, reason: "Lobby code can only contain letters" };
    }
    if (code.length !== 6) {
      return { valid: false, reason: "Lobby code must be 6 letters" };
    }
    return { valid: true };
  }

  // Checks to see if the join page has the code query paramter
  onMount(() => {
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
      codeDirty = true;
      code = queryCode;
    }
  });

  async function joinLobby() {
    code = code.toLowerCase();
    waiting = true;
    try {
      await saveOrCreate($user, userData, name.trim());
      // enter lobby with the user's info
      await findAndJoinLobby(code);
      // go to game page
      goto(`/game?code=${code}`);
    } catch (err) {
      waiting = false;
      // if the lobby doesn't exist then error is thrown
      errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage == "You are already in the lobby!") {
        waiting = true;
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

<header>
  <SigninButton {userData} />
</header>

<div class="cat-join-container">
  <h2 class="mdc-typography--headline2">Join Lobby!</h2>
  {#if errorMessage !== ""}
    <p class="error">{errorMessage}</p>
  {/if}
  <form
    on:submit|preventDefault={joinLobby}
    >
    <div>
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
    <div>
      <Textfield
        type="text"
        label="Lobby code"
        bind:value={code}
        bind:dirty={codeDirty}
        invalid={codeDirty && !codeValidation.valid}
        input$autocapitalize="none"
        on:input={() => (code = code.toLowerCase())}
        required
      >
        <HelperText validationMsg slot="helper">{codeValidation.valid ? "" : codeValidation.reason}</HelperText>
      </Textfield>
    </div>
    <Button disabled={!nameValidation.valid || !codeValidation.valid || waiting}>
      <Label>Join</Label>
    </Button>
  </form>
</div>

<style>
  header {
    height: 64px;
    display: flex;
    justify-content: right;
    align-items: center;
    padding-right: 16px;
  }

  .cat-join-container {
    width: 60%;
    margin: auto;
    text-align: center;
  }

  form {
    display: grid;
    place-items: center;
    gap: 12px;
  }

  @media only screen and (min-width: 1000px) {
    .cat-join-container {
      width: 30%;
    }
  }
</style>
