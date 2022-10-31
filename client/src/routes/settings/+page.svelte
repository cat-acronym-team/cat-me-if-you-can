<script lang="ts">
  import SelectAvatar from "$components/SelectAvatar.svelte";
  import Dialog, { Title, Content } from "@smui/dialog";
  import { avatarAltText } from "$lib/avatar";
  import type { Avatar } from "$lib/firebase/firestore-types/lobby";

  let avatar: 0 | Avatar = 0;
  let showAvatarDialog = false;

  function selectAvatar(newAvatar: Avatar) {
    avatar = newAvatar; // TODO: update avatar in firestore
    showAvatarDialog = false;
  }
</script>

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
