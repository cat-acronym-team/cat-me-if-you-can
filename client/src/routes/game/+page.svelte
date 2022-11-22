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
  import type { Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { authStore as user } from "$stores/auth";
  import { goto } from "$app/navigation";

  let lobbyCode: string | null = null;

  let lobby: Lobby | undefined = undefined;
  let unsubscribeLobby: Unsubscribe | undefined = undefined;

  let privatePlayer: PrivatePlayer | undefined = undefined;
  let unsubscribePrivatePlayer: Unsubscribe | undefined = undefined;

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
      lobby = doc.data();
    });

    // We want them to subscribe to the privatePlayer on mount
    unsubscribePrivatePlayer = onSnapshot(privatePlayerDocRef, (doc) => {
      // will change privatePlayer to the new doc data
      privatePlayer = doc.data();
    });
  });

  onDestroy(() => {
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
</script>

<svelte:window on:beforeunload={onbeforeunload} />

<!-- I do this check because the html was rendering the Lobby component before the onmount happened due to lobby having default values -->
<!-- So the code was displaying undefined in the Lobby Component -->
<!-- We could have a loading animation until the lobby is not undefined -->
<main>
  {#if $user == null || lobby == undefined || lobbyCode == null}
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
    <Role {lobby} {lobbyCode} {privatePlayer} />
  {:else if lobby.state === "PROMPT"}
    <Prompt prompt={privatePlayer.prompt} uid={$user.uid} {lobbyCode} lobbyData={lobby} />
  {:else if lobby.state === "CHAT"}
    <ChatRoom {lobby} {lobbyCode} isStalker={privatePlayer.stalker} />
  {:else if lobby.state === "VOTE"}
    <LobbyChat {lobby} {lobbyCode} />
    <Vote {lobby} {lobbyCode} />
  {:else if lobby.state === "RESULT"}
    <Result {lobby} {lobbyCode} />
  {:else if lobby.state === "END"}
    <WinLoss {lobbyCode} {lobby} {privatePlayer} />
  {:else}
    unknown lobby state: {lobby.state}
  {/if}
</main>

<style>
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
