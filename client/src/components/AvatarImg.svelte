<script lang="ts">
  import { avatarAltText, avatars } from "$lib/avatar";
  import type { Avatar } from "$lib/firebase/firestore-types/lobby";

  export let avatar: 0 | Avatar;
</script>

<img src={avatars[avatar]} alt={avatarAltText[avatar]} />
