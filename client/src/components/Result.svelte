<script lang="ts">
  import FullScreenTransition from "./FullScreenTransition.svelte";
  import type { Lobby, Player } from "$lib/firebase/firestore-types/lobby";
  import { avatarAltText, avatars } from "$lib/avatar";

  export let lobby: Lobby;

  let votedOffUser: Player | undefined;
  let imageSrc: string;
  let imageAlt: string;

  $: if (lobby.votedOff != undefined && lobby.votedOff != "NONE") {
    votedOffUser = lobby.players[lobby.votedOff];
    imageSrc = avatars[votedOffUser.avatar];
    imageAlt = avatarAltText[votedOffUser.avatar];
  } else {
    votedOffUser = undefined;
    imageSrc = "";
    imageAlt = "";
  }
</script>

<FullScreenTransition {imageSrc} {imageAlt}>
  <svelte:fragment slot="image-subtext">{votedOffUser?.displayName ?? "No one"} was voted off</svelte:fragment>
</FullScreenTransition>
