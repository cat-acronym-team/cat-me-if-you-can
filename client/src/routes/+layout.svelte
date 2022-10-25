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
  <div class="rules-heading">
    <h1>Rules!</h1>
  </div>
  <div class="rules-body">
    <!-- Rules Content Here -->
  </div>
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
