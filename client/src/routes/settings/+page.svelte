<script lang="ts">
  import SelectAvatar from "$components/SelectAvatar.svelte";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import { avatarAltText } from "$lib/avatar";
  import type { Avatar } from "$lib/firebase/firestore-types/lobby";
  import { deleteAccount, logOut } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";
  import { displayNameValidator } from "$lib/firebase/firestore-types/users";

  let avatar: 0 | Avatar = 0;
  let showAvatarDialog = false;

  function selectAvatar(newAvatar: Avatar) {
    avatar = newAvatar; // TODO: update avatar in firestore
    showAvatarDialog = false;
  }

  let displayName = "Loading...";
  let showDisplayNameDialog = false;

  $: newDisplayName = displayName;
  $: nameValidation = displayNameValidator(newDisplayName.trim());

  function updateDisplayName() {
    displayName = newDisplayName.trim(); // TODO: update displayName in firestore
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

  <button class="avatar" on:click={() => (showAvatarDialog = true)}>
    <img src="/avatars/{avatar}.webp" alt={avatarAltText[avatar]} />
  </button>

  <Dialog
    bind:open={showAvatarDialog}
    aria-labelledby="avatar-dialog-title"
    aria-describedby="avatar-dialog-content"
    surface$style="max-width: calc(100vw - 32px);"
  >
    <Title id="avatar-dialog-title">Select Your Default Avatar</Title>
    <Content id="avatar-dialog-content">
      <SelectAvatar selectedAvatar={avatar} on:change={(event) => selectAvatar(event.detail.value)} />
    </Content>
  </Dialog>

  <div class="mdc-typography--headline3" on:click={() => (showDisplayNameDialog = true)}>{displayName}</div>

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
  .avatar {
    appearance: none;
    border: none;
    padding: 0px;
    background: none;

    height: 128px;
    width: 128px;
  }

  .avatar img {
    height: 100%;
    width: 100%;
  }
</style>
