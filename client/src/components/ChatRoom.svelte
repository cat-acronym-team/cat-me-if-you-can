<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase/app";
  import { onSnapshot } from "firebase/firestore";
  import type { ChatMessage } from "$lib/firebase/firestore-types/lobby";
  import { findChatRoom } from "$lib/firebase/chat";
  import { getChatRoomMessages } from "$lib/firebase/firestore-collections";

  export let lobbyId: string;
  let chatMessages: ChatMessage[];
  onMount(async () => {
    // Query for their chatroom
    if (auth.currentUser !== null) {
      const room = await findChatRoom(lobbyId, auth.currentUser.uid);
      // subscribe the chat messages
      onSnapshot(getChatRoomMessages(room.ref), (doc) => {
        chatMessages = doc.docs.map((doc) => doc.data());
      });
    }
  });
</script>
