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
  import Header from "$components/Header.svelte";
  import LobbySettings from "$components/LobbySettings.svelte";

  import { onSnapshot, doc, getDoc, type Unsubscribe } from "firebase/firestore";
  import { onMount, onDestroy } from "svelte";
  import { getPrivatePlayerCollection, lobbyCollection } from "$lib/firebase/firestore-collections";
  import { GAME_STATE_DURATIONS_DEFAULT, type Lobby, type PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
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

  let countdown = GAME_STATE_DURATIONS_DEFAULT.WAIT;
  $: countdownVisible = lobby != undefined && DISPLAY_TIMERS[lobby.state] == true;
  let timer: ReturnType<typeof setInterval>;

  let errorMessage: string = "";

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
    // if the user isn't signed in or not apart of this lobby then redirect them
    if ($user === null || !($user.uid in lobby.players)) {
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
    unsubscribeLobby = onSnapshot(
      lobbyDocRef,
      (doc) => {
        // will change lobby to the new doc data
        lobby = doc.data();
        clearInterval(timer);
        if (lobby != undefined) {
          timer = setInterval(updateCountdown, 500);
        }
      },
      (err) => {
        console.error(err);
        errorMessage = err instanceof Error ? err.message : String(err);
      }
    );

    // We want them to subscribe to the privatePlayer on mount
    unsubscribePrivatePlayer = onSnapshot(
      privatePlayerDocRef,
      (doc) => {
        // will change privatePlayer to the new doc data
        privatePlayer = doc.data();
      },
      (err) => {
        console.error(err);
        errorMessage = err instanceof Error ? err.message : String(err);
      }
    );
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
  $: if (lobby !== undefined && $user !== null && !($user.uid in lobby.players)) {
    // then return to join
    goto(`/join?code=${lobbyCode}`, {
      replaceState: true,
    });
  }

  $: countdown, checkTimerExpiration();
  async function checkTimerExpiration() {
    if (
      lobby != null &&
      lobbyCode != null &&
      DISPLAY_TIMERS[lobby.state] != null &&
      ((lobby.host === $user?.uid && countdown < 0) || countdown < -5)
    ) {
      clearInterval(timer);
      try {
        await verifyExpiration({ code: lobbyCode });
      } catch (error) {
        if (error instanceof Error && error.message.includes("early")) {
          console.info(error);
        } else {
          console.error(error);
        }
      }
    }
  }
</script>

<svelte:window on:beforeunload={onbeforeunload} />

<Header>
  <div class="buttons" slot="top-right">
    {#if lobbyCode !== null && lobby !== undefined && $user != null}
      {#if lobby.state === "WAIT"}
        <LobbyChat {lobby} {lobbyCode} />
        {#if $user.uid === lobby.host}
          <LobbySettings {lobby} {lobbyCode} />
        {/if}
      {:else if lobby.state === "PROMPT" || lobby.state === "CHAT"}
        {#if !lobby.players[$user.uid].alive}
          <LobbyChat {lobby} {lobbyCode} />
        {/if}
      {:else if lobby.state === "VOTE"}
        <LobbyChat {lobby} {lobbyCode} />
      {/if}
    {/if}
  </div>
</Header>

<!-- I do this check because the html was rendering the Lobby component before the onmount happened due to lobby having default values -->
<!-- So the code was displaying undefined in the Lobby Component -->
<!-- We could have a loading animation until the lobby is not undefined -->
<main class:has-countdown={countdownVisible}>
  {#if countdownVisible}
    <p class="countdown mdc-typography--headline2 {countdown <= 10 ? 'error' : ''}">
      {formatTimer(Math.max(countdown, 0))}
    </p>
  {/if}

  <div class="scroll-container">
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
    {/if}
    {#if $user == null || lobby == undefined || lobbyCode == null || (countdown < 0 && countdownVisible)}
      <div class="spinner-wraper">
        <CircularProgress indeterminate />
      </div>
    {:else if lobby.state === "WAIT"}
      <LobbyComponent {lobbyCode} {lobby} />
    {:else if privatePlayer == undefined}
      <div class="spinner-wraper">
        <CircularProgress indeterminate />
      </div>
    {:else if lobby.state === "ROLE"}
      <Role {privatePlayer} />
    {:else if lobby.state === "PROMPT"}
      {#if lobby.players[$user.uid].alive}
        <Prompt prompt={privatePlayer.prompt} uid={$user.uid} {lobbyCode} />
      {/if}
    {:else if lobby.state === "CHAT"}
      <ChatRoom {lobby} {lobbyCode} isStalker={privatePlayer.stalker} isSpectator={!lobby.players[$user.uid].alive} />
    {:else if lobby.state === "VOTE"}
      <Vote {lobby} {lobbyCode} />
    {:else if lobby.state === "RESULT"}
      <Result {lobby} />
    {:else if lobby.state === "END"}
      <WinLoss {lobby} {privatePlayer} />
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

  .buttons {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
  }

  main.has-countdown {
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
