<script lang="ts">
  import type { Lobby, Player } from "$lib/firebase/firestore-types/lobby";

  export let lobby: Lobby;

  $: avatarChoices = updateAvatarChoices(lobby);

  function updateAvatarChoices(lobby: Lobby) {
    const newAvatarChoices: { avatar: number; displayName?: string }[] = [];

    for (let i = 1; i <= 12; i++) {
      newAvatarChoices.push({ avatar: i });
    }

    for (const player of lobby.players) {
      newAvatarChoices[player.avatar - 1].displayName = player.displayName;
    }

    return newAvatarChoices;
  }
</script>

<div class="grid">
  {#each avatarChoices as { avatar, displayName }}
    <button class="avatar">
      <img src="/avatars/{1}.webp" alt="cat picture {avatar}" />
      <span class="name">{displayName ?? ""}</span>
    </button>
  {/each}
</div>

<style>
  * {
    box-sizing: border-box;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 1fr);
    place-items: stretch;
    height: 100%;
  }

  @media (max-width: 400px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(4, 1fr);
    }
  }

  .avatar {
    appearance: none;
    border: none;
    padding: 0px;
    background: none;

    display: grid;
    grid-template-rows: auto 16px;
    place-content: center;
    place-items: center;
  }

  .avatar img {
    height: 15vmin;
    width: 15vmin;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border: 1px black solid;
  }

  .avatar .name {
    font-size: 2vmin;
  }
</style>
