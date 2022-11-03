<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import IconButton from "@smui/icon-button";
  import Dialog, { Header, Title, Content } from "@smui/dialog";

  let showRulesDialog = false;
</script>

<Dialog
  bind:open={showRulesDialog}
  fullscreen
  aria-labelledby="rules-dialog-title"
  aria-describedby="rules-dialog-content"
>
  <Header>
    <Title id="rules-dialog-title">Rules!</Title>
    <IconButton action="close" class="material-icons">close</IconButton>
  </Header>
  <Content id="rules-dialog-content">
    <!-- TODO: Rules Content Here -->
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
    irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
    cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </Content>
</Dialog>

<div class="top-left">
  <IconButton class="material-icons" on:click={() => (showRulesDialog = true)}>help</IconButton>
</div>

<slot />

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    height: 100dvh;
  }

  .top-left {
    position: absolute;
    top: 8px;
    left: 8px;
  }
</style>
