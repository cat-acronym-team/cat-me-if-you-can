<script lang="ts">
  import Dialog, { Header, Title, Content } from "@smui/dialog";
  import ChatMessages from "./ChatMessages.svelte";
  import IconButton from "@smui/icon-button";
  import Mdi from "$components/Mdi.svelte";
  import { mdiClose, mdiMessageText } from "@mdi/js";
  import Badge from "@smui-extra/badge";
  import { onDestroy } from "svelte";
  import { onSnapshot, orderBy, type Query, query, where } from "firebase/firestore";
  import type { LobbyChatMessage, Lobby } from "$lib/firebase/firestore-types/lobby";
  import type { Unsubscribe } from "firebase/auth";
  import { getLobbyChatCollection } from "$lib/firebase/firestore-collections";
  import { addLobbyChatMessages } from "$lib/firebase/chat";
  import { authStore as user } from "../store/auth";

  export let lobby: Lobby;
  export let lobbyCode: string;

  let showLobbyChat = false;
  let errorMessage: string = "";
  let chatMessages: LobbyChatMessage[] = [];
  let readMessages = 0;
  let unsubscribeChatMessages: Unsubscribe | undefined = undefined;

  $: userInfo = lobby.players[$user?.uid ?? ""];

  $: lobby, onLobbyChange();
  function onLobbyChange() {
    let messageQuery: Query<LobbyChatMessage>;
    if (userInfo == undefined) {
      return;
    } else if (userInfo.alive) {
      messageQuery = query(getLobbyChatCollection(lobbyCode), where("alive", "==", true), orderBy("timestamp", "asc"));
    } else {
      messageQuery = query(getLobbyChatCollection(lobbyCode), orderBy("timestamp", "asc"));
    }
    unsubscribeChatMessages?.();
    unsubscribeChatMessages = onSnapshot(
      messageQuery,
      (collection) => {
        chatMessages = collection.docs.map((message) => message.data());
        if (showLobbyChat || readMessages > chatMessages.length) {
          readMessages = chatMessages.length;
        }
      },
      (err) => {
        console.error(err);
        errorMessage = err instanceof Error ? err.message : String(err);
      }
    );
  }

  onDestroy(() => {
    unsubscribeChatMessages?.();
  });
  async function submitMessage(message: string) {
    if (message === "") {
      return;
    }
    try {
      // add Message
      await addLobbyChatMessages(lobbyCode, $user?.uid ?? "", message, userInfo.alive);
      // clear the input
      message = "";
      // if there's an error message then clear it
      errorMessage = "";
    } catch (err) {
      // catch and display error
      console.error(err);
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  let scrollToBottom: () => Promise<void>;
</script>

<Dialog
  bind:open={showLobbyChat}
  sheet
  aria-labelledby="lobby-dialog-title"
  aria-describedby="lobby-dialog-content"
  id="lobby-chat-dialog"
  ><Header>
    <Title id="lobby-chat-title">Lobby Chat</Title>
    <IconButton action="close" aria-label="close"><Mdi path={mdiClose} /></IconButton>
  </Header>
  <Content id="lobby-dialog-content">
    <div class="lobby-chat-message">
      <ChatMessages
        {lobby}
        messages={chatMessages}
        on:send={(event) => submitMessage(event.detail.text)}
        bind:scrollToBottom
      />
    </div>
    {#if errorMessage !== ""}
      <p class="error">{errorMessage}</p>
    {/if}
  </Content>
</Dialog>

<IconButton
  on:click={() => {
    showLobbyChat = true;
    scrollToBottom();
    readMessages = chatMessages.length;
  }}
  aria-label="chat"
>
  <Mdi path={mdiMessageText} />
  {#if readMessages < chatMessages.length}
    <Badge position="inset" aria-label="unread messages count">{chatMessages.length - readMessages}</Badge>
  {/if}
</IconButton>

<style>
  .lobby-chat-message {
    height: max(256px, 100vh - 192px);
    width: clamp(256px, 100vw - 128px, 1024px);
  }

  :global(#lobby-chat-dialog .mdc-dialog__surface) {
    max-width: unset;
  }
</style>
