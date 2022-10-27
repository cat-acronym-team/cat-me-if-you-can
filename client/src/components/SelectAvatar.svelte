<script lang="ts">
  import { changeAvatar } from "$lib/firebase/firestore-functions";
  import type { Lobby, Avatar } from "$lib/firebase/firestore-types/lobby";

  export let lobbyCode: string;
  export let lobby: Lobby;

  $: avatarChoices = updateAvatarChoices(lobby);

  function updateAvatarChoices(lobby: Lobby) {
    const newAvatarChoices: { avatar: Avatar; displayName?: string }[] = [];

    for (let i = 1; i <= 12; i++) {
      newAvatarChoices.push({ avatar: i as Avatar });
    }

    for (const player of lobby.players) {
      newAvatarChoices[player.avatar - 1].displayName = player.displayName;
    }

    return newAvatarChoices;
  }

  function selectAvatar(avatar: Avatar) {
    try {
      changeAvatar({ lobbyCode, avatar });
    } catch (err) {
      console.error(err);
    }
  }
</script>

<div class="grid">
  {#each avatarChoices as { avatar, displayName }}
    <button class="avatar" on:click={() => selectAvatar(avatar)}>
      <img src="/avatars/{avatar}.webp" alt="cat picture {avatar}" />
      <span class="mdc-typography--subtitle1">{displayName ?? ""}</span>
    </button>
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
    gap: 12px 24px;
    height: 100%;
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
    grid-template-rows: auto 16px;
    gap: 12px;
    place-items: center;
    color: unset;
  }

  .avatar img {
    height: 18vmin;
    width: 18vmin;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border: 1px currentColor solid;
  }
</style>
