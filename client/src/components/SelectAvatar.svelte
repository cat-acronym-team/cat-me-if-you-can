<script lang="ts">
  import type { Lobby, Avatar } from "$lib/firebase/firestore-types/lobby";

  import { createEventDispatcher } from "svelte";
  import { authStore as user } from "$stores/auth";
  import { avatarAltText } from "$lib/avatar";
  import PlayerMenu from "./PlayerMenu.svelte";

  export let selectedAvatar: 0 | Avatar = 0;
  export let lobby: Lobby | undefined = undefined;
  export let lobbyCode: string | undefined = undefined;

  type $$Props = { selectedAvatar: 0 | Avatar } | { lobby: Lobby; lobbyCode: string };

  $: avatarChoices = updateAvatarChoices(lobby, selectedAvatar);

  type AvatarChoice = {
    avatar: Avatar;
    altText: string;
    displayName?: string;
    uid?: string;
    available: boolean;
    selected: boolean;
  };

  function updateAvatarChoices(lobby: Lobby | undefined, selectedAvatar: 0 | Avatar): AvatarChoice[] {
    const newAvatarChoices: AvatarChoice[] = [];

    for (let i = 1; i <= 12; i++) {
      newAvatarChoices.push({ avatar: i as Avatar, altText: avatarAltText[i], available: true, selected: false });
    }

    if (lobby != undefined) {
      for (const player of lobby.players) {
        newAvatarChoices[player.avatar - 1].displayName = player.displayName;
        newAvatarChoices[player.avatar - 1].available = false;
        const playerIndex = lobby.players.indexOf(player);
        newAvatarChoices[player.avatar - 1].uid = lobby.uids[playerIndex];
      }

      if ($user !== null && lobby.uids.indexOf($user.uid) !== null) {
        const userIndex = lobby.uids.indexOf($user.uid);
        if (userIndex != -1) {
          newAvatarChoices[lobby.players[userIndex].avatar - 1].selected = true;
        }
      }
    } else {
      for (const avatarChoice of newAvatarChoices) {
        avatarChoice.selected = avatarChoice.avatar === selectedAvatar;
        avatarChoice.available = !avatarChoice.selected;
      }
    }

    return newAvatarChoices;
  }

  const dispatch = createEventDispatcher<{ change: { value: Avatar } }>();

  function selectAvatar(avatar: Avatar) {
    dispatch("change", {
      value: avatar,
    });
  }
</script>

<div class="grid {lobby != undefined ? 'lobby' : ''}">
  {#each avatarChoices as { avatar, altText, displayName, uid, available, selected }}
    <div class="parent">
      {#if uid != undefined && lobbyCode != undefined && $user !== null && lobby?.uids[0] == $user.uid}
        <PlayerMenu {lobbyCode} {uid} />
      {/if}
      <button class="avatar" on:click={() => selectAvatar(avatar)} disabled={!available} aria-selected={selected}>
        <img src="/avatars/{avatar}.webp" alt={altText} />
        {#if lobby != undefined}
          <span class="mdc-typography--subtitle1">{displayName ?? ""}</span>
        {/if}
      </button>
    </div>
  {/each}
</div>

<style>
  * {
    box-sizing: border-box;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-template-rows: repeat(3, auto);
    place-content: center;
    gap: 24px 24px;
    height: 100%;
  }

  .grid.lobby {
    gap: 12px 24px;
  }
  .parent {
    position: relative;
  }
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: repeat(3, auto);
      grid-template-rows: repeat(4, auto);
    }
  }

  .avatar {
    appearance: none;
    border: none;
    padding: 0px;
    background: none;

    display: grid;
    grid-template-rows: auto;
    gap: 12px;
    place-items: center;
    color: unset;
  }

  .lobby .avatar {
    grid-template-rows: auto 16px;
  }

  .avatar img {
    height: 18vmin;
    width: 18vmin;
    outline: 1px currentColor solid;
    outline-offset: -1px;
    border-radius: 8px;
  }

  .avatar:focus {
    outline: none;
  }

  .avatar:focus-visible img {
    outline-offset: -2px;
    outline: 2px currentColor solid;
  }

  .avatar[aria-selected="true"] img {
    outline-offset: -2px;
    outline: 2px var(--primary-theme-color) solid;
  }
</style>
