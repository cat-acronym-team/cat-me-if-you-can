<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import IconButton from "@smui/icon-button";
  import Modal from "$components/Modal.svelte";

  let openModal = false;
</script>

<Modal
  open={openModal}
  onClosed={() => {
    openModal = false;
  }}
>
  <h1 class="mdc-typography--headline1">Rules!</h1>
  <p class="mdc-typography--body1">
    <!-- TODO: Rules Content Here -->
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
    irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
    cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </p>
</Modal>

<IconButton
  class="material-icons"
  on:click={() => {
    openModal = true;
  }}>help</IconButton
>

<slot />

<style>
  :global(body) {
    margin: 0;
  }
</style>
