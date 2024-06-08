<script lang="ts">
  import AvatarImg from "./AvatarImg.svelte";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import CharacterCounter from "@smui/textfield/character-counter";
  import IconButton from "@smui/icon-button";
  import Mdi from "$components/Mdi.svelte";
  import { mdiSend } from "@mdi/js";
  import {
    chatMessageValidator,
    type ChatMessage,
    type Lobby,
    type LobbyChatMessage,
  } from "$lib/firebase/firestore-types/lobby";
  import { avatarColors, onAvatarColors } from "$lib/avatar";
  import { authStore as user } from "$stores/auth";
  import { createEventDispatcher, tick } from "svelte";

  export let lobby: Lobby;
  export let messages: (ChatMessage | LobbyChatMessage)[];
  export let readOnly = false;

  const dispatch = createEventDispatcher<{ send: { text: string } }>();

  $: displayMessages = messages.map((message) => {
    const { avatar, displayName } = lobby.players[message.sender] ?? { avatar: 0, displayName: "Unknown Player" };
    return { ...message, avatar, displayName };
  });

  let messagesElement: HTMLElement;
  export async function scrollToBottom() {
    await tick();
    messagesElement?.scroll({ top: messagesElement.scrollHeight, behavior: "smooth" });
  }

  // when the messages change, scroll to the bottom after svelte is done updating the DOM
  $: displayMessages, scrollToBottom();

  let message = "";
  $: messageValidation = chatMessageValidator(message.trim());
  $: messageInvalid = message != "" && messageValidation?.valid === false;

  function sendMessage() {
    dispatch("send", { text: message.trim() });
    message = "";
  }

  let textfield: Textfield;
</script>

<svelte:window on:resize={scrollToBottom} />

<div class="root {readOnly ? 'read-only' : ''}">
  <div class="messages" bind:this={messagesElement}>
    <slot name="before-messages" />
    {#each displayMessages as message}
      <div
        class="message"
        class:current-user={message.sender == $user?.uid}
        class:dead={"alive" in message && !message.alive}
      >
        <div class="avatar">
          <AvatarImg avatar={message.avatar} />
        </div>
        <div class="display-name mdc-typography--body2">{message.displayName}</div>
        <div
          class="text mdc-typography--body1"
          style:background-color={avatarColors[message.avatar]}
          style:color={onAvatarColors[message.avatar]}
        >
          {message.text}
        </div>
      </div>
    {/each}
  </div>

  {#if !readOnly}
    <form on:submit|preventDefault={sendMessage}>
      <Textfield
        bind:this={textfield}
        type="text"
        variant="outlined"
        label="Chat message"
        bind:value={message}
        invalid={messageInvalid}
        input$autofocus
        input$enterkeyhint="send"
        input$maxlength={100}
      >
        <IconButton
          type="submit"
          disabled={message == "" || messageInvalid}
          slot="trailingIcon"
          on:click={() => textfield.focus()}
          aria-label="send"
        >
          <Mdi path={mdiSend} />
        </IconButton>
        <svelte:fragment slot="helper">
          <HelperText validationMsg>{messageValidation.valid ? "" : messageValidation.reason}</HelperText>
          <CharacterCounter>0 / 100</CharacterCounter>
        </svelte:fragment>
      </Textfield>
    </form>
  {/if}
</div>

<style>
  .root {
    height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
  }

  .root.read-only {
    grid-template-rows: 1fr;
  }

  .messages {
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    overflow-y: auto;
    align-content: start;
  }

  .message {
    display: grid;
    grid-template-columns: 64px auto 64px;
    grid-template-areas:
      "avatar name empty"
      "avatar text empty";
    gap: 4px;
    justify-items: start;
    justify-content: start;
  }

  .message.current-user {
    grid-template-areas:
      "empty name avatar"
      "empty text avatar";
    justify-items: end;
    justify-content: end;
  }

  .dead .text {
    filter: grayscale(50%);
  }

  .avatar {
    grid-area: avatar;
    align-self: end;
  }

  .dead .avatar {
    opacity: 0.5;
  }

  .avatar :global(img) {
    display: block;
    width: 64px;
    height: 64px;
    transform: scaleX(-1);
  }

  .current-user .avatar :global(img) {
    transform: scaleX(1);
  }

  .display-name {
    grid-area: name;
    margin: 0 12px;
  }

  .text {
    grid-area: text;
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 24px 24px 24px 0;
    word-break: break-word;
  }

  .current-user .text {
    border-radius: 24px 24px 0 24px;
  }

  form {
    --mdc-shape-small: 28px;
    --mdc-theme-text-disabled-on-light: #888888;
    display: grid;
    margin: 12px;
  }

  form :global(.mdc-text-field .mdc-icon-button) {
    align-self: center;
  }

  form :global(.mdc-text-field-helper-line) {
    padding-inline: var(--mdc-shape-small);
  }
</style>
