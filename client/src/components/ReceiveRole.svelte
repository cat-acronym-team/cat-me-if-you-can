<script lang="ts">
  import FullScreenTransition from "./FullScreenTransition.svelte";
  import type { PrivatePlayer, Role } from "$lib/firebase/firestore-types/lobby";
  import catImage from "$lib/images/role/cat.webp";
  import catfishImage from "$lib/images/role/catfish.webp";

  export let privatePlayer: PrivatePlayer;

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

  $: role = ROLES[privatePlayer.role];
</script>

<FullScreenTransition imageSrc={role.imageSrc} imageAlt="">
  <svelte:fragment slot="banner">Time to find your purrfect match!</svelte:fragment>
  <svelte:fragment slot="image-subtext">
    You are a <span class={role.name.toLowerCase()}>{role.name}</span>
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
