<script lang="ts">
  import QuestionMark from "$components/QuestionMark.svelte";
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

<QuestionMark
  on:clicked={() => {
    openModal = true;
  }}
/>

<slot />

<style>
  :global(body) {
    margin: 0;
  }
</style>
