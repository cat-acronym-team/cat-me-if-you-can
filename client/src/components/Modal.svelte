<script lang="ts">
  // Modal Component
  // Always put this component as the top level
  //  - If not, the backdrop will be cut off

  // You will use this component as an html element
  // Put your content in bewteen the opening and closing elements
  // Examples: <Modal> Hello World! </Modal>

  // Props
  export let open: boolean;
  export let closeOnClick = false;
  export let onClosed = () => {
    // Do nothing by default
  };
</script>

<div
  class={open ? "dialog-backdrop" : "dialog-backdrop hide"}
  on:click={() => {
    if (closeOnClick) {
      return;
    }
    onClosed();
  }}
>
  <dialog {open}>
    <slot />
  </dialog>
</div>

<style>
  .dialog-backdrop {
    display: block;
    position: fixed;
    overflow: hidden;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.934);
    z-index: 1;
  }
  .hide {
    display: none;
  }

  /* Mobile Styles and Tablet Styles*/
  dialog {
    position: absolute;
    top: 20%;
    left: 15%;
    right: 15%;
    width: 60%;
    height: 40%;
    background-color: grey;
    border: 0;
    overflow: scroll;
  }

  /* Desktop */
  @media only screen and (min-width: 1000px) {
    dialog {
      top: 25%;
      width: 40%;
      height: 40%;
    }
  }
</style>
