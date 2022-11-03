import { joinLobby } from "./firebase-functions";

export async function findAndJoinLobby(id: string) {
  if (id === "") {
    throw new Error("Code can't be empty");
  }

  // make request to server
  await joinLobby({ code: id });
}
