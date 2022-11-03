import { startGame } from "./firestore-functions";

export async function findAndStartLobby(id: string) {
  // Check if code is valid
  if (id === "") {
    throw new Error("Code can't be empty!");
  }

  // make request to server
  await startGame({ code: id });
}
