<script lang="ts">
  import Prompt from "$components/Prompt.svelte";
  import LobbyComponent from "$components/Lobby.svelte";

  import { page } from "$app/stores";
  import type { User } from "firebase/auth";
  import type { Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby";

  const lobbyCode = $page.params.gameid;

  let user: User; // TODO

  let lobby: Lobby; // TODO

  let privatePlayer: PrivatePlayer; // TODO
</script>

<div>
  {#if user == undefined || lobby == undefined}
    Loading... <!-- TODO: make a Nice Loading spinner -->
  {:else if lobby.state === "WAIT"}
    <LobbyComponent {lobbyCode} {lobby} />
  {:else if privatePlayer == undefined}
    Loading... <!-- TODO: make a Nice Loading spinner -->
  {:else if lobby.state === "PROMPT"}
    <Prompt prompt={privatePlayer.prompt} uid={user.uid} {lobbyCode} />
  {:else}
    unknown lobby state: {lobby.state}
  {/if}
</div>
