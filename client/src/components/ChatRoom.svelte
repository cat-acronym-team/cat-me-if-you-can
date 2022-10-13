<script lang="ts">
  import { onMount } from "svelte";
  import type { ChatRoomAssocation } from "./Chat.svelte";
  import { auth } from "$lib/firebase/app";
  import { doc, onSnapshot } from "firebase/firestore";
  import { chatRoomCollection } from "$lib/firebase/firestore-collections";
  import type { ChatMessage } from "$lib/firebase/firestore-types/lobby";

  export let chatRoomIds: ChatRoomAssocation;


  let chatMessages: ChatMessage[];
  onMount(() => {
    // figure out which one the current user is apart of
    if (auth.currentUser !== null) {
      for (const roomId in chatRoomIds) {
        if (auth.currentUser.uid in chatRoomIds[roomId]) {
          // subscribe the user to chatmessages
          onSnapshot(doc(chatRoomCollection, roomId, "chatMessages"), (doc) => {
            console.log(doc);
          });
        }
      }
    }
  });
</script>
