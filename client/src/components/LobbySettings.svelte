<script lang="ts">
  import "@material/typography/mdc-typography.scss";
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import Slider from "@smui/slider";
  import FormField from "@smui/form-field";
  import {
    GAME_STATE_DURATIONS_MIN,
    GAME_STATE_DURATIONS_MAX,
    GAME_STATE_DURATIONS_DEFAULT,
  } from "$lib/firebase/firestore-types/lobby";
  import { applyLobbySettings } from "$lib/firebase/firebase-functions";

  export let lobbyCode: string;
  let errorMessage: string = "";
  let showLobbySettings = false;
  let catfishValue: number = 1;
  let promptTimerValue = GAME_STATE_DURATIONS_DEFAULT.PROMPT;
  let chatTimerValue = GAME_STATE_DURATIONS_DEFAULT.CHAT;
  let voteTimerValue = GAME_STATE_DURATIONS_DEFAULT.VOTE;

  const sliderLabels = new Map([
    ["PROMPT", "Prompt Timer"],
    ["CHAT", "Chat Timer"],
    ["VOTE", "Vote Timer"],
  ]);
  const minimumTimes = new Map([
    ["PROMPT", GAME_STATE_DURATIONS_MIN.PROMPT],
    ["CHAT", GAME_STATE_DURATIONS_MIN.CHAT],
    ["VOTE", GAME_STATE_DURATIONS_MIN.VOTE],
  ]);
  const maximumTimes = new Map([
    ["PROMPT", GAME_STATE_DURATIONS_MAX.PROMPT],
    ["CHAT", GAME_STATE_DURATIONS_MAX.CHAT],
    ["VOTE", GAME_STATE_DURATIONS_MAX.VOTE],
  ]);

  async function apply(catfish: number, prompt: number, chat: number, vote: number) {
    try {
      await applyLobbySettings({
        code: lobbyCode,
        catfishNumber: catfish,
        promptTimer: prompt,
        chatTimer: chat,
        voteTimer: vote,
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
      <Title id="lobby-settings-title">Lobby Settings</Title>
      <IconButton action="close" class="material-icons">close</IconButton>
    </Header>
    <Content>
      <p>Where settings will be</p>

      <div class="settings">
        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={catfishValue}
            min={1}
            max={3}
            step={1}
            discrete
            input$aria-label="Discrete slider"
            style={"width:100%;"}
          />
          <span slot="label">Catfish Amount</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={promptTimerValue}
            min={minimumTimes.get("PROMPT")}
            max={maximumTimes.get("PROMPT")}
            step={5}
            discrete
            input$aria-label="Discrete slider"
            style={"width:100%;"}
          />
          <span slot="label">{sliderLabels.get("PROMPT")}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={chatTimerValue}
            min={minimumTimes.get("CHAT")}
            max={maximumTimes.get("CHAT")}
            step={5}
            discrete
            input$aria-label="Discrete slider"
            style={"width:100%;"}
          />
          <span slot="label">{sliderLabels.get("CHAT")}</span>
        </FormField>

        <FormField align="end" style={"width:100%"}>
          <Slider
            bind:value={voteTimerValue}
            min={minimumTimes.get("VOTE")}
            max={maximumTimes.get("VOTE")}
            step={5}
            discrete
            input$aria-label="Discrete slider"
            style={"width:100%;"}
          />
          <span slot="label">{sliderLabels.get("VOTE")}</span>
        </FormField>

        <Button on:click={() => apply(catfishValue, promptTimerValue, chatTimerValue, voteTimerValue)} action="close"
          ><Label>Apply Settings</Label></Button
        >
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
    width: 100%;
    display: grid;
    place-items: center;
  }
</style>
