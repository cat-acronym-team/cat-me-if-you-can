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

  let timer: ReturnType<typeof setInterval>;

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

    // We want them to subscribe to the lobby on mount
    unsubscribeLobby = onSnapshot(lobbyDocRef, (doc) => {
      // will change lobby to the new doc data
      const newLobby = doc.data();
      if (lobby?.state != newLobby?.state && newLobby != undefined) {
        if (newLobby.state == "PROMPT") {
          countdown = newLobby.lobbySettings.promptTime;
        } else if (newLobby.state == "CHAT") {
          countdown = newLobby.lobbySettings.chatTime;
        } else if (newLobby.state == "VOTE") {
          countdown = newLobby.lobbySettings.voteTime;
        } else {
          countdown = GAME_STATE_DURATIONS_DEFAULT[newLobby.state];
        }

        clearInterval(timer);
        timer = setInterval(() => {
          if (lobby?.expiration != undefined) {
            const diff = Math.floor((lobby.expiration.toMillis() - Date.now()) / 1000);
            countdown = diff;
          }
        }, 500);
      }
      lobby = newLobby;
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
  $: if (
    countdown <= 0 &&
    lobby != null &&
    lobby.uids[0] === $user?.uid &&
    lobbyCode != null &&
    DISPLAY_TIMERS[lobby.state] != null
  ) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
  $: if (countdown <= -5 && lobby != null && lobbyCode != null && DISPLAY_TIMERS[lobby.state] != null) {
    clearInterval(timer);
    verifyExpiration({ code: lobbyCode });
  }
</script>

<svelte:window on:beforeunload={onbeforeunload} />

<!-- I do this check because the html was rendering the Lobby component before the onmount happened due to lobby having default values -->
<!-- So the code was displaying undefined in the Lobby Component -->
<!-- We could have a loading animation until the lobby is not undefined -->
<main>
  {#if lobby != null && DISPLAY_TIMERS[lobby.state] == true}
    <p class="countdown mdc-typography--headline2 {countdown < 10 ? 'error' : ''}">
      {formatTimer(Math.max(countdown, 0))}
    </p>
  {/if}

  {#if $user == null || lobby == undefined || lobbyCode == null}
    <div class="spinner-wraper">
      <CircularProgress indeterminate />
    </div>
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
    {#if !lobby.alivePlayers.includes($user.uid)}
      <LobbyChat {lobby} {lobbyCode} />
    {/if}
    <Prompt prompt={privatePlayer.prompt} uid={$user.uid} {lobbyCode} lobbyData={lobby} />
  {:else if lobby.state === "CHAT"}
    {#if !lobby.alivePlayers.includes($user.uid)}
      <LobbyChat {lobby} {lobbyCode} />
    {/if}
    <ChatRoom
      {lobby}
      {lobbyCode}
      isStalker={privatePlayer.stalker}
      isSpectator={!lobby.alivePlayers.includes($user.uid)}
    />
  {:else if lobby.state === "VOTE"}
    <LobbyChat {lobby} {lobbyCode} />
    <Vote {lobby} {lobbyCode} />
  {:else if lobby.state === "RESULT"}
    <Result {lobby} />
  {:else if lobby.state === "END"}
    <WinLoss {lobbyCode} {lobby} {privatePlayer} />
  {:else}
    unknown lobby state: {lobby.state}
  {/if}
</main>

<style>
  .countdown {
    margin: 0;
    text-align: center;
  }

  main {
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
    padding-top: 64px;
  }

  main:has(.spinner-wraper) {
    padding: 0;
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
