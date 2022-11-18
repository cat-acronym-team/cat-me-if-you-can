<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import { authStore as user } from "$stores/auth";
  import { createUser, loginWithEmail, loginWithGoogle, loginWithMicrosoft, logOut } from "$lib/firebase/auth";
  import type { UserData } from "$lib/firebase/firestore-types/users";
  import ProviderButtons from "./ProviderButtons.svelte";

  export let userData: UserData | undefined;
  let showSignInDialog = false;
  let menu: Menu;
  let errorMessage: string = "";
  let selectedForm: "SIGN_IN" | "SIGN_UP" | "NONE" = "NONE";
  let email: string = "";
  let password: string = "";
  let showPassword: boolean = false;
  let compLocation = "sign-in";

  function outputErrorMessage() {
    switch (errorMessage) {
      case "Firebase: Error (auth/user-not-found).":
        errorMessage = "The email you entered is not registered, please create an account.";
        return;
      case "Firebase: Error (auth/popup-closed-by-user).":
        errorMessage = "";
        return;
      case "Firebase: Error (auth/wrong-password).":
        errorMessage = "Incorrect Password.";
        return;
      default:
        return;
    }
  }

  async function googleLogin() {
    try {
      await loginWithGoogle();
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
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
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
      return;
    }
    selectedForm = "NONE";
    showSignInDialog = false;
  }

  async function createAccount() {
    try {
      await createUser(email, password);
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
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
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
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
</script>

<!-- Sign In Modal -->
<Dialog bind:open={showSignInDialog} aria-labelledby="signin-dialog-title" aria-describedby="signin-dialog-content">
  <Header>
    <Title id="signin-dialog-title">Sign In</Title>
  </Header>
  <Content id="signin-dialog-content">
    <ProviderButtons
      bind:errorMessage
      bind:selectedForm
      bind:email
      bind:password
      bind:showPassword
      bind:compLocation
      on:googleClicked={googleLogin}
      on:microsoftClicked={microsoftLogin}
      on:createAccountClicked={createAccount}
      on:submitLoginClicked={submitLogin}
      on:signInDropDownClicked={signInDropDown}
      on:createAccountDropDownClicked={createAccountDropDown}
    />
  </Content>
</Dialog>
<div class="account-container">
  <!-- If you are not signed in show this  -->
  {#if $user == null}
    <Button on:click={() => (showSignInDialog = true)}><Label>Sign in</Label></Button>
    <!-- If you show account and dropdown -->
  {:else}
    <Button on:click={() => menu.setOpen(true)}><Label>Account</Label></Button>
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
</style>
