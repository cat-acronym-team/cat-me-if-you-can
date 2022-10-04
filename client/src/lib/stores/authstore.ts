import { writable, readable } from "svelte/store";

export function getID() {
  const { subscribe, set, update } = writable(localStorage.getItem("name"));

  return {
    subscribe,
  };
}
if (typeof localStorage !== "undefined") {
  getID();
}
