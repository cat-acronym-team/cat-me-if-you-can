<script lang="ts">
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import Mdi from "$components/Mdi.svelte";
  import { mdiAccountCircle, mdiEmail, mdiEye, mdiEyeOff } from "@mdi/js";
  import { authStore as user } from "$stores/auth";
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail, logOut, createUser } from "$lib/firebase/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import ProviderButtons from "./ProviderButtons.svelte";

  export let userData: UserData | undefined;
  let showSignInDialog = false;
  let menu: Menu;
  let email = "";
  let password = "";
  let selectedForm: "SIGN_IN" | "SIGN_UP" | "NONE" = "NONE";
  let showPassword = false;
  let errorMessage: string = "";

  function getErrorMsg(error: unknown): string {
    console.error(error);
    let errorMsg = error instanceof Error ? error.message : String(error);
    switch (errorMsg) {
      case "Firebase: Error (auth/user-not-found).":
        return "The email you entered is not registered, please create an account.";
      case "Firebase: Error (auth/popup-closed-by-user).":
        return "canceled by user";
      case "Firebase: Error (auth/wrong-password).":
        return "Incorrect Password.";
      default:
        return errorMsg;
    }
  }

  async function createAccount() {
    try {
      await createUser(email, password);
      errorMessage = "";
    } catch (err) {
      errorMessage = getErrorMsg(err);
      return;
    }
    selectedForm = "NONE";
    showSignInDialog = false;
    email = "";
    password = "";
  }
  async function submitLogin() {
    try {
      await loginWithEmail(email, password);
      errorMessage = "";
    } catch (err) {
      errorMessage = getErrorMsg(err);
      return;
    }
    selectedForm = "NONE";
    showSignInDialog = false;
    password = "";
    email = "";
  }
  function signInDropDown() {
    errorMessage = "";
    selectedForm = "SIGN_IN";
  }
  function createAccountDropDown() {
    errorMessage = "";
    selectedForm = "SIGN_UP";
  }
  async function googleLogin() {
    try {
      await loginWithGoogle();
      errorMessage = "";
    } catch (err) {
      errorMessage = getErrorMsg(err);
      return;
    }
    selectedForm = "NONE";
    showSignInDialog = false;
  }

  async function microsoftLogin() {
    try {
      await loginWithMicrosoft();
      errorMessage = "";
    } catch (err) {
      errorMessage = getErrorMsg(err);
      return;
    }
    selectedForm = "NONE";
    showSignInDialog = false;
  }
</script>

<!-- Sign In Modal -->
<Dialog bind:open={showSignInDialog} aria-labelledby="signin-dialog-title" aria-describedby="signin-dialog-content">
  <Header>
    <Title id="signin-dialog-title">Sign In</Title>
  </Header>
  <Content id="signin-dialog-content">
    <!-- TODO: Sign In Modal Content Here -->
    <div class="buttons">
      <ProviderButtons on:google-clicked={googleLogin} on:microsoft-clicked={microsoftLogin} />
      <Button id="sign-in-with-email" variant="raised" on:click={signInDropDown}>
        <Mdi path={mdiEmail} />
        <Label>Sign in with email</Label>
      </Button>
      <Button id="sign-up-with-email" variant="raised" on:click={createAccountDropDown}>
        <Mdi path={mdiEmail} />
        <Label>Sign up with email</Label>
      </Button>
      {#if selectedForm != "NONE"}
        <form on:submit|preventDefault={selectedForm == "SIGN_IN" ? submitLogin : createAccount}>
          <Textfield label="Email" type="email" bind:value={email} required input$autocomplete="username" />
          <Textfield
            label="Password"
            type={showPassword ? "text" : "password"}
            bind:value={password}
            required
            input$autocomplete={selectedForm == "SIGN_IN" ? "current-password" : "new-password"}
          >
            <IconButton
              type="button"
              on:click={(event) => event.preventDefault()}
              slot="trailingIcon"
              toggle
              bind:pressed={showPassword}
              aria-label="show password"
            >
              <Mdi path={mdiEye} on />
              <Mdi path={mdiEyeOff} />
            </IconButton>
          </Textfield>
          {#if errorMessage !== ""}
            <p class="error">{errorMessage}</p>
          {/if}
          <Button type="submit">
            <Label>{selectedForm == "SIGN_IN" ? "Sign In" : "Sign Up"}</Label>
          </Button>
        </form>
      {/if}
    </div>
  </Content>
</Dialog>
<div class="account-container">
  <!-- If you are not signed in show this  -->
  {#if $user == null}
    <Button on:click={() => (showSignInDialog = true)}><Label>Sign In</Label></Button>
    <!-- If you show account and dropdown -->
  {:else}
    <IconButton on:click={() => menu.setOpen(true)} aria-label="account"><Mdi path={mdiAccountCircle} /></IconButton>
    <Menu bind:this={menu}>
      <List>
        <Item tag="a" href="/settings"><Text>Account Settings</Text></Item>
        {#if userData != undefined}
          <Item tag="a" href="/stats?user={$user.uid}"><Text>Stats</Text></Item>
        {/if}
        <Separator />
        <Item on:SMUI:action={logOut}><Text>Logout</Text></Item>
      </List>
    </Menu>
  {/if}
</div>

<style>
  .account-container {
    position: relative;
    display: inline-block;
  }

  :global(#sign-in-with-email),
  :global(#sign-up-with-email) {
    --mdc-typography-button-text-transform: none;
    justify-content: start;
    gap: 4px;
  }

  .buttons {
    display: grid;
    justify-content: center;
    gap: 12px;
  }

  form {
    display: grid;
    gap: 12px;
  }
</style>
