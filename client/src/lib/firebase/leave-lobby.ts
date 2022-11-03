import { leaveLobby } from "./firebase-functions";

export async function findAndLeaveLobby(id: string) {
  // Check if code is valid
  if (id === "") {
    throw new Error("Code can't be empty!");
  }

  // make request to server
  await leaveLobby({ code: id });
}
