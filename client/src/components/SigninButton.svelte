<script lang="ts">
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import { Svg, Icon } from "@smui/common";
  import { authStore as user } from "$stores/auth";
  import { loginWithGoogle, loginWithMicrosoft, loginWithEmail, logOut, createUser } from "$lib/firebase/auth";

  let showSignInDialog = false;
  let menu: Menu;
  let email = "";
  let password = "";
  let confirmPass = "";
  let signInButton = false;
  let createAccountButton = false;
  let errorMessage: string = "";

  function clearFields() {
    email = "";
    password = "";
    confirmPass = "";
  }
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

  async function createAccount() {
    if (password != confirmPass) {
      password = "";
      confirmPass = "";
      errorMessage = "Passwords do not match";
      return;
    }
    try {
      await createUser(email, password);
      errorMessage = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      outputErrorMessage();
      return;
    }
    createAccountButton = false;
    showSignInDialog = false;
    email = "";
    password = "";
    confirmPass = "";
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
    signInButton = false;
    showSignInDialog = false;
    password = "";
    email = "";
  }
  function signInDropDown() {
    errorMessage = "";
    signInButton = !signInButton;
    createAccountButton = false;
  }
  function createAccountDropDown() {
    errorMessage = "";
    createAccountButton = !createAccountButton;
    signInButton = false;
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
    showSignInDialog = false;
  }

  const googleSvgPaths: { color: string; path: string }[] = [
    {
      color: "#EA4335",
      path: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z",
    },
    {
      color: "#4285F4",
      path: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z",
    },
    {
      color: "#FBBC05",
      path: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z",
    },
    {
      color: "#34A853",
      path: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z",
    },
  ];
</script>

<!-- Sign In Modal -->
<Dialog bind:open={showSignInDialog} aria-labelledby="signin-dialog-title" aria-describedby="signin-dialog-content">
  <Header>
    <Title id="signin-dialog-title">Sign In</Title>
  </Header>
  <Content id="signin-dialog-content">
    <!-- TODO: Sign In Modal Content Here -->
    <div class="buttons">
      <Button id="sign-in-with-google" variant="raised" on:click={googleLogin}>
        <Icon component={Svg} viewBox="0 0 48 48">
          {#each googleSvgPaths as path}
            <path fill={path.color} d={path.path} />
          {/each}
        </Icon>
        <Label>Sign in with Google</Label>
      </Button>
      <Button id="sign-in-with-microsoft" variant="raised" on:click={microsoftLogin}>
        <Icon component={Svg} viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </Icon>
        <Label>Sign in with Microsoft</Label>
      </Button>
      <Button id="sign-in-with-email" variant="raised" on:click={signInDropDown} on:click={clearFields}>
        <Icon class="material-icons">email</Icon>
        <Label>Sign in with email</Label>
      </Button>
      {#if signInButton}
        <form on:submit|preventDefault={submitLogin}>
          <Textfield label="Email" type="email" bind:value={email} required />
          <Textfield label="Password" type="password" bind:value={password} required />
          {#if errorMessage !== ""}
            <p class="error">{errorMessage}</p>
          {/if}
          <Button type="submit">
            <Label>Sign In</Label>
          </Button>
        </form>
      {/if}
      <Button id="sign-up-with-email" variant="raised" on:click={createAccountDropDown} on:click={clearFields}>
        <Icon class="material-icons">email</Icon>
        <Label>Sign up with email</Label>
      </Button>
      {#if createAccountButton}
        <form on:submit|preventDefault={createAccount}>
          <Textfield label="Email" type="email" bind:value={email} required />
          <Textfield label="Password" type="password" bind:value={password} required />
          <Textfield label="Confirm Password" type="password" bind:value={confirmPass} required />
          {#if errorMessage !== ""}
            <p class="error">{errorMessage}</p>
          {/if}
          <Button type="submit">
            <Label>Sign Up</Label>
          </Button>
        </form>
      {/if}
    </div>
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
        <Item tag="a" href="/stats"><Text>Stats</Text></Item>
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

  .buttons {
    display: grid;
    justify-content: center;
    gap: 12px;
  }

  :global(#sign-in-with-google),
  :global(#sign-in-with-microsoft),
  :global(#sign-in-with-email),
  :global(#sign-up-with-email) {
    --mdc-typography-button-text-transform: none;
    justify-content: start;
    gap: 4px;
  }

  :global(#sign-in-with-google),
  :global(#sign-in-with-microsoft) {
    --mdc-theme-primary: #ffffff;
    --mdc-theme-on-primary: #3c4043;
  }

  @media (prefers-color-scheme: dark) {
    :global(#sign-in-with-microsoft) {
      --mdc-theme-primary: #2f2f2f;
      --mdc-theme-on-primary: #ffffff;
    }
  }

  form {
    display: grid;
    gap: 12px;
  }

  .error {
    color: salmon;
  }
</style>
