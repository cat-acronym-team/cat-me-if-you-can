<script lang="ts">
  import SelectAvatar from "$components/SelectAvatar.svelte";
  import type { Avatar } from "$lib/firebase/firestore-types/lobby";

  let avatar: 0 | Avatar = 0;
</script>

<h2>Account Settings</h2>

<SelectAvatar selectedAvatar={avatar} on:change={(event) => (avatar = event.detail.value)} />
