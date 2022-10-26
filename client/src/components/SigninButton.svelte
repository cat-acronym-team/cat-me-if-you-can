<script lang="ts">
  import Modal from "./Modal.svelte";
  import { authStore as user } from "$stores/auth";

  // check if the user is logged in with getAuth
  let openSignInModal = false;
</script>

<!-- Sign In Modal -->
<Modal
  open={openSignInModal}
  onClosed={() => {
    openSignInModal = false;
  }}
>
  <!-- TODO: Sign In Modal Content Here -->
</Modal>
<div class="account-container">
  <!-- If you are not signed in show this  -->
  {#if $user == null}
    <button
      on:click={() => {
        openSignInModal = true;
      }}
      class="account-signin">Sign in</button
    >
    <!-- If you show account and dropdown -->
  {:else}
    <button class="account-button">Account</button>
    <!-- Hover doesn't work on mobile -->
    <div class="account-content">
      <!-- TODO: Account Hover Links -->
      <a href="/settings">Account Settings</a>
      <a href="/stats">Stats</a>
      <button>Logout</button>
    </div>
  {/if}
</div>

<style>
  .account-container {
    position: relative;
    display: inline-block;
  }
  .account-signin {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-button {
    text-decoration: none;
    margin-right: 5px;
    color: red;
    background-color: #151515;
    padding: 5px;
  }
  .account-container button {
    background-color: #151515;
    color: red;
    padding: 16px;
    font-size: 16px;
    border: none;
  }

  .account-content {
    display: none;
    position: absolute;
    right: 5px;
    background-color: #151515;
    min-width: 160px;
    /* box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2); */
    z-index: 1;
  }

  .account-content a {
    color: red;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }
  .account-container:hover .account-content {
    display: block;
  }
</style>
