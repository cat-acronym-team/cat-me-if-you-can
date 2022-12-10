<script lang="ts">
  import SelectAvatar from "$components/SelectAvatar.svelte";
  import Layout from "../+layout.svelte";
  import Rules from "$components/Rules.svelte";
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
  import { Icon } from "@smui/common";
  import { displayNameValidator, type UserData } from "$lib/firebase/firestore-types/users";
  import { doc, DocumentReference, onSnapshot, setDoc, updateDoc, type Unsubscribe } from "firebase/firestore";
  import { userCollection } from "$lib/firebase/firestore-collections";
  import { authStore as user } from "$stores/auth";
  import { onDestroy } from "svelte";
  import ProviderButtons from "$components/ProviderButtons.svelte";

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
  let googleErr = "";
  let microsoftErr = "";
  let passErr = "";
  let deleteErr = "";

  function getErrorMsg(error: unknown): string {
    let errorMsg = error instanceof Error ? error.message : String(error);
    switch (errorMsg) {
      case "Firebase: Password should be at least 6 characters (auth/weak-password).":
        return "Password should be at least 6 characters";
      case "Not Signed in":
        return errorMsg;
      case "Firebase: Error (auth/popup-closed-by-user).":
        return "canceled by user";
      case "Firebase: Error (auth/email-already-in-use).":
        return "Email already linked to an account";
      case "User is not defined":
        return "Last Sign In too long ago.";
      default:
        return errorMsg;
    }
  }
  async function verifyDelete() {
    try {
      await deleteAccount();
      // If no error
      window.location.href = "/";
    } catch (err) {
      errPrompt = true;
      deleteErr = getErrorMsg(err);
    }
  }

  async function linkGoogleAccount() {
    try {
      await linkWithGoogle($user);
      window.location.reload();
    } catch (err) {
      googleErr = getErrorMsg(err);
    }
  }

  async function linkMicrosoftAccount() {
    try {
      await linkWithMicrosoft($user);
      window.location.reload();
    } catch (err) {
      microsoftErr = getErrorMsg(err);
    }
  }

  async function linkPassword() {
    try {
      await linkWithPassword(password);
      linkPass = true;
      showOptions = false;
      clearFields();
    } catch (err) {
      passErr = getErrorMsg(err);
    }
  }

  function clearFields() {
    password = "";
  }
</script>

<main class="settings-wrapper">
  <Layout>
    <Rules slot="help" />
  </Layout>

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
  <Dialog bind:open={errPrompt} aria-labelledby="reauth-title" aria-describedby="err-msg-content">
    <Title id="reauth-title">NOTICE!</Title>
    <Content id="err-msg-content"
      >{deleteErr}
      <br />Please Sign In and Try Again</Content
    >
    <Actions>
      <Button
        on:click={() => {
          logOut();
        }}
        ><Label>Ok</Label>
      </Button>
    </Actions>
  </Dialog>

  <p id="email">Email: {$user?.email ?? "Anonymous User"}</p>
  <h3>Link Provider Options</h3>

  <div class="signin-buttons">
    <ProviderButtons
      on:google-clicked={linkGoogleAccount}
      on:microsoft-clicked={linkMicrosoftAccount}
      hideGoogle={hasGoogleProvider($user)}
      hideMicrosoft={hasMicrosoftProvider($user)}
    >
      <p class="error" slot="google-error">{googleErr}</p>
      <p class="error" slot="microsoft-error">{microsoftErr}</p>
    </ProviderButtons>
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
    </Content>

    <Actions>
      <div>
        <Button on:click={linkPassword}>
          <Label>Set Password</Label>
        </Button>
      </div>
    </Actions>
  </Dialog>

  {#if linkPass}
    <p class="set-pass">Password Successfully Set</p>
  {:else if passErr !== ""}
    <p class="error">{passErr}</p>
  {/if}

  <div>
    <Button
      on:click={() => {
        logOut();
      }}
    >
      <Label>Sign Out</Label>
    </Button>
  </div>

  <div>
    <Button on:click={() => (showDeletionPrompt = true)}>
      <Label>Delete Account</Label>
    </Button>
  </div>
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
    margin-top: 20px;
    margin-left: 20px;
  }

  .signin-buttons {
    display: grid;
    justify-content: center;
    gap: 4px;
    max-width: 230px;
  }

  .set-pass {
    color: rgb(15, 148, 15);
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
