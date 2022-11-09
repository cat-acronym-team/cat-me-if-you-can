<script lang="ts">
  import SelectAvatar from "$components/SelectAvatar.svelte";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { avatarAltText } from "$lib/avatar";
  import type { Avatar } from "$lib/firebase/firestore-types/lobby";
  import { deleteAccount, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
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
  let errorMsg = "";
  let errPrompt = false;

  function verifyDelete() {
    try {
      deleteAccount();
      // If no error
      errorMsg = "";

      goto("/");
      return;
    } catch (err) {
      errPrompt = true;
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
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
        >Last sign in too long ago.
        <br />Please Signin and Try Again</Content
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

  <Button on:click={() => (showDeletionPrompt = true)}>
    <Label>Delete Account</Label>
  </Button>
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
</style>
