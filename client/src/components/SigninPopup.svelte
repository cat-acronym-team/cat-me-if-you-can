<script lang="ts">
  import Modal from "./Modal.svelte";
  // import {createDispatc}
  export let open = false;
</script>

<Modal {open} closeOnClick={true}>
  <h1>You are not logged in!</h1>
  <h2>Would you like to continue as a guest?</h2>
  <div>
    <button>Yes, continue as guest</button>
    <button>No, log in or sign up</button>
  </div>
</Modal>

<style>
  h1,
  h2 {
    text-align: center;
  }
  div {
    display: flex;
    justify-content: space-evenly;
    width: 50%;
    margin: auto;
  }
</style>
