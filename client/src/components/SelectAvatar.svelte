<script lang="ts">
  import { changeAvatar } from "$lib/firebase/firestore-functions";
  import type { Lobby, Avatar } from "$lib/firebase/firestore-types/lobby";

  import { authStore as user } from "$stores/auth";

  export let lobbyCode: string;
  export let lobby: Lobby;

  const avatarAltText = [
    "Default cat",
    "Astronaut cat",
    "Bee Cat",
    "Burger cat",
    "City cat",
    "Computer cat",
    "Cowboy cat",
    "Emo demon cat",
    "Fantasy cat",
    "Fish cat",
    "Ghost cat",
    "Magic cat",
    "Torsten cat",
  ] as const;

  $: avatarChoices = updateAvatarChoices(lobby);

  type AvatarChoice = {
    avatar: Avatar;
    altText: string;
    displayName?: string;
    avalible: boolean;
    selected: boolean;
  };

  function updateAvatarChoices(lobby: Lobby) {
    const newAvatarChoices: AvatarChoice[] = [];

    for (let i = 1; i <= 12; i++) {
      newAvatarChoices.push({ avatar: i as Avatar, altText: avatarAltText[i], avalible: true, selected: false });
    }

    for (const player of lobby.players) {
      newAvatarChoices[player.avatar - 1].displayName = player.displayName;
      newAvatarChoices[player.avatar - 1].avalible = false;
    }

    if ($user !== null) {
      const userIndex = lobby.uids.indexOf($user.uid);
      newAvatarChoices[lobby.players[userIndex].avatar - 1].selected = true;
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
  {#each avatarChoices as { avatar, altText, displayName, avalible, selected }}
    <button class="avatar" on:click={() => selectAvatar(avatar)} disabled={!avalible} aria-selected={selected}>
      <img src="/avatars/{avatar}.webp" alt={altText} />
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
    outline: 1px currentColor solid;
    border-radius: 8px;
  }

  .avatar:focus {
    outline: none;
  }

  .avatar:focus-visible img {
    outline: 2px currentColor solid;
  }

  .avatar[aria-selected="true"] img {
    outline: 2px var(--primary-theme-color) solid;
  }
</style>
