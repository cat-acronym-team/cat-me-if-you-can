<script lang="ts">
  import { deleteAccount } from "$lib/firebase/auth";
  import { goto } from "$app/navigation";

  function secondChance() {
    if (confirm("Are you sure you would like to delete your account?")) {
      deleteAccount();
      goto("/");
    }
  }
</script>

<html lang="en">
  <main class="container">
    <button type="button" id="delete" class="item-delete" on:click={secondChance}>Delete Account</button>
    <button type="button" id="change-pass" class="item-change">Change Password</button>
  </main>
</html>

<style>
  body {
    margin: 0;
  }
  .container {
    display: grid;
    display: inline-grid;
    justify-content: center;
    align-items: center;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    gap: 0 0;
  }

  .item-delete {
    grid-column-start: 1;
  }

  .item-change {
    grid-column-start: 2;
  }
</style>
