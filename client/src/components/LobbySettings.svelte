<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Slider from "@smui/slider";
  import FormField from "@smui/form-field";
  import { GAME_STATE_DURATIONS_MIN, GAME_STATE_DURATIONS_MAX, type Lobby } from "$lib/firebase/firestore-types/lobby";
  import { applyLobbySettings } from "$lib/firebase/firebase-functions";

  export let lobby: Lobby;
  export let lobbyCode: string;
  let errorMessage: string = "";
  let showLobbySettings = false;
  let catfishValue: number = 1;
  let promptTimerValue = lobby.lobbySettings.promptTime;
  let chatTimerValue = lobby.lobbySettings.chatTime;
  let voteTimerValue = lobby.lobbySettings.voteTime;

  const sliderLabels = new Map([
    ["PROMPT", "Prompt Timer"],
    ["CHAT", "Chat Timer"],
    ["VOTE", "Vote Timer"],
  ]);

  function timeToMinutes(time: number) {
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;

    return ": " + minutes + ":" + seconds;
  }

  async function apply(catfish: number, prompt: number, chat: number, vote: number) {
    try {
      await applyLobbySettings({
        code: lobbyCode,
        lobbySettings: {
          catfishAmount: catfish,
          promptTime: prompt,
          chatTime: chat,
          voteTime: vote,
        },
      });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
  <Dialog
    bind:open={showLobbySettings}
    fullscreen
    aria-labelledby="rules-dialog-title"
    aria-describedby="rules-dialog-content"
    ><Header>
      <Title>Lobby Settings</Title>
      <IconButton action="close" class="material-icons">close</IconButton>
    </Header>
    <Content>
      <div class="settings">
        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={catfishValue}
            min={1}
            max={3}
            step={1}
            input$aria-label="Discrete slider"
            style={"width:80%;"}
          />
          <span slot="label">Catfish Amount: {catfishValue}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={promptTimerValue}
            min={GAME_STATE_DURATIONS_MIN.PROMPT}
            max={GAME_STATE_DURATIONS_MAX.PROMPT}
            step={5}
            input$aria-label="Discrete slider"
            style={"width:80%;"}
          />
          <span slot="label">{sliderLabels.get("PROMPT")} {timeToMinutes(promptTimerValue)}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={chatTimerValue}
            min={GAME_STATE_DURATIONS_MIN.CHAT}
            max={GAME_STATE_DURATIONS_MAX.CHAT}
            step={5}
            input$aria-label="Discrete slider"
            style={"width:80%;"}
          />
          <span slot="label">{sliderLabels.get("CHAT")} {timeToMinutes(chatTimerValue)}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={voteTimerValue}
            min={GAME_STATE_DURATIONS_MIN.VOTE}
            max={GAME_STATE_DURATIONS_MAX.VOTE}
            step={5}
            input$aria-label="Discrete slider"
            style={"width:80%;"}
          />
          <span slot="label">{sliderLabels.get("VOTE")} {timeToMinutes(voteTimerValue)}</span>
        </FormField>
      </div>
    </Content>
    <Actions class="settings">
      <Button on:click={() => apply(catfishValue, promptTimerValue, chatTimerValue, voteTimerValue)} action="close"
        ><Label>Apply Settings</Label></Button
      >
    </Actions>
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
    width: 100%;
    display: grid;
    place-items: center;
  }
</style>
