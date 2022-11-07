<script lang="ts">
  import { type Lobby, GAME_STATE_DURATIONS, type Player } from "$lib/firebase/firestore-types/lobby";
  import { authStore as user } from "$stores/auth";
  import { onMount } from "svelte";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  import { avatarAltText } from "$lib/avatar";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let countdown = GAME_STATE_DURATIONS.VOTE;
  let timer: ReturnType<typeof setInterval>;
  let votedOffUser: Player | undefined;

  onMount(() => {
    if (lobby.votedOff != undefined && lobby.votedOff != "NONE") {
      votedOffUser = lobby.players[lobby.uids.indexOf(lobby.votedOff)];
    }

    timer = setInterval(() => {
      if (lobby.expiration != undefined) {
        const diff = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
        countdown = diff;
      }
    }, 500);
  });

  $: if (countdown <= 0 && lobby.uids[0] == $user?.uid) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
  $: if (countdown <= -5) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
</script>

<div class="result">
  {#if lobby.votedOff == undefined}
    <h1>Somehow undefined</h1>
  {:else if lobby.votedOff == "NONE"}
    <h1>No one was voted off</h1>
  {:else}
    <div class="avatar">
      <img src="/avatars/{votedOffUser?.avatar}.webp" alt={avatarAltText[votedOffUser?.avatar ?? 0]} />
      <h1>{votedOffUser?.displayName} was voted off</h1>
    </div>
  {/if}
</div>

<style>
  .result {
    height: 100%;
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .avatar {
    appearance: none;
    border: none;
    padding: 10px;
    background: none;

    display: grid;
    grid-template-rows: auto 16px;
    place-items: center;
    color: unset;
  }

  .avatar img {
    height: 18vmin;
    width: 18vmin;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
