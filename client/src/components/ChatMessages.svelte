<script lang="ts">
  import type { ChatMessage, Lobby, LobbyChatMessage, Player } from "$lib/firebase/firestore-types/lobby";
  import { avatarAltText, avatarColors } from "$lib/avatar";
  import { authStore as user } from "$stores/auth";

  export let lobby: Lobby;
  export let messages: (ChatMessage | LobbyChatMessage)[];

  $: playersMap = generatePlayersMap(lobby);

  function generatePlayersMap(lobby: Lobby) {
    const map = new Map<string, Player>();
    for (let i = 0; i < lobby.players.length; i++) {
      map.set(lobby.uids[i], lobby.players[i]);
    }
    return map;
  }

  $: displayMessages = messages.map((message) => {
    const { avatar, displayName } = playersMap.get(message.sender) ?? { avatar: 0, displayName: "Unknown Player" };
    return { ...message, avatar, displayName };
  });
</script>

<div class="messages">
  {#each displayMessages as message}
    <div class="message {message.sender == $user?.uid ? 'current-user' : ''}">
      <div class="avatar">
        <img src="/avatars/{message.avatar}.webp" alt={avatarAltText[message.avatar]} />
      </div>
      <div class="display-name mdc-typography--body2">{message.displayName}</div>
      <div class="text mdc-typography--body1" style="background-color: {avatarColors[message.avatar]}">
        {message.text}
      </div>
    </div>
  {/each}
</div>

<style>
  .messages {
    margin: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .message {
    display: grid;
    grid-template-columns: 64px auto 64px;
    grid-template-areas:
      "avatar name empty"
      "avatar text empty";
    gap: 4px;
    justify-items: start;
    justify-content: start;
  }

  .message.current-user {
    grid-template-areas:
      "empty name avatar"
      "empty text avatar";
    justify-items: end;
    justify-content: end;
  }

  .avatar {
    grid-area: avatar;
    align-self: end;
  }

  .avatar img {
    display: block;
    width: 64px;
    height: 64px;
    transform: scaleX(-1);
  }

  .current-user .avatar img {
    transform: scaleX(1);
  }

  .display-name {
    grid-area: name;
    margin: 0 12px;
  }

  .text {
    grid-area: text;
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 24px 24px 24px 0;
    color: black;
  }

  .current-user .text {
    border-radius: 24px 24px 0 24px;
  }
</style>
