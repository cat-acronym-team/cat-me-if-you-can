<script lang="ts">
  import SelectAvatar from "$components/SelectAvatar.svelte";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { avatarAltText } from "$lib/avatar";
  import type { Avatar } from "$lib/firebase/firestore-types/lobby";
  import {
    deleteAccount,
    logOut,
    linkWithGoogle,
    linkWithMicrosoft,
    linkWithPassword,
    hasGoogleProvider,
    hasMicrosoftProvider,
  } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import { Svg, Icon } from "@smui/common";
  import { displayNameValidator, type UserData } from "$lib/firebase/firestore-types/users";
  import { doc, DocumentReference, onSnapshot, setDoc, updateDoc, type Unsubscribe } from "firebase/firestore";
  import { userCollection } from "$lib/firebase/firestore-collections";
  import { authStore as user } from "$stores/auth";
  import { onDestroy } from "svelte";

  let userData: UserData | undefined = undefined;
  let userDataDocRef: DocumentReference<UserData> | undefined = undefined;
  let unsubscribeUserData: Unsubscribe | undefined = undefined;

  $: if ($user != null) {
    userDataDocRef = doc(userCollection, $user.uid);
  }

  $: if (userDataDocRef != undefined) {
    // unsubscribe from old user doc
    unsubscribeUserData?.();

    // subscribe to new user doc
    unsubscribeUserData = onSnapshot(userDataDocRef, (doc) => {
      userData = doc.data();
    });
  }

  onDestroy(() => {
    unsubscribeUserData?.();
  });

  let preferenceErrorMessage = "";

  async function updatePreferences(newPreferences: { avatar?: 0 | Avatar; displayName?: string }) {
    try {
      if (userDataDocRef == undefined) {
        throw new Error("You are not logged in!");
      }
      if (userData == undefined) {
        if (newPreferences.displayName == undefined) {
          throw new Error("You must enter a display name!");
        }
        const newUserData: UserData = {
          displayName: newPreferences.displayName,
          avatar: newPreferences.avatar ?? 0,
          catWins: 0,
          catfishWins: 0,
          playedAsCat: 0,
          playedAsCatfish: 0,
        };
        await setDoc(userDataDocRef, newUserData);
      } else {
        await updateDoc(userDataDocRef, newPreferences);
      }
    } catch (error) {
      preferenceErrorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  let showAvatarDialog = false;

  function selectAvatar(newAvatar: Avatar) {
    updatePreferences({ avatar: newAvatar });
    showAvatarDialog = false;
  }

  let showDisplayNameDialog = false;

  let newDisplayName = "";
  $: nameValidation = displayNameValidator(newDisplayName.trim());

  function updateDisplayName() {
    updatePreferences({ displayName: newDisplayName.trim() });
    showDisplayNameDialog = false;
  }

  let showDeletionPrompt = false;
  let showOptions = false;
  let showPassword = false;
  let errPrompt = false;
  let linkPass = false;

  let password = "";
  let errorMsg = "";
  let googleErr = "";
  let microsoftErr = "";
  let passErr = "";
  let deleteErr = "";

  function outputErrMsg(error: string) {
    switch (error) {
      case "Firebase: Password should be at least 6 characters (auth/weak-password).":
        return "Password should be at least 6 characters";
      case "google-account-already-linked":
        return "google account already linked";
      case "microsoft-account-already-linked":
        return "microsoft account already linked";
      default:
        return "An unexpected error has occured";
    }
  }
  function verifyDelete() {
    try {
      deleteAccount();
      // If no error
      goto("/");
    } catch (err) {
      errPrompt = true;
      deleteErr = err instanceof Error ? err.message : String(err);
      outputErrMsg(deleteErr);
    }
  }

  async function linkGoogleAccount() {
    try {
      await linkWithGoogle($user);
      window.location.reload();
    } catch (err) {
      googleErr = err instanceof Error ? err.message : String(err);
      outputErrMsg(googleErr);
    }
  }

  async function linkMicrosoftAccount() {
    try {
      await linkWithMicrosoft($user);
      window.location.reload();
    } catch (err) {
      microsoftErr = err instanceof Error ? err.message : String(err);
      outputErrMsg(microsoftErr);
    }
  }

  async function linkPassword() {
    try {
      await linkWithPassword(password);
      linkPass = true;
      showOptions = false;
      clearFields();
    } catch (err) {
      passErr = err instanceof Error ? err.message : String(err);
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

<main class="settings-wrapper">
  <h2 class="mdc-typography--headline2">Account Settings</h2>

  <div class="preferences">
    <div class="avatar">
      <img src="/avatars/{userData?.avatar ?? 0}.webp" alt={avatarAltText[userData?.avatar ?? 0]} />
      {#if userData?.displayName != undefined}
        <IconButton class="material-icons" on:click={() => (showAvatarDialog = true)}>edit</IconButton>
      {/if}
    </div>

    <div class="mdc-typography--headline3">
      {userData?.displayName ?? "No Name"}<IconButton
        class="material-icons"
        on:click={() => {
          newDisplayName = userData?.displayName ?? "";
          showDisplayNameDialog = true;
        }}>edit</IconButton
      >
    </div>
  </div>

  {#if preferenceErrorMessage !== ""}
    <p class="error">{preferenceErrorMessage}</p>
  {/if}

  <Dialog
    bind:open={showAvatarDialog}
    aria-labelledby="avatar-dialog-title"
    aria-describedby="avatar-dialog-content"
    surface$style="max-width: calc(100vw - 32px);"
  >
    <Title id="avatar-dialog-title">Select Your Default Avatar</Title>
    <Content id="avatar-dialog-content">
      <SelectAvatar selectedAvatar={userData?.avatar ?? 0} on:change={(event) => selectAvatar(event.detail.value)} />
    </Content>
  </Dialog>

  <Dialog
    bind:open={showDisplayNameDialog}
    aria-labelledby="display-name-dialog-title"
    aria-describedby="display-name-dialog-content"
  >
    <Title id="display-name-dialog-title">Change Your Display Name</Title>
    <Content id="display-name-dialog-content">
      <Textfield label="Display Name" bind:value={newDisplayName} invalid={!nameValidation.valid}>
        <HelperText validationMsg slot="helper">{nameValidation.valid ? "" : nameValidation.reason}</HelperText>
      </Textfield>
    </Content>
    <Actions>
      <Button on:click={() => updateDisplayName()} disabled={!nameValidation.valid}>
        <Label>Save</Label>
      </Button>
    </Actions>
  </Dialog>

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
        >Last Sign In too long ago.
        <br />Please Sign In and Try Again</Content
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

  <p id="email">Email: {$user?.email == null ? "Anonymous User" : $user.email}</p>
  <h3>Link Provider Options</h3>

  <div class="signin-buttons">
    {#if !hasGoogleProvider($user)}
      <Button id="sign-in-with-google" variant="raised" on:click={linkGoogleAccount}>
        <Icon component={Svg} viewBox="0 0 48 48">
          {#each googleSvgPaths as path}
            <path fill={path.color} d={path.path} />
          {/each}
        </Icon>
        <Label>Sign in with Google</Label>
      </Button>
    {/if}
    {#if googleErr !== ""}
      <!--In case there's somehow an error-->
      <p class="error">{outputErrMsg(googleErr)}</p>
    {/if}
    {#if !hasMicrosoftProvider($user)}
      <Button id="sign-in-with-microsoft" variant="raised" on:click={linkMicrosoftAccount}>
        <Icon component={Svg} viewBox="0 0 21 21">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </Icon>
        <Label>Sign in with Microsoft</Label>
      </Button>
    {/if}
    {#if microsoftErr !== ""}
      <!--In case there's somehow an error-->
      <p class="error">{outputErrMsg(microsoftErr)}</p>
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
        <p class="error">{outputErrMsg(passErr)}</p>
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

<style>
  .preferences {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  .avatar {
    position: relative;
    height: 128px;
    width: 128px;
  }

  .avatar > img {
    height: 100%;
    width: 100%;
  }

  .avatar > :global(.mdc-icon-button) {
    position: absolute;
    top: -8px;
    right: -8px;
  }

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
