<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Slider from "@smui/slider";
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

      <div class="settings">
        <p>This will be something for catfish number</p>
        <p>This will be something for the recieve role timer</p>
        <p>This will be something for the prompt timer</p>
        <p>This will be something for the chating timer</p>
        <p>This will be something for the voting timer</p>
        <p>This will be something for the result timer</p>
        <p>This will be something for the win/loss timer</p>
        <Button><Label>Apply Settings</Label></Button>
      </div>
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
  .settings {
    display: grid;
    place-items: center;
  }
</style>
