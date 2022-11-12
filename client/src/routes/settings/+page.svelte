<script lang="ts">
  import { deleteAccount, linkWithGoogle, linkWithMicrosoft, linkWithPassword, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import { Svg, Icon } from "@smui/common";
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import { authStore as user } from "$stores/auth";

  let showDeletionPrompt = false;
  let showOptions = false;
  let showPassword = false;
  let errPrompt = false;
  let googleLinked = false;
  let microsoftLinked = false;
  let linkPass = false;

  let errorMsg = "";
  let password = "";
  let googleErr = "";
  let microsoftErr = "";
  let passErr = "";

  function outputErrMsg() {
    switch (errorMsg) {
      case "Firebase: Password should be at least 6 characters (auth/weak-password).":
        passErr = "Password should be at least 6 characters";
        return;
      case "google-account-already-linked":
        googleErr = "google account already linked";
        return;
      case "microsoft-account-already-linked":
        microsoftErr = "microsoft account already linked";
        return;
      default:
        errorMsg = "An unexpected error has occured";
        return;
    }
  }
  function verifyDelete() {
    try {
      deleteAccount();
      // If no error
      errorMsg = "";
      goto("/");
    } catch (err) {
      errPrompt = true;
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  async function linkGoogleAccount() {
    try {
      await linkWithGoogle();
      googleLinked = true;
      showOptions = false;
      window.location.reload();
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      outputErrMsg();
    }
  }

  async function linkMicrosoftAccount() {
    try {
      await linkWithMicrosoft();
      microsoftLinked = true;
      showOptions = false;
      window.location.reload();
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      outputErrMsg();
    }
  }

  async function linkPassword() {
    try {
      await linkWithPassword(password);
      linkPass = true;
      clearFields();
      showOptions = false;
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err);
      outputErrMsg();
    }
  }

  function clearFields() {
    password = "";
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

<html lang="en">
  <main class="settings-wrapper">
    <h2>Account Settings</h2>
    <p id="email">Email: {$user?.email == null ? "Anonymous User" : $user.email}</p>
    <div class="signin-buttons">
      <h3>Link Provider Options</h3>
      <Button id="sign-in-with-google" variant="raised" on:click={linkGoogleAccount}>
        <Icon component={Svg} viewBox="0 0 48 48">
          {#each googleSvgPaths as path}
            <path fill={path.color} d={path.path} />
          {/each}
        </Icon>
        <Label>Sign in with Google</Label>
      </Button>

      {#if googleLinked && googleErr === ""}
        <p class="success">Successfully Linked Google Account</p>
      {/if}

      <Button id="sign-in-with-microsoft" variant="raised" on:click={linkMicrosoftAccount}>
        <Icon component={Svg} viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </Icon>
        <Label>Sign in with Microsoft</Label>
      </Button>

      {#if microsoftLinked && microsoftErr === ""}
        <p class="success">Successfully Linked Microsoft Account</p>
      {/if}
    </div>
    <div>
      <Button on:click={() => (showOptions = true)}>
        <Label>Set Password</Label>
      </Button>
    </div>
    <Dialog bind:open={showOptions} aria-labelledby="set-password-title" aria-describedby="link-options-content">
      <Title id="set-password-title">Set Password</Title>
      <Content id="set-password-content">
        <Textfield
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          bind:value={password}
          required
        >
          <IconButton
            type="button"
            on:click={(event) => event.preventDefault()}
            slot="trailingIcon"
            toggle
            bind:pressed={showPassword}
          >
            <Icon class="material-icons" on>visibility</Icon>
            <Icon class="material-icons">visibility_off</Icon>
          </IconButton>
        </Textfield>
        <div>
          <Button on:click={linkPassword}>
            <Label>Set Password</Label>
          </Button>
        </div>
        {#if linkPass}
          <p>Password Sucessfully Set</p>
        {:else if passErr !== ""}
          <p class="error">{passErr}</p>
        {/if}
      </Content>
    </Dialog>
    <div>
      <Button
        on:click={() => {
          logOut();
          goto("/");
        }}
      >
        <Label>Sign Out</Label>
      </Button>
    </div>
    <!--Delete Account Button and Prompt-->
    <Dialog
      bind:open={showDeletionPrompt}
      aria-labelledby="confirm-account-deletion-title"
      aria-describedby="deletion-confirmation-content"
    >
      <Title id="confirm-account-deletion-title">Delete Account</Title>
      <Content id="deletion-confirmation-content">Are you sure?</Content>
      <Actions>
        <Button>
          <Label>Cancel</Label>
        </Button>
        <Button on:click={verifyDelete}>
          <Label>Delete Account</Label>
        </Button>
      </Actions>
    </Dialog>
    <!--If user signed in too long ago, redirect them to sign in-->
    {#if errorMsg !== ""}
      <Dialog bind:open={errPrompt} aria-labelledby="reauth-title" aria-describedby="err-msg-content">
        <Title id="reauth-title">NOTICE!</Title>
        <Content id="err-msg-content"
          >Last sign in too long ago. <br />
          Please Signin and Try Again</Content
        >
        <Actions>
          <Button
            on:click={() => {
              logOut();
              goto("/");
            }}
            ><Label>Ok</Label>
          </Button>
        </Actions>
      </Dialog>
    {/if}
    <div>
      <Button on:click={() => (showDeletionPrompt = true)}>
        <Label>Delete Account</Label>
      </Button>
    </div>
    <!--End delete account button and prompt-->
  </main>
</html>

<style>
  .settings-wrapper {
    display: grid;
    margin-top: 50px;
    margin-left: 20px;
  }

  .signin-buttons {
    display: grid;
    justify-content: center;
    gap: 4px;
    max-width: 230px;
  }

  .success {
    color: rgb(34, 187, 51);
  }

  :global(#sign-in-with-google),
  :global(#sign-in-with-microsoft) {
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
</style>
