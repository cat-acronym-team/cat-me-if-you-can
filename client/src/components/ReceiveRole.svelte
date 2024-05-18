<script lang="ts">
  import FullScreenTransition from "./FullScreenTransition.svelte";
  import type { Lobby, PrivatePlayer, Role } from "$lib/firebase/firestore-types/lobby";
  import catImage from "$lib/images/role/cat.webp";
  import catfishImage from "$lib/images/role/catfish.webp";

  export let privatePlayer: PrivatePlayer;
  export let catfishes: string[]; // empty for cats or spectators | at least 1 for catfishes
  export let lobby: Lobby;

  const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

  const ROLES: {
    [key in Role]: { name: string; imageSrc: string; description: string };
  } = {
    CAT: {
      name: "Cat",
      imageSrc: catImage,
      description: "Use your inner Purrlock Holmes and find the catfish!",
    },
    CATFISH: {
      name: "Catfish",
      imageSrc: catfishImage,
      description: "Try to cat-mo-flauge with the rest of the cats!",
    },
    SPECTATOR: {
      name: "Spectator",
      imageSrc: "",
      description: "Please wait till the game finishes to play.",
    },
  };

  function getCatfishNames() {
    const { uids, players } = lobby;

    const catfishNames = catfishes.map((catfishId) => players[uids.indexOf(catfishId)].displayName);

    return catfishNames;
  }

  $: role = ROLES[privatePlayer.role];
</script>

<FullScreenTransition imageSrc={role.imageSrc} imageAlt="">
  <svelte:fragment slot="banner">Time to find your purrfect match!</svelte:fragment>
  <svelte:fragment slot="image-subtext">
    {#if catfishes.length < 2}
      You are a <span class={role.name.toLowerCase()}>{role.name}</span>
    {:else}
      {formatter.format(getCatfishNames() ?? "")} are the <span class={role.name.toLowerCase()}>{role.name}</span>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="description">{role.description}</svelte:fragment>
</FullScreenTransition>

<style>
  .cat,
  .catfish,
  .spectator {
    font-weight: bolder;
  }
</style>
