<script lang="ts">
  import Prompt from "$components/prompt.svelte";
  import Lobby from "$components/Lobby.svelte";

  import { page } from "$app/stores";
  import { getPrivatePlayerCollection, lobbyCollection } from "$lib/firebase/firestore-collections";
  import { doc } from "firebase/firestore";
  import { docData } from "rxfire/firestore";
  import { auth } from "$lib/firebase/app";
  import { authState } from "rxfire/auth";
  import { mergeMap, filter, type Observable } from "rxjs";
  import type { User } from "firebase/auth";

  const lobbyCode = $page.params.gameid;

  const lobbyDocRef = doc(lobbyCollection, lobbyCode);

  const lobby$ = docData(lobbyDocRef);

  const user$ = authState(auth).pipe(filter((user) => user != null)) as Observable<User>;

  const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

  const privatePlayer$ = user$.pipe(mergeMap((user) => docData(doc(privatePlayerCollection, user.uid))));
</script>

<div>
  {#if $user$ == undefined || $lobby$ == undefined}
    Loading... <!-- TODO: make a Nice Loading spinner -->
  {:else if $lobby$.state === "WAIT"}
    <Lobby {lobbyCode} lobby={$lobby$} />
  {:else if $privatePlayer$ == undefined}
    Loading... <!-- TODO: make a Nice Loading spinner -->
  {:else if $lobby$.state === "PROMPT"}
    <Prompt prompt={$privatePlayer$.prompt} uid={$user$.uid} {lobbyCode} />
  {:else}
    unknown lobby state: {$lobby$.state}
  {/if}
</div>
