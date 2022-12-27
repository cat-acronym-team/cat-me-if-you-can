<script lang="ts">
  import FullScreenTransition from "./FullScreenTransition.svelte";
  import type { PrivatePlayer, Role, Lobby } from "$lib/firebase/firestore-types/lobby";
  import { doc, getDocs, query, where } from "firebase/firestore";
  import { getPrivatePlayerCollection, lobbyCollection } from "$lib/firebase/firestore-collections";

  export let privatePlayer: PrivatePlayer;
  export let lobbyCode: string;
  export let lobby: Lobby;

  const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

  const ROLES: {
    [key in Role]: { name: string; imageSrc: string; description: string };
  } = {
    CAT: {
      name: "Cat",
      imageSrc: "/images/role/cat.webp",
      description: "Use your inner Purrlock Holmes and find the catfish!",
    },
    CATFISH: {
      name: "Catfish",
      imageSrc: "/images/role/catfish.webp",
      description: "Try to cat-mo-flauge with the rest of the cats!",
    },
    SPECTATOR: {
      name: "Spectator",
      imageSrc: "",
      description: "Please wait till the game finishes to play.",
    },
  };

  async function getCatfishes() {
    // we only want to get all the catfishes if the current player is a catfish
    if (privatePlayer.role === "CATFISH") {
      const { uids, players } = lobby;

      const lobbyDocRef = doc(lobbyCollection, lobbyCode);
      const privatePlayerCollection = getPrivatePlayerCollection(lobbyDocRef);

      const catfishQuery = query<PrivatePlayer>(privatePlayerCollection, where("role", "==", "CATFISH"));

      const catfishes = await getDocs(catfishQuery);

      const catfishNames = catfishes.docs.map((catfish) => players[uids.indexOf(catfish.id)].displayName);

      return catfishNames;
    }
    return null;
  }

  $: role = ROLES[privatePlayer.role];
  $: catfishes = getCatfishes();
</script>

<FullScreenTransition imageSrc={role.imageSrc} imageAlt="">
  <svelte:fragment slot="banner">Time to find your purrfect match!</svelte:fragment>
  <svelte:fragment slot="image-subtext">
    {#await catfishes then catfishes}
      {#if catfishes === null || catfishes.length == 1}
        You are a <span class={role.name.toLowerCase()}>{role.name}</span>
      {:else}
        {formatter.format(catfishes)} are the <span class={role.name.toLowerCase()}>{role.name}</span>
      {/if}
    {/await}
  </svelte:fragment>
  <svelte:fragment slot="description">{role.description}</svelte:fragment>
</FullScreenTransition>

<style>
  .cat,
  .catfish,
  .spectator {
    font-weight: bolder;
  }

  .cat {
    /* Material Blue 700 */
    color: #1976d2;
  }

  .catfish {
    /* Material Red 800 */
    color: #d32f2f;
  }

  .spectator {
    /* Material Blue Grey 500 */
    color: #607d8b;
  }
</style>
