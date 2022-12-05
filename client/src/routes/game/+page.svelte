<script lang="ts">
  import Prompt from "$components/Prompt.svelte";
  import Role from "$components/ReceiveRole.svelte";
  import LobbyComponent from "$components/Lobby.svelte";
  import WinLoss from "$components/WinLoss.svelte";
  import ChatRoom from "$components/ChatRoom.svelte";
  import Vote from "$components/Vote.svelte";
  import Result from "$components/Result.svelte";
  import CircularProgress from "@smui/circular-progress";
  import LobbyChat from "$components/LobbyChat.svelte";

  import { onSnapshot, doc, getDoc, type Unsubscribe } from "firebase/firestore";
  import { onMount, onDestroy } from "svelte";
  import { getPrivatePlayerCollection, lobbyCollection } from "$lib/firebase/firestore-collections";
  import { GAME_STATE_DURATIONS, type Lobby, type PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { authStore as user } from "$stores/auth";
  import { goto } from "$app/navigation";
  import { verifyExpiration } from "$lib/firebase/firebase-functions";
  import { formatTimer, DISPLAY_TIMERS } from "$lib/time";

  let lobbyCode: string | null = null;

  let lobby: Lobby | undefined = undefined;
  let unsubscribeLobby: Unsubscribe | undefined = undefined;

  let privatePlayer: PrivatePlayer | undefined = undefined;
  let unsubscribePrivatePlayer: Unsubscribe | undefined = undefined;

  let countdown = GAME_STATE_DURATIONS.WAIT;
  $: countdownVisible = lobby != undefined && DISPLAY_TIMERS[lobby.state] == true;
  let timer: ReturnType<typeof setInterval>;

  function updateCountdown() {
    if (lobby == undefined) {
      throw new Error("attempted to update countdown when lobby is undefined");
    }
    countdown = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
  }

  onMount(async () => {
    // gets code from url search
    // the svelte magic with searchparams wasnt working
    lobbyCode = $page.url.searchParams.get("code");
    if (lobbyCode === null) {
      errorToJoin("Code is invalid!");
      return;
    }

    const lobbyDocRef = doc(lobbyCollection, lobbyCode);

    // We want to get the document immediately because if we wait there's a short delay in getting
    // the new doc from subscribing below. This makes the redirect slow since we want to check if the user isn't in this lobby
    const lobbyDoc = await getDoc(lobbyDocRef);
    // gets the lobby data
    lobby = lobbyDoc.data();
    if (lobby == undefined) {
      errorToJoin("Lobby doesnt exist!");
      return;
    }

    // check for user being null so privatePlayerDocRef can work
    if ($user === null || !lobby.uids.includes($user.uid)) {
      // then return to join
      goto(`/join?code=${lobbyCode}`, {
        replaceState: true,
      });
      return;
    }

    const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);
    const privatePlayerDocRef = doc(privatePlayerCollection, $user.uid);

    updateCountdown();

    // We want them to subscribe to the lobby on mount
    unsubscribeLobby = onSnapshot(lobbyDocRef, (doc) => {
      // will change lobby to the new doc data
      lobby = doc.data();
      clearInterval(timer);
      if (lobby != undefined) {
        timer = setInterval(updateCountdown, 500);
      }
    });

    // We want them to subscribe to the privatePlayer on mount
    unsubscribePrivatePlayer = onSnapshot(privatePlayerDocRef, (doc) => {
      // will change privatePlayer to the new doc data
      privatePlayer = doc.data();
    });
  });

  onDestroy(() => {
    // clear timer
    clearInterval(timer);
    // unsub from lobby
    unsubscribeLobby?.();
    // unsub from privatePlayer
    unsubscribePrivatePlayer?.();
  });

  function errorToJoin(errorMessage: string) {
    goto("/join", {
      replaceState: true,
      state: { errorMessage: errorMessage },
    });
  }

  function onbeforeunload(event: BeforeUnloadEvent) {
    event.returnValue = true;
  }

  // Reactive Calls
  $: if (lobby !== undefined && $user !== null && !lobby.uids.includes($user.uid)) {
    // then return to join
    goto(`/join?code=${lobbyCode}`, {
      replaceState: true,
    });
  }

  $: countdown, checkTimerExpiration();
  function checkTimerExpiration() {
    if (
      lobby != null &&
      lobbyCode != null &&
      DISPLAY_TIMERS[lobby.state] != null &&
      ((lobby.uids[0] === $user?.uid && countdown < 0) || countdown < -5)
    ) {
      clearInterval(timer);
      verifyExpiration({ code: lobbyCode });
    }
  }
</script>

<svelte:window on:beforeunload={onbeforeunload} />

<!-- I do this check because the html was rendering the Lobby component before the onmount happened due to lobby having default values -->
<!-- So the code was displaying undefined in the Lobby Component -->
<!-- We could have a loading animation until the lobby is not undefined -->
<main>
  {#if countdownVisible}
    <p class="countdown mdc-typography--headline2 {countdown <= 10 ? 'error' : ''}">
      {formatTimer(countdown)}
    </p>
  {/if}

  <div class="scroll-container">
    {#if $user == null || lobby == undefined || lobbyCode == null || (countdown < 0 && countdownVisible)}
      <div class="spinner-wraper">
        <CircularProgress indeterminate />
      </div>
    {:else if !lobby.alivePlayers.includes($user.uid)}
      <LobbyChat {lobby} {lobbyCode} />
    {:else if lobby.state === "WAIT"}
      <LobbyChat {lobby} {lobbyCode} />
      <LobbyComponent {lobbyCode} {lobby} />
    {:else if privatePlayer == undefined}
      <div class="spinner-wraper">
        <CircularProgress indeterminate />
      </div>
    {:else if lobby.state === "ROLE"}
      <Role {privatePlayer} />
    {:else if lobby.state === "PROMPT"}
      <Prompt prompt={privatePlayer.prompt} uid={$user.uid} {lobbyCode} />
    {:else if lobby.state === "CHAT"}
      <ChatRoom {lobby} {lobbyCode} isStalker={privatePlayer.stalker} />
    {:else if lobby.state === "VOTE"}
      <LobbyChat {lobby} {lobbyCode} />
      <Vote {lobby} {lobbyCode} />
    {:else if lobby.state === "RESULT"}
      <Result {lobby} />
    {:else if lobby.state === "END"}
      <WinLoss {lobbyCode} {lobby} {privatePlayer} />
    {:else}
      <p class="error">unknown lobby state: {lobby.state}</p>
    {/if}
  </div>
</main>

<style>
  main {
    height: 100%;
    display: grid;
    grid-template-areas: "header" "scroll-container";
    grid-template-rows: 64px 1fr;
  }

  main:has(.countdown) {
    grid-template-rows: 96px 1fr;
    gap: 24px;
  }

  .countdown {
    grid-area: header;
    margin: 0;
    text-align: center;
    align-self: end;
  }

  main:has(.spinner-wraper) .countdown {
    display: none;
  }

  main:has(.spinner-wraper) {
    grid-template-rows: 0 1fr;
  }

  .scroll-container {
    grid-area: scroll-container;
    overflow-y: auto;
  }

  .spinner-wraper {
    height: 100%;
    display: grid;
    place-content: center;
    grid-template-columns: 128px;
    grid-template-rows: 128px;
    place-items: stretch;
  }
</style>
