<script lang="ts">
  import Prompt from "$components/Prompt.svelte";
  import LobbyComponent from "$components/Lobby.svelte";
  import Chat from "$components/Chat.svelte";
  import { onSnapshot, doc, getDoc } from "firebase/firestore";
  import { onMount, onDestroy } from "svelte";
  import { getPrivatePlayerCollection, lobbyCollection } from "$lib/firebase/firestore-collections";
  import type { Lobby, PrivatePlayer } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { authStore as user } from "$stores/auth";
  import { goto } from "$app/navigation";
  import type { Unsubscribe } from "firebase/auth";

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
      privatePlayer = doc.data() as PrivatePlayer;
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
</script>

<!-- I do this check because the html was rendering the Lobby component before the onmount happened due to lobby having default values -->
<!-- So the code was displaying undefined in the Lobby Component -->
<!-- We could have a loading animation until the lobby is not undefined -->
<div>
  {#if $user == null || lobby == undefined || lobbyCode == null}
    Loading... <!-- TODO: make a Nice Loading spinner -->
  {:else if lobby.state === "WAIT"}
    <LobbyComponent {lobbyCode} {lobby} />
  {:else if privatePlayer == undefined}
    Loading... <!-- TODO: make a Nice Loading spinner -->
  {:else if lobby.state === "PROMPT"}
    <Prompt prompt={privatePlayer.prompt} uid={$user.uid} {lobbyCode} />
  {:else if lobby.state === "CHAT"}
    <Chat lobbyData={{ ...lobby, id: lobbyCode }} />
  {:else}
    unknown lobby state: {lobby.state}
  {/if}
</div>
