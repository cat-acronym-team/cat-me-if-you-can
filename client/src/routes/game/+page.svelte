<script lang="ts">
  import LobbyComponent from "$components/Lobby.svelte";
  import VoteComponent from "$components/Vote.svelte";
  import { onSnapshot, doc, getDoc } from "firebase/firestore";
  import { onMount } from "svelte";
  import { lobbyCollection } from "$lib/firebase/firestore-collections";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";
  import { page } from "$app/stores";
  import { authStore as user } from "$stores/auth";
  import { goto } from "$app/navigation";
  import type { Unsubscribe } from "firebase/auth";

  let lobbyData: Lobby;
  let code: string | null;
  // in case we want to unsub from lobby
  let unsubscribeLobby: Unsubscribe;

  onMount(async () => {
    // gets code from url search
    // the svelte magic with searchparams wasnt working
    code = $page.url.searchParams.get("code");
    if (code === null) {
      errorToJoin("Code is invalid!");
      return;
    }
    // We want to get the document immediately because if we wait there's a short delay in getting
    // the new doc from subscribing below. This makes the redirect slow since we want to check if the user isn't in this lobby
    const lobbyDoc = await getDoc(doc(lobbyCollection, code));
    if (lobbyDoc.exists() === false) {
      errorToJoin("Lobby doesnt exist!");
      return;
    }
    // gets the lobby data
    lobbyData = lobbyDoc.data() as Lobby;
    // if the user isn't signed in or not apart of this lobby then redirect them
    if ($user === null || !lobbyData.uids.includes($user.uid)) {
      // then return to join
      goto(`/join?code=${code}`, {
        replaceState: true,
      });
      return;
    }
    // We want them to subscribe to the lobby on mount
    unsubscribeLobby = onSnapshot(lobbyDoc.ref, (doc) => {
      // will change lobbyData to the new doc data
      lobbyData = doc.data() as Lobby;
    });
  });

  function errorToJoin(errorMessage: string) {
    goto("/join", {
      replaceState: true,
      state: { errorMessage: errorMessage },
    });
  }
</script>

<!-- I do this check because the html was rendering the Lobby component before the onmount happened due to lobbyData having default values -->
<!-- So the code was displaying undefined in the Lobby Component -->
<!-- We could have a loading animation until the lobbyData is not undefined -->
{#if lobbyData !== undefined && code !== null}
  <div>
    {#if lobbyData.state === "WAIT"}
      <LobbyComponent {code} players={lobbyData.players} />
    {:else if lobbyData.state === "PROMPT"}
      <p>PROPMPT PAGE</p>
    {:else if lobbyData.state === "VOTE"}
      <VoteComponent {lobbyData} {code} />
    {/if}
  </div>
{/if}
