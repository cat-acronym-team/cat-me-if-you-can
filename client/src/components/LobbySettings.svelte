<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import type { Lobby } from "$lib/firebase/firestore-types/lobby";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let showLobbySettings = false;
</script>

<main>
  <Dialog
    bind:open={showLobbySettings}
    fullscreen
    aria-labelledby="rules-dialog-title"
    aria-describedby="rules-dialog-content"
    ><Header>
      <Title id="lobby-settings-title">Lobby Settings</Title>
      <IconButton action="close" class="material-icons">close</IconButton>
    </Header>
    <Content>
      <p>Where settings will be</p>
    </Content>
  </Dialog>
  <Button
    on:click={() => {
      showLobbySettings = true;
    }}
    class="Lobby Settings"><Label>Lobby Settings</Label></Button
  >
</main>

<style>
</style>
