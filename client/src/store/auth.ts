import { writable } from "svelte/store";
import type { User } from "firebase/auth";
import { unsubscribe } from "$lib/firebase/app";

function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    set,
    update,
    // unsubs from the onauthchanged
    unsubFromAuth: () => unsubscribe(),
  };
}
export const authStore = createAuthStore();
