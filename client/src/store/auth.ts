import { writable } from "svelte/store";
import type { User } from "firebase/auth";

export const authStore = writable<User | null>(null);
